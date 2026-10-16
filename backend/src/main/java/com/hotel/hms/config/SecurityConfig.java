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
public class SecurityConfig implements WebMvcConfigurer {

  @Value("${app.cors.allowed-origins:http://localhost:5173}")
  private String allowedOrigins;

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(c -> c.configurationSource(corsSource()))
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/v3/api-docs/**").permitAll()
        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/rooms/**", "/api/room-types/**").permitAll()
        .anyRequest().authenticated())
      .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter())));
    return http.build();
  }

  /** Maps Neon Auth (Better Auth) JWT claims -> Spring authorities. Expects `role` claim. */
  @Bean
  JwtAuthenticationConverter jwtConverter() {
    var c = new JwtAuthenticationConverter();
    c.setJwtGrantedAuthoritiesConverter(jwt -> {
      Object role = jwt.getClaim("role");
      if (role == null) role = "GUEST";
      String r = role.toString().toUpperCase().replace("ROLE_", "");
      return List.of(new SimpleGrantedAuthority("ROLE_" + r));
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
