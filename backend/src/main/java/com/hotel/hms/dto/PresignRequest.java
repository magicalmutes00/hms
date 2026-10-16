package com.hotel.hms.dto;

public record PresignRequest(String key, String contentType, long expiresMinutes) {}
