package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;

/** Replay-protection for booking: one key + user + path + payload hash = one reservation. */
@Entity
@Table(name = "idempotency_keys",
    uniqueConstraints = @UniqueConstraint(name = "uq_idemp_user_hash_path",
        columnNames = {"user_id", "key_hash", "request_path"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IdempotencyKey {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(name = "user_id", nullable = false, length = 255) private String userId;
  @Column(name = "key_hash", nullable = false, length = 64) private String keyHash;
  @Column(name = "request_path", nullable = false, length = 255) private String requestPath;
  @Column(name = "response_body", columnDefinition = "text") private String responseBody;
  @Column(name = "status_code") private Integer statusCode;
  @Column(name = "expires_at", nullable = false) private OffsetDateTime expiresAt;
  @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;

  @PrePersist void prePersist() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
    if (expiresAt == null) expiresAt = OffsetDateTime.now().plusHours(24);
  }
}
