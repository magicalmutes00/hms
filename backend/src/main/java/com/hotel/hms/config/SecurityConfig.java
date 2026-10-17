package com.hotel.hms.config;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableMethodSecurity
@lombok.RequiredArgsConstructor
public class SecurityConfig implements WebMvcConfigurer {

  @Value("${app.cors.allowed-origins:http://localhost:5173,https://hms-frontend-msgw.onrender.com}")
  private String allowedOrigins;

  private final com.hotel.hms.repository.UserProfileRepository userProfiles;

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(c -> c.configurationSource(corsSource()))
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/actuator/health/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/rooms/**", "/api/room-types/**").permitAll()
        .anyRequest().authenticated())
      .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter())));
    return http.build();
  }

  /**
   * Neon Auth JWTs carry `role: "authenticated"` (a Data-API convention), NOT our app roles.
   * Our roles live in user_profiles, so resolve authorities from the DB keyed by `sub`,
   * falling back to the claim only when it holds one of our actual roles (custom tokens).
   */
  @Bean
  JwtAuthenticationConverter jwtConverter() {
    var c = new JwtAuthenticationConverter();
    c.setJwtGrantedAuthoritiesConverter(jwt -> {
      String claim = jwt.getClaimAsString("role");
      if (claim != null) {
        String r = claim.toUpperCase().replace("ROLE_", "");
        if (r.equals("ADMIN") || r.equals("RECEPTIONIST") || r.equals("HOUSEKEEPER") || r.equals("GUEST"))
          return List.of(new SimpleGrantedAuthority("ROLE_" + r));
      }
      String role = userProfiles.findById(jwt.getSubject())
          .map(u -> u.getRole().name())
          .orElse("GUEST");
      return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    });
    c.setPrincipalClaimName("sub");
    return c;
  }

  @Bean
  CorsConfigurationSource corsSource() {
    var cfg = new CorsConfiguration();
    // Mobile/demo friendly: CORS_ORIGINS=* allows any origin WITHOUT cookies.
    // Auth uses Bearer JWTs (not cookies), so this is safe for this API.
    if ("*".equals(allowedOrigins.trim())) {
      cfg.addAllowedOriginPattern("*");
      cfg.setAllowCredentials(false);
    } else {
      cfg.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
      cfg.setAllowCredentials(true);
    }
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    var src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", cfg);
    return src;
  }
}
