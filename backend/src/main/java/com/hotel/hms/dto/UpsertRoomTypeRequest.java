package com.hotel.hms.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record UpsertRoomTypeRequest(
    @NotBlank @Size(max = 100) String title,
    @NotNull @DecimalMin("0.00") BigDecimal basePrice,
    @NotNull @Min(1) Integer capacity,
    String description,
    List<String> amenities,
    List<String> imageUrls) {}
