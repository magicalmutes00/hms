package com.hotel.hms.controller;

import com.hotel.hms.dto.*;
import com.hotel.hms.service.StorageService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

  private final StorageService storage;

  /** Staff uploads room photos to Neon Object Storage via presigned PUT. */
  @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
  @PostMapping("/presign-upload")
  public PresignResponse upload(@RequestBody PresignRequest req) {
    String key = req.key() != null ? req.key() : "rooms/" + UUID.randomUUID();
    return storage.presignUpload(key, req.contentType());
  }

  @GetMapping("/presign-download")
  public PresignResponse download(@RequestParam String key) {
    return storage.presignDownload(key);
  }
}
