package com.hotel.hms.controller;

import com.hotel.hms.dto.UserProfileDto;
import com.hotel.hms.entity.Role;
import com.hotel.hms.entity.RoomStatus;
import com.hotel.hms.exception.ResourceNotFoundException;
import com.hotel.hms.repository.*;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

  private final UserProfileRepository users;
  private final RoomRepository rooms;
  private final ReservationRepository reservations;
  private final HousekeepingTaskRepository tasks;

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
  @Transactional(readOnly = true)
  public Map<String, Object> stats() {
    long totalRooms = rooms.count();
    long occupied = rooms.findByStatus(RoomStatus.OCCUPIED).size();
    long available = rooms.findByStatus(RoomStatus.AVAILABLE).size();
    Map<String, Long> resByStatus = reservations.findAll().stream()
        .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));
    Map<String, Long> tasksByStatus = tasks.findAll().stream()
        .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
    return Map.of(
        "users", users.count(),
        "rooms", totalRooms,
        "roomsOccupied", occupied,
        "roomsAvailable", available,
        "occupancyPct", totalRooms == 0 ? 0 : Math.round(occupied * 100.0 / totalRooms),
        "reservationsByStatus", resByStatus,
        "tasksByStatus", tasksByStatus);
  }
}
