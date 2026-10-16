package com.hotel.hms.controller;

import com.hotel.hms.dto.UserProfileDto;
import com.hotel.hms.entity.Role;
import com.hotel.hms.entity.UserProfile;
import com.hotel.hms.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Caller identity + role for frontend gating. Auto-provisions GUEST on first call. */
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class ProfileController {

  private final UserProfileRepository users;

  @GetMapping
  @Transactional
  public UserProfileDto me(@AuthenticationPrincipal Jwt jwt) {
    return UserProfileDto.from(users.findById(jwt.getSubject()).orElseGet(() -> users.save(
        UserProfile.builder().id(jwt.getSubject())
          .email(jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : jwt.getSubject())
          .fullName(jwt.getClaimAsString("name") != null ? jwt.getClaimAsString("name") : "Guest")
          .role(Role.GUEST).build())));
  }
}
