package com.hotel.hms.config;

import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

  @Value("${neon.storage.endpoint}") private String endpoint;
  @Value("${neon.storage.region:us-east-1}") private String region;
  @Value("${neon.storage.access-key}") private String accessKey;
  @Value("${neon.storage.secret-key}") private String secretKey;
  @Value("${neon.storage.force-path-style:true}") private boolean pathStyle;

  private AwsCredentialsProvider creds() {
    return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
  }

  @Bean(destroyMethod = "close")
  S3Client s3Client() {
    return S3Client.builder()
        .endpointOverride(URI.create(endpoint))
        .region(Region.of(region))
        .credentialsProvider(creds())
        .forcePathStyle(pathStyle)
        .build();
  }

  @Bean(destroyMethod = "close")
  S3Presigner s3Presigner() {
    return S3Presigner.builder()
        .endpointOverride(URI.create(endpoint))
        .region(Region.of(region))
        .credentialsProvider(creds())
        .build();
  }
}
