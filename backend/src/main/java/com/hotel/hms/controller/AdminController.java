package com.hotel.hms.controller;

import com.hotel.hms.dto.UserProfileDto;
import com.hotel.hms.entity.Role;
import com.hotel.hms.exception.ResourceNotFoundException;
import com.hotel.hms.repository.UserProfileRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

  private final UserProfileRepository users;

  @GetMapping("/users")
  public List<UserProfileDto> users() {
    return users.findAll().stream().map(UserProfileDto::from).toList();
  }

  @PatchMapping("/users/{id}/role")
  public UserProfileDto setRole(@PathVariable String id, @RequestParam Role role) {
    var u = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    u.setRole(role);
    return UserProfileDto.from(users.save(u));
  }

  @GetMapping("/stats")
  public Map<String, Long> stats() {
    return Map.of("users", users.count());
  }
}
