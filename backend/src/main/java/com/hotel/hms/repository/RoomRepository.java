package com.hotel.hms.repository;

import com.hotel.hms.entity.Room;
import com.hotel.hms.entity.RoomStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, UUID> {
  Optional<Room> findByRoomNumber(String roomNumber);

  /** Pessimistic lock for booking path — prevents double-booking race. */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from Room r where r.id = :id")
  Optional<Room> findByIdForUpdate(@Param("id") UUID id);

  @Query("""
      select r from Room r join fetch r.roomType
      where (:status is null or r.status = :status)
        and (:typeId is null or r.roomType.id = :typeId)
        and (:capacity is null or r.roomType.capacity >= :capacity)
        and not exists (
          select 1 from Reservation res where res.room = r
          and res.status in ('PENDING','CONFIRMED','CHECKED_IN')
          and res.checkInDate < :checkOut and res.checkOutDate > :checkIn
        )
      """)
  List<Room> findAvailable(@Param("checkIn") LocalDate checkIn,
                           @Param("checkOut") LocalDate checkOut,
                           @Param("status") RoomStatus status,
                           @Param("typeId") UUID typeId,
                           @Param("capacity") Integer capacity);

  List<Room> findByStatus(RoomStatus status);
}
