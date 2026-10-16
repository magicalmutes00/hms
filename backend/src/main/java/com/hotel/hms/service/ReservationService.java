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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private final ReservationRepository reservations;
  private final RoomRepository rooms;
  private final UserProfileRepository users;
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  @Value("${app.booking.max-nights:90}") private int maxNights;

  @Transactional(readOnly = true)
  public List<ReservationDto> myReservations(String userId) {
    return reservations.findByUserIdOrderByCheckInDateDesc(userId).stream().map(ReservationDto::from).toList();
  }

  @Transactional(readOnly = true)
  public List<ReservationDto> all() {
    return reservations.findAll().stream().map(ReservationDto::from).toList();
  }

  /** Defensive booking: pessimistic room lock + overlap check in one transaction. */
  @Transactional
  public ReservationDto book(String userId, String userEmail, String fullName, CreateReservationRequest req) {
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
    r.setStatus(target);
    // Keep room status in sync for front-desk readability (best-effort, not load-bearing)
    if (target == ReservationStatus.CHECKED_IN) r.getRoom().setStatus(RoomStatus.OCCUPIED);
    if (target == ReservationStatus.CHECKED_OUT) r.getRoom().setStatus(RoomStatus.CLEANING);
    if (target == ReservationStatus.CANCELLED
        && r.getCheckInDate().isBefore(LocalDate.now().plusDays(1)))
      throw new ConflictException("Cannot cancel within 24h of check-in — contact front desk");
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
