package com.hotel.hms.controller;

import com.hotel.hms.dto.*;
import com.hotel.hms.entity.*;
import com.hotel.hms.service.HousekeepingService;
import jakarta.validation.Valid;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/housekeeping")
@PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','HOUSEKEEPER')")
@RequiredArgsConstructor
public class HousekeepingController {

  private final HousekeepingService service;

  @GetMapping
  public List<HousekeepingTaskDto> list(@RequestParam(required = false) TaskStatus status) {
    return service.list(status);
  }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @PostMapping
  public HousekeepingTaskDto create(@Valid @RequestBody UpsertTaskRequest req) {
    return service.create(req);
  }

  @PatchMapping("/{id}")
  public HousekeepingTaskDto update(@PathVariable UUID id, @RequestBody UpsertTaskRequest req) {
    return service.update(id, req);
  }
}
