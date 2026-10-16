package com.hotel.hms.service;

import com.hotel.hms.dto.*;
import com.hotel.hms.entity.*;
import com.hotel.hms.exception.ResourceNotFoundException;
import com.hotel.hms.repository.*;
import java.time.OffsetDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HousekeepingService {
  private final HousekeepingTaskRepository tasks;
  private final RoomRepository rooms;
  private final UserProfileRepository users;

  @Transactional(readOnly = true)
  public List<HousekeepingTaskDto> list(TaskStatus status) {
    var list = status == null ? tasks.findAll() : tasks.findByStatusOrderByCreatedAtAsc(status);
    return list.stream().map(HousekeepingTaskDto::from).toList();
  }

  @Transactional(readOnly = true)
  public List<UserProfileDto> staff() {
    return users.findAll().stream()
        .filter(u -> u.getRole() != Role.GUEST)
        .map(UserProfileDto::from).toList();
  }

  @Transactional
  public HousekeepingTaskDto create(UpsertTaskRequest req) {
    Room room = rooms.findById(req.roomId()).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
    UserProfile staff = null;
    if (req.assignedStaffId() != null)
      staff = users.findById(req.assignedStaffId()).orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
    HousekeepingTask t = tasks.save(HousekeepingTask.builder().room(room).assignedStaff(staff)
        .status(req.status() != null ? req.status() : TaskStatus.TODO)
        .priority(req.priority() != null ? req.priority() : TaskPriority.MEDIUM)
        .notes(req.notes()).build());
    return HousekeepingTaskDto.from(t);
  }

  @Transactional
  public HousekeepingTaskDto update(UUID id, UpsertTaskRequest req) {
    HousekeepingTask t = tasks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    if (req.status() != null) {
      t.setStatus(req.status());
      t.setCompletedAt(req.status() == TaskStatus.COMPLETED ? OffsetDateTime.now() : null);
      if (req.status() == TaskStatus.COMPLETED) {
        Room room = t.getRoom();
        if (room.getStatus() == RoomStatus.CLEANING) room.setStatus(RoomStatus.AVAILABLE);
      }
    }
    if (req.priority() != null) t.setPriority(req.priority());
    if (req.notes() != null) t.setNotes(req.notes());
    if (req.assignedStaffId() != null)
      t.setAssignedStaff(users.findById(req.assignedStaffId())
          .orElseThrow(() -> new ResourceNotFoundException("Staff not found")));
    return HousekeepingTaskDto.from(t);
  }
}
