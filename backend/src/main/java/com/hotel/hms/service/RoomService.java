package com.hotel.hms.service;

import com.hotel.hms.dto.*;
import com.hotel.hms.entity.*;
import com.hotel.hms.exception.*;
import com.hotel.hms.repository.*;
import java.time.LocalDate;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomService {
  private final RoomRepository rooms;
  private final RoomTypeRepository types;

  @Transactional(readOnly = true)
  public List<RoomDto> search(LocalDate in, LocalDate out, UUID typeId, Integer capacity) {
    if (in != null && out != null && !out.isAfter(in))
      throw new IllegalArgumentException("checkOut must be after checkIn");
    if (in == null || out == null) {
      return rooms.findAll().stream().map(RoomDto::from).toList();
    }
    return rooms.findAvailable(in, out, null, typeId, capacity).stream().map(RoomDto::from).toList();
  }

  @Transactional public RoomDto create(UpsertRoomRequest req) {
    if (rooms.findByRoomNumber(req.roomNumber()).isPresent())
      throw new ConflictException("Room number exists");
    RoomType t = types.findById(req.roomTypeId()).orElseThrow(() -> new ResourceNotFoundException("RoomType not found"));
    Room r = rooms.save(Room.builder().roomNumber(req.roomNumber()).roomType(t)
        .floor(req.floor()).status(req.status() != null ? req.status() : RoomStatus.AVAILABLE).build());
    return RoomDto.from(r);
  }

  @Transactional public RoomDto updateStatus(UUID id, RoomStatus status) {
    Room r = rooms.findById(id).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
    r.setStatus(status);
    return RoomDto.from(r);
  }

  @Transactional(readOnly = true) public List<RoomTypeDto> allTypes() {
    return types.findAll().stream().map(RoomTypeDto::from).toList();
  }

  @Transactional public RoomTypeDto createType(UpsertRoomTypeRequest req) {
    RoomType t = RoomType.builder().title(req.title()).basePrice(req.basePrice())
        .capacity(req.capacity()).description(req.description())
        .amenities(req.amenities() != null ? req.amenities() : List.of())
        .imageUrls(req.imageUrls() != null ? req.imageUrls() : List.of()).build();
    return RoomTypeDto.from(types.save(t));
  }
}
