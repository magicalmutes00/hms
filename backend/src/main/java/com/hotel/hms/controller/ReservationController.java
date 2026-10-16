package com.hotel.hms.controller;

import com.hotel.hms.dto.*;
import com.hotel.hms.entity.ReservationStatus;
import com.hotel.hms.service.ReservationService;
import jakarta.validation.Valid;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

  private final ReservationService service;

  @GetMapping("/mine")
  public List<ReservationDto> mine(@AuthenticationPrincipal Jwt jwt) {
    return service.myReservations(jwt.getSubject());
  }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @GetMapping
  public List<ReservationDto> all() { return service.all(); }

  @PostMapping
  public ReservationDto book(@AuthenticationPrincipal Jwt jwt,
                             @Valid @RequestBody CreateReservationRequest req) {
    return service.book(jwt.getSubject(), jwt.getClaimAsString("email"),
        jwt.getClaimAsString("name"), req);
  }

  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @PatchMapping("/{id}/status")
  public ReservationDto transition(@PathVariable UUID id, @RequestParam ReservationStatus status) {
    return service.transition(id, status);
  }

  @DeleteMapping("/by-code/{code}")
  public void cancel(@PathVariable String code, Authentication auth) {
    boolean staff = auth.getAuthorities().stream().anyMatch(a ->
        a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECEPTIONIST"));
    service.cancelByCode(code, auth.getName(), staff);
  }
}
