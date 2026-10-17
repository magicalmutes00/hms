package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;

@Entity @Table(name = "housekeeping_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HousekeepingTask {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "room_id", nullable = false)
  private Room room;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assigned_staff_id") private UserProfile assignedStaff;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
  @Builder.Default private TaskStatus status = TaskStatus.TODO;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
  @Builder.Default private TaskPriority priority = TaskPriority.MEDIUM;
  @Column(columnDefinition = "TEXT") private String notes;
  @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
  @Column(name = "updated_at") private OffsetDateTime updatedAt;
  @Column(name = "completed_at") private OffsetDateTime completedAt;

  @PrePersist void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    if (createdAt == null) createdAt = now;
    updatedAt = now;
  }
  @PreUpdate void preUpdate() { updatedAt = OffsetDateTime.now(); }
}
