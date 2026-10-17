package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;

@Entity @Table(name = "user_profiles")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE user_profiles SET deleted_at = now() WHERE id = ?")
@org.hibernate.annotations.Where(clause = "deleted_at IS NULL")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {
  @Id private String id; // neon_auth.users.id (sub claim)
  @Column(nullable = false, unique = true) private String email;
  @Column(name = "full_name", nullable = false, length = 150) private String fullName;
  private String phone;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
  @Builder.Default private Role role = Role.GUEST;
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
