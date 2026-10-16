# Hotel Management System

Spring Boot 3.3 (Java 21) + React 18 (Vite, Tailwind, TanStack Query) on Neon's serverless platform
(Postgres + Managed Auth via Better Auth + S3-compatible Object Storage).

## Structure
- `backend/` — Spring Boot resource server validating Neon Auth JWTs (JWKS), JPA + Flyway, S3 presigned uploads.
- `frontend/` — Vite + Tailwind + TanStack Query, Better-Auth-compatible token wiring.

## Backend run
```bash
cd backend
# set env from ../.env.example (DATABASE_URL pooled + sslmode=require, NEON_* keys)
./mvnw spring-boot:run
```
Flyway applies `V1__initial_schema.sql` (`ddl-auto: validate` only).

## Frontend run
```bash
cd frontend
npm install
npm run dev
```

## Deploy on Render (Blueprint)

Render has no native Java runtime, so the backend ships as Docker; the frontend
is a static site. `render.yaml` at the repo root defines both.

1. Push this repo to GitHub.
2. Render Dashboard → New → Blueprint → select the repo.
3. When prompted, enter the three secrets: `PGPASSWORD`, `NEON_S3_ACCESS_KEY`,
   `NEON_S3_SECRET_KEY` (values are in your local `.env`, which is gitignored
   and never committed).
4. If Render renames a service (name clash), update the two cross-service URLs:
   `CORS_ORIGINS` on the backend and `VITE_API_URL` on the frontend.

Notes:
- Backend health check is `/actuator/health` (public, no auth).
- Flyway runs on startup; V1/V2 are idempotent, and `baseline-on-migrate`
  handles databases seeded outside Flyway.
- Free-plan services sleep when idle; first request after idle takes ~1 min.

## Auth wiring
- Backend: `SecurityConfig` is an OAuth2 resource server; `issuer-uri`/`jwk-set-uri` point at Neon Auth.
  `role` claim → `ROLE_*`. Public: `GET /api/rooms/**`, `GET /api/room-types/**`.
- Frontend: `AuthContext` holds the Better Auth session token; axios attaches `Authorization: Bearer`.
  Replace the dev paste-JWT login with `@better-auth/react` `authClient` in production.

## Concurrency
- Booking runs in one transaction: `PESSIMISTIC_WRITE` lock on `rooms` row + `existsOverlapping`
  check on `(room_id, check_in, check_out)` + `booking_code` uniqueness. `version` columns enable
  optimistic locking on updates.
- Front-desk transitions enforce a PENDING→CONFIRMED→CHECKED_IN→CHECKED_OUT/CANCELLED state machine
  with 24h cancellation guard; checkout flips room to CLEANING, housekeeping completion flips to AVAILABLE.
