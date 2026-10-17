package com.hotel.hms.controller;

import com.hotel.hms.dto.*;
import com.hotel.hms.entity.RoomStatus;
import com.hotel.hms.service.RoomService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoomController {

  private final RoomService rooms;

  @GetMapping("/rooms")
  public List<RoomDto> search(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
      @RequestParam(required = false) UUID typeId,
      @RequestParam(required = false) Integer capacity) {
    return rooms.search(checkIn, checkOut, typeId, capacity);
  }

  @GetMapping("/room-types")
  public List<RoomTypeDto> types() { return rooms.allTypes(); }

  @GetMapping("/rooms/{id}/availability")
  public AvailabilityResponse availability(@PathVariable UUID id, @RequestParam String month) {
    final YearMonth ym;
    try { ym = YearMonth.parse(month); }
    catch (DateTimeParseException e) { throw new IllegalArgumentException("month must be yyyy-MM"); }
    return rooms.availability(id, ym);
  }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @PostMapping("/rooms")
  public RoomDto create(@Valid @RequestBody UpsertRoomRequest req) { return rooms.create(req); }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @PatchMapping("/rooms/{id}/status")
  public RoomDto status(@PathVariable UUID id, @RequestParam RoomStatus status) {
    return rooms.updateStatus(id, status);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/room-types")
  public RoomTypeDto createType(@Valid @RequestBody UpsertRoomTypeRequest req) {
    return rooms.createType(req);
  }

  /** Soft delete — room disappears from search; historical reservations keep their join. */
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/rooms/{id}")
  public void deleteRoom(@PathVariable UUID id) { rooms.softDelete(id); }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/room-types/{id}")
  public void deleteType(@PathVariable UUID id) { rooms.softDeleteType(id); }
}
