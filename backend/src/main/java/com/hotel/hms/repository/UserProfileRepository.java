package com.hotel.hms.repository;

import com.hotel.hms.entity.UserProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
  Optional<UserProfile> findByEmail(String email);
  boolean existsByEmail(String email);
}
