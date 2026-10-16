package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
import lombok.*;

@Entity @Table(name = "reservations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(name = "booking_code", nullable = false, unique = true, length = 12) private String bookingCode;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false)
  private UserProfile user;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "room_id", nullable = false)
  private Room room;
  @Column(name = "check_in_date", nullable = false) private LocalDate checkInDate;
  @Column(name = "check_out_date", nullable = false) private LocalDate checkOutDate;
  @Column(name = "total_amount", nullable = false, precision = 10, scale = 2) private BigDecimal totalAmount;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
  @Builder.Default private ReservationStatus status = ReservationStatus.CONFIRMED;
  @Version private Long version;
  @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
  @Column(name = "updated_at") private OffsetDateTime updatedAt;

  @PrePersist void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    if (createdAt == null) createdAt = now;
    updatedAt = now;
  }
  @PreUpdate void preUpdate() { updatedAt = OffsetDateTime.now(); }
}
