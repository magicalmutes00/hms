package com.hotel.hms.repository;

import com.hotel.hms.entity.IdempotencyKey;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, UUID> {
  Optional<IdempotencyKey> findByUserIdAndKeyHashAndRequestPath(String userId, String keyHash, String requestPath);
}
