package com.hotel.hms.service;

import com.hotel.hms.dto.*;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;

@Service
@RequiredArgsConstructor
public class StorageService {
  private final S3Presigner presigner;
  private final S3Client s3;

  @Value("${neon.storage.bucket}") private String bucket;
  @Value("${neon.storage.public-base-url:}") private String publicBaseUrl;
  @Value("${neon.storage.presign-expiry-minutes:15}") private long expiryMinutes;

  private static String sanitize(String key) {
    String k = key.replaceAll("\\.\\.", "").replaceAll("^/+", "");
    if (k.isBlank() || k.length() > 512) throw new IllegalArgumentException("Invalid key");
    return k;
  }

  public PresignResponse presignUpload(String key, String contentType) {
    String k = sanitize(key);
    var req = PutObjectRequest.builder().bucket(bucket).key(k)
        .contentType(contentType != null ? contentType : "application/octet-stream").build();
    var sig = presigner.presignPutObject(PutObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(expiryMinutes)).putObjectRequest(req).build());
    return new PresignResponse(sig.url().toString(), k, publicUrl(k));
  }

  public PresignResponse presignDownload(String key) {
    String k = sanitize(key);
    var req = GetObjectRequest.builder().bucket(bucket).key(k).build();
    var sig = presigner.presignGetObject(GetObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(expiryMinutes)).getObjectRequest(req).build());
    return new PresignResponse(sig.url().toString(), k, publicUrl(k));
  }

  public void delete(String key) {
    s3.deleteObject(b -> b.bucket(bucket).key(sanitize(key)));
  }

  private String publicUrl(String key) {
    return publicBaseUrl == null || publicBaseUrl.isBlank() ? null : publicBaseUrl.stripTrailing() + "/" + key;
  }
}
