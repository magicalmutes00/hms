package com.hotel.hms.dto;

import com.hotel.hms.entity.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationDto(UUID id, String bookingCode, String userId, UUID roomId,
                             String roomNumber, LocalDate checkInDate, LocalDate checkOutDate,
                             BigDecimal totalAmount, ReservationStatus status) {
  public static ReservationDto from(com.hotel.hms.entity.Reservation r) {
    return new ReservationDto(r.getId(), r.getBookingCode(),
        r.getUser() != null ? r.getUser().getId() : null,
        r.getRoom() != null ? r.getRoom().getId() : null,
        r.getRoom() != null ? r.getRoom().getRoomNumber() : null,
        r.getCheckInDate(), r.getCheckOutDate(), r.getTotalAmount(), r.getStatus());
  }
}
