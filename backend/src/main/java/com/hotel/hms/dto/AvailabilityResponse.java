package com.hotel.hms.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AvailabilityResponse(UUID roomId, String month, List<LocalDate> bookedDates) {}
