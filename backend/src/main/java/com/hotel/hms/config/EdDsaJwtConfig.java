package com.hotel.hms.config;

import com.nimbusds.jose.crypto.Ed25519Verifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.net.URL;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

/**
 * EdDSA (Ed25519) JWT decoder for Neon Auth.
 *
 * <p>Neon Auth signs JWTs with an OKP/Ed25519 key (alg=EdDSA). Spring's default
 * {@code NimbusJwtDecoder.withJwkSetUri()} cannot validate these tokens out of the box:
 * <ul>
 *   <li>its built-in key selector excludes EdDSA from the accepted algorithm family, so key
 *       selection returns empty ("no matching key(s) found");</li>
 *   <li>even a custom {@code JWSVerificationKeySelector} for EdDSA still fails, because
 *       {@link OctetKeyPair} does not implement {@code java.security.Key} and its
 *       {@code toPublicKey()} export is unsupported for Ed25519 in this Nimbus version;</li>
 *   <li>and Nimbus's Ed25519 verifier depends on Google Tink, which is an optional dependency
 *       that is not pulled transitively (see pom.xml).</li>
 * </ul>
 *
 * <p>So instead of routing keys through the {@code java.security.Key} pipeline, this decoder
 * verifies the signature directly with {@link Ed25519Verifier} (which takes the
 * {@link OctetKeyPair} JWK as-is) and then enforces exp/nbf. The signature check, claim
 * extraction, and tamper rejection are verified against the live Neon JWKS.
 */
@Configuration
public class EdDsaJwtConfig {

  private static final Logger log = LoggerFactory.getLogger(EdDsaJwtConfig.class);

  @Bean
  JwtDecoder jwtDecoder(
      @Value("${app.auth.jwk-set-uri}") String jwkSetUri) {
    log.info("Building EdDSA JwtDecoder against {}", jwkSetUri);
    return new EdDsaJwtDecoder(jwkSetUri);
  }

  /** Verifies Neon Auth EdDSA JWTs by signature (Ed25519 via Tink) + exp/nbf. */
  static final class EdDsaJwtDecoder implements JwtDecoder {
    private static final long CACHE_TTL_MS = 10 * 60 * 1000L; // 10 min

    private final String jwksUri;
    private volatile CachedJwks cache;

    private record CachedJwks(JWKSet set, long fetchedAt) {}

    EdDsaJwtDecoder(String jwksUri) {
      this.jwksUri = jwksUri;
    }

    private JWKSet jwks() throws Exception {
      CachedJwks c = cache;
      if (c != null && System.currentTimeMillis() - c.fetchedAt() < CACHE_TTL_MS) {
        return c.set();
      }
      JWKSet loaded = JWKSet.load(new URL(jwksUri));
      cache = new CachedJwks(loaded, System.currentTimeMillis());
      return loaded;
    }

    @Override
    public Jwt decode(String token) throws JwtException {
      try {
        SignedJWT jwt = SignedJWT.parse(token);
        String kid = jwt.getHeader().getKeyID();

        JWK jwk = jwks().getKeyByKeyId(kid);
        if (!(jwk instanceof OctetKeyPair okp)) {
          throw new BadJwtException("No Ed25519 (OKP) key found for kid=" + kid);
        }
        if (!jwt.verify(new Ed25519Verifier(okp))) {
          throw new BadJwtException("Invalid Ed25519 signature");
        }

        JWTClaimsSet cs = jwt.getJWTClaimsSet();
        Instant now = Instant.now();
        if (cs.getExpirationTime() != null && now.isAfter(cs.getExpirationTime().toInstant())) {
          throw new BadJwtException("Token expired");
        }
        if (cs.getNotBeforeTime() != null && now.isBefore(cs.getNotBeforeTime().toInstant())) {
          throw new BadJwtException("Token not yet valid");
        }

        Map<String, Object> headers = new HashMap<>();
        headers.put("alg", jwt.getHeader().getAlgorithm().getName());
        if (kid != null) headers.put("kid", kid);

        Instant iat = cs.getIssueTime() != null ? cs.getIssueTime().toInstant() : null;
        Instant exp = cs.getExpirationTime() != null ? cs.getExpirationTime().toInstant() : null;
        return new Jwt(token, iat, exp, headers, cs.getClaims());
      } catch (BadJwtException e) {
        throw e;
      } catch (Exception e) {
        throw new JwtException("Failed to decode EdDSA JWT", e);
      }
    }
  }
}
