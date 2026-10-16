package com.hotel.hms.repository;

import com.hotel.hms.entity.RoomType;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {}
