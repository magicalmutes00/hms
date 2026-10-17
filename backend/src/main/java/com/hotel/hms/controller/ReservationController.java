package com.hotel.hms.controller;

import com.hotel.hms.dto.ReservationDto;
import com.hotel.hms.service.ReservationService;
import jakarta.validation.Valid;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

  private final ReservationService service;

  @PostMapping
  public ReservationDto book(@Valid @RequestBody com.hotel.hms.dto.CreateReservationRequest req,
                             @RequestHeader(value = "Idempotency-Key", required = false) String idemKey,
                             @AuthenticationPrincipal Jwt jwt) {
    return service.book(jwt.getSubject(),
        jwt.getClaimAsString("email"),
        jwt.getClaimAsString("name"),
        req,
        idemKey);
  }

  @GetMapping("/mine")
  public List<ReservationDto> mine(@AuthenticationPrincipal Jwt jwt) {
    return service.myReservations(jwt.getSubject());
  }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @GetMapping
  public Page<ReservationDto> all(@RequestParam(defaultValue="0") int page,
                                  @RequestParam(defaultValue="20") int size,
                                  @RequestParam(required=false) com.hotel.hms.entity.ReservationStatus status) {
    return service.all(page, size, status);
  }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @PatchMapping("/{id}/status")
  public ReservationDto transition(@PathVariable UUID id, @RequestParam com.hotel.hms.entity.ReservationStatus status) {
    return service.transition(id, status);
  }
}
