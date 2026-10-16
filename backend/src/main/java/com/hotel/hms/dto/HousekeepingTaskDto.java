package com.hotel.hms.dto;

import com.hotel.hms.entity.*;
import java.time.OffsetDateTime;
import java.util.UUID;

public record HousekeepingTaskDto(UUID id, UUID roomId, String roomNumber, String assignedStaffId,
                                  TaskStatus status, TaskPriority priority, String notes,
                                  OffsetDateTime createdAt, OffsetDateTime completedAt) {
  public static HousekeepingTaskDto from(HousekeepingTask t) {
    return new HousekeepingTaskDto(t.getId(),
        t.getRoom() != null ? t.getRoom().getId() : null,
        t.getRoom() != null ? t.getRoom().getRoomNumber() : null,
        t.getAssignedStaff() != null ? t.getAssignedStaff().getId() : null,
        t.getStatus(), t.getPriority(), t.getNotes(), t.getCreatedAt(), t.getCompletedAt());
  }
}
