package com.hotel.hms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lightweight in-memory token bucket per client IP, scoped to write endpoints.
 * Single-instance safe (Render free/starter runs one instance). For multi-instance
 * deployments swap for a Redis/Bucket4j limiter behind the same interface.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

  private static final int CAPACITY = 20;          // burst
  private static final int REFILL_PER_MIN = 30;    // steady state

  private static final class Bucket {
    final AtomicInteger tokens = new AtomicInteger(CAPACITY);
    volatile long lastRefillMs = System.currentTimeMillis();
  }
  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  @Override
  protected boolean shouldNotFilter(HttpServletRequest req) {
    String m = req.getMethod();
    return !(m.equals("POST") || m.equals("PATCH") || m.equals("DELETE"))
        || !req.getRequestURI().startsWith("/api/");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String ip = clientIp(req);
    long now = System.currentTimeMillis();
    Bucket b = buckets.computeIfAbsent(ip, k -> new Bucket());
    synchronized (b) {
      long elapsed = now - b.lastRefillMs;
      if (elapsed >= 1000) {
        int add = (int) (elapsed * REFILL_PER_MIN / 60_000);
        if (add > 0) {
          b.tokens.set(Math.min(CAPACITY, b.tokens.get() + add));
          b.lastRefillMs = now;
        }
      }
    }
    if (b.tokens.getAndDecrement() <= 0) {
      res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      res.setContentType("application/problem+json");
      res.getWriter().write("""
          {"type":"https://httpstatuses.org/429","title":"Too Many Requests",
           "detail":"Rate limit exceeded — retry in a minute"}""");
      return;
    }
    // opportunistic cleanup to bound memory
    if (buckets.size() > 10_000) buckets.clear();
    chain.doFilter(req, res);
  }

  private String clientIp(HttpServletRequest req) {
    String xff = req.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
    return req.getRemoteAddr();
  }
}
