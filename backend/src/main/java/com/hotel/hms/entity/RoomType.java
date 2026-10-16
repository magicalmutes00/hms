package com.hotel.hms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name = "room_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomType {
  @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
  @Column(nullable = false, length = 100) private String title;
  @Column(name = "base_price", nullable = false, precision = 10, scale = 2) private BigDecimal basePrice;
  @Column(nullable = false) private Integer capacity;
  @Column(columnDefinition = "TEXT") private String description;

  @Builder.Default @JdbcTypeCode(SqlTypes.ARRAY) @Column(columnDefinition = "text[]")
  private List<String> amenities = new ArrayList<>();
  @Column(name = "image_urls", columnDefinition = "text[]") @JdbcTypeCode(SqlTypes.ARRAY)
  @Builder.Default private List<String> imageUrls = new ArrayList<>();
  @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;

  @PrePersist void prePersist() { if (createdAt == null) createdAt = OffsetDateTime.now(); }
}
