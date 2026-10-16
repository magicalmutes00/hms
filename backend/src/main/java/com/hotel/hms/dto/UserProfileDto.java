package com.hotel.hms.dto;

import com.hotel.hms.entity.Role;

public record UserProfileDto(String id, String email, String fullName, String phone, Role role) {
  public static UserProfileDto from(com.hotel.hms.entity.UserProfile u) {
    return new UserProfileDto(u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), u.getRole());
  }
}
