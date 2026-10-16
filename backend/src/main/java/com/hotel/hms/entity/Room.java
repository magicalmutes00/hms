package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;

@Entity @Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(name = "room_number", nullable = false, unique = true, length = 20) private String roomNumber;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "room_type_id", nullable = false) private RoomType roomType;
  @Column(nullable = false) private Integer floor;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
  @Builder.Default private RoomStatus status = RoomStatus.AVAILABLE;
  @Version private Long version;
  @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;

  @PrePersist void prePersist() { if (createdAt == null) createdAt = OffsetDateTime.now(); }
}
