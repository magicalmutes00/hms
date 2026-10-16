package com.hotel.hms.dto;

import com.hotel.hms.entity.*;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record UpsertTaskRequest(@NotNull UUID roomId, String assignedStaffId,
                                TaskStatus status, TaskPriority priority, String notes) {}
