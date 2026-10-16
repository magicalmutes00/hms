package com.hotel.hms.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record CreateReservationRequest(
    @NotNull UUID roomId,
    @NotNull java.time.LocalDate checkInDate,
    @NotNull java.time.LocalDate checkOutDate) {}
