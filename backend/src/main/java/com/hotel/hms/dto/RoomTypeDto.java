package com.hotel.hms.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RoomTypeDto(UUID id, String title, BigDecimal basePrice, Integer capacity,
                          String description, List<String> amenities, List<String> imageUrls) {

  public static RoomTypeDto from(com.hotel.hms.entity.RoomType t) {
    return new RoomTypeDto(t.getId(), t.getTitle(), t.getBasePrice(), t.getCapacity(),
        t.getDescription(), t.getAmenities(), t.getImageUrls());
  }
}
