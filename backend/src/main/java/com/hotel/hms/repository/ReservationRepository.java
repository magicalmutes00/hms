package com.hotel.hms.repository;

import com.hotel.hms.entity.Reservation;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
  Optional<Reservation> findByBookingCode(String bookingCode);
  List<Reservation> findByUserIdOrderByCheckInDateDesc(String userId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from Reservation r where r.id = :id")
  Optional<Reservation> findByIdForUpdate(@Param("id") UUID id);

  @Query("""
      select count(res) > 0 from Reservation res
      where res.room.id = :roomId
        and res.status in ('PENDING','CONFIRMED','CHECKED_IN')
        and (:excludeId is null or res.id <> :excludeId)
        and res.checkInDate < :checkOut and res.checkOutDate > :checkIn
      """)
  boolean existsOverlapping(@Param("roomId") UUID roomId,
                            @Param("checkIn") LocalDate checkIn,
                            @Param("checkOut") LocalDate checkOut,
                            @Param("excludeId") UUID excludeId);

  default boolean existsOverlapping(UUID roomId, LocalDate in, LocalDate out) {
    return existsOverlapping(roomId, in, out, null);
  }

  @Query("""
      select res from Reservation res
      where res.room.id = :roomId
        and res.status in ('PENDING','CONFIRMED','CHECKED_IN')
        and res.checkInDate <= :end and res.checkOutDate >= :start
      order by res.checkInDate
      """)
  List<Reservation> findActiveForRoom(@Param("roomId") UUID roomId,
                                      @Param("start") LocalDate start,
                                      @Param("end") LocalDate end);
}
