package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;

@Entity @Table(name = "user_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {
  @Id private String id; // neon_auth.users.id (sub claim)
  @Column(nullable = false, unique = true) private String email;
  @Column(name = "full_name", nullable = false, length = 150) private String fullName;
  private String phone;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
  @Builder.Default private Role role = Role.GUEST;
  @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;

  @PrePersist void prePersist() { if (createdAt == null) createdAt = OffsetDateTime.now(); }
}
