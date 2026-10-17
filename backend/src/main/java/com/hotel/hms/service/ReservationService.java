package com.hotel.hms.service;

import com.hotel.hms.dto.*;
import com.hotel.hms.entity.*;
import com.hotel.hms.exception.*;
import com.hotel.hms.repository.*;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private final ReservationRepository reservations;
  private final HousekeepingTaskRepository housekeeping;
  private final RoomRepository rooms;
  private final UserProfileRepository users;
  private final com.hotel.hms.repository.IdempotencyKeyRepository idempotencyKeys;
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final com.fasterxml.jackson.databind.ObjectMapper JSON =
      new com.fasterxml.jackson.databind.ObjectMapper()
          .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

  private static String sha256(String s) {
    try {
      var md = java.security.MessageDigest.getInstance("SHA-256");
      return java.util.HexFormat.of().formatHex(md.digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    } catch (Exception e) {
      return Integer.toHexString(s.hashCode());
    }
  }

  @Value("${app.booking.max-nights:90}") private int maxNights;

  @Transactional(readOnly = true)
  public List<ReservationDto> myReservations(String userId) {
    return reservations.findByUserIdOrderByCheckInDateDesc(userId).stream().map(ReservationDto::from).toList();
  }

  @Transactional(readOnly = true)
  public Page<ReservationDto> all(int page, int size, ReservationStatus status) {
    var s = status == null ? reservations.findAll(PageRequest.of(page, size, Sort.by("checkInDate").ascending()))
        : reservations.findByStatus(status, PageRequest.of(page, size, Sort.by("checkInDate").ascending()));
    return s.map(ReservationDto::from);
  }

  /** Defensive booking: pessimistic room lock + overlap check in one transaction. */
  @Transactional
  public ReservationDto book(String userId, String userEmail, String fullName, CreateReservationRequest req) {
    return book(userId, userEmail, fullName, req, null);
  }

  /** Same, with optional Idempotency-Key replay protection (same user+key+payload -> same reservation). */
  @Transactional
  public ReservationDto book(String userId, String userEmail, String fullName,
                             CreateReservationRequest req, String idempotencyKey) {
    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
      String hash = sha256(idempotencyKey + "||POST /api/reservations||" + req.roomId() + "|"
          + req.checkInDate() + "|" + req.checkOutDate());
      var hit = idempotencyKeys.findByUserIdAndKeyHashAndRequestPath(userId, hash, "/api/reservations");
      if (hit.isPresent() && hit.get().getResponseBody() != null) {
        try {
          return JSON.readValue(hit.get().getResponseBody(), ReservationDto.class);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ignored) {
          // corrupt replay record: fall through and re-book
        }
      }
    }
    ReservationDto dto = doBook(userId, userEmail, fullName, req);
    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
      String hash = sha256(idempotencyKey + "||POST /api/reservations||" + req.roomId() + "|"
          + req.checkInDate() + "|" + req.checkOutDate());
      try {
        idempotencyKeys.save(IdempotencyKey.builder()
            .userId(userId).keyHash(hash).requestPath("/api/reservations")
            .responseBody(JSON.writeValueAsString(dto))
            .statusCode(200).expiresAt(java.time.OffsetDateTime.now().plusHours(24)).build());
      } catch (Exception ignored) {
        // replay protection is best-effort; never fail a successful booking over it
      }
    }
    return dto;
  }

  private ReservationDto doBook(String userId, String userEmail, String fullName, CreateReservationRequest req) {
    if (!req.checkOutDate().isAfter(req.checkInDate()))
      throw new IllegalArgumentException("checkOutDate must be after checkInDate");
    long nights = ChronoUnit.DAYS.between(req.checkInDate(), req.checkOutDate());
    if (nights > maxNights) throw new IllegalArgumentException("Stay exceeds maximum of " + maxNights + " nights");
    if (req.checkInDate().isBefore(LocalDate.now()))
      throw new IllegalArgumentException("checkInDate cannot be in the past");

    UserProfile user = users.findById(userId).orElseGet(() -> users.save(
        UserProfile.builder().id(userId).email(userEmail != null ? userEmail : userId + "@unknown.local")
          .fullName(fullName != null ? fullName : "Guest").role(Role.GUEST).build()));

    Room room = rooms.findByIdForUpdate(req.roomId())
        .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
    if (room.getStatus() == RoomStatus.MAINTENANCE)
      throw new ConflictException("Room is under maintenance");

    if (reservations.existsOverlapping(room.getId(), req.checkInDate(), req.checkOutDate()))
      throw new ConflictException("Room already booked for selected dates");

    BigDecimal total = room.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(nights));
    Reservation r = Reservation.builder()
        .bookingCode(generateCode()).user(user).room(room)
        .checkInDate(req.checkInDate()).checkOutDate(req.checkOutDate())
        .totalAmount(total).status(ReservationStatus.CONFIRMED).build();
    return ReservationDto.from(reservations.save(r));
  }

  @Transactional
  public ReservationDto transition(UUID id, ReservationStatus target) {
    Reservation r = reservations.findByIdForUpdate(id)
        .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    if (!validTransition(r.getStatus(), target))
      throw new ConflictException("Illegal transition " + r.getStatus() + " -> " + target);
    if (target == ReservationStatus.CANCELLED
        && r.getCheckInDate().isBefore(LocalDate.now().plusDays(1)))
      throw new ConflictException("Cannot cancel within 24h of check-in — contact front desk");
    r.setStatus(target);
    // Keep room status in sync for front-desk readability (best-effort, not load-bearing)
    if (target == ReservationStatus.CHECKED_IN) r.getRoom().setStatus(RoomStatus.OCCUPIED);
    if (target == ReservationStatus.CHECKED_OUT) {
      r.getRoom().setStatus(RoomStatus.CLEANING);
      housekeeping.save(HousekeepingTask.builder().room(r.getRoom())
          .status(TaskStatus.TODO).priority(TaskPriority.HIGH)
          .notes("Checkout clean after " + r.getBookingCode()).build());
    }
    if (target == ReservationStatus.CANCELLED) r.getRoom().setStatus(RoomStatus.AVAILABLE);
    return ReservationDto.from(r);
  }

  @Transactional
  public void cancelByCode(String code, String requesterId, boolean staff) {
    Reservation r = reservations.findByBookingCode(code)
        .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    if (!staff && !r.getUser().getId().equals(requesterId))
      throw new ConflictException("Not your booking");
    transition(r.getId(), ReservationStatus.CANCELLED);
  }

  private boolean validTransition(ReservationStatus from, ReservationStatus to) {
    return switch (from) {
      case PENDING -> to == ReservationStatus.CONFIRMED || to == ReservationStatus.CANCELLED;
      case CONFIRMED -> to == ReservationStatus.CHECKED_IN || to == ReservationStatus.CANCELLED;
      case CHECKED_IN -> to == ReservationStatus.CHECKED_OUT;
      default -> false;
    };
  }

  private String generateCode() {
    for (int attempt = 0; attempt < 5; attempt++) {
      StringBuilder sb = new StringBuilder(8);
      for (int i = 0; i < 8; i++) sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
      if (reservations.findByBookingCode(sb.toString()).isEmpty()) return sb.toString();
    }
    return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
  }
}
