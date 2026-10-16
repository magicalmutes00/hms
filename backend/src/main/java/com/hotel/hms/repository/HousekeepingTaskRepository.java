package com.hotel.hms.repository;

import com.hotel.hms.entity.HousekeepingTask;
import com.hotel.hms.entity.TaskStatus;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, UUID> {
  List<HousekeepingTask> findByStatusOrderByCreatedAtAsc(TaskStatus status);
  List<HousekeepingTask> findByAssignedStaffId(String staffId);
  List<HousekeepingTask> findByRoomId(UUID roomId);
}
