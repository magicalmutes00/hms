package com.hotel.hms.dto;

import com.hotel.hms.entity.RoomStatus;
import java.util.UUID;

public record RoomDto(UUID id, String roomNumber, UUID roomTypeId, String roomTypeTitle,
                      Integer floor, RoomStatus status) {
  public static RoomDto from(com.hotel.hms.entity.Room r) {
    return new RoomDto(r.getId(), r.getRoomNumber(),
        r.getRoomType() != null ? r.getRoomType().getId() : null,
        r.getRoomType() != null ? r.getRoomType().getTitle() : null,
        r.getFloor(), r.getStatus());
  }
}
