package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity @Table(name = "rooms")
@SQLDelete(sql = "UPDATE rooms SET deleted_at = now() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
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
  @Column(name = "updated_at") private OffsetDateTime updatedAt;
  @Column(name = "deleted_at") private OffsetDateTime deletedAt;

  @PrePersist void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    if (createdAt == null) createdAt = now;
    updatedAt = now;
  }
  @PreUpdate void preUpdate() { updatedAt = OffsetDateTime.now(); }
}
