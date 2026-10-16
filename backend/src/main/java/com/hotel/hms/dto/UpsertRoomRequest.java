package com.hotel.hms.dto;

import com.hotel.hms.entity.RoomStatus;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record UpsertRoomRequest(
    @NotBlank @Size(max = 20) String roomNumber,
    @NotNull UUID roomTypeId,
    @NotNull @Min(0) Integer floor,
    RoomStatus status) {}
