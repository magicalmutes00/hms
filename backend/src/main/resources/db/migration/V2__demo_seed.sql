-- V2: idempotent demo seed (safe to re-apply; safe under Flyway baseline-on-migrate).
-- Demo user ids are placeholders; in production these match neon_auth.users.id (JWT sub).

INSERT INTO user_profiles (id, email, full_name, phone, role) VALUES
  ('demo-admin',        'admin@hotel.local',        'Ava Admin',        '+10000000001', 'ADMIN'),
  ('demo-receptionist', 'frontdesk@hotel.local',    'Rae Receptionist', '+10000000002', 'RECEPTIONIST'),
  ('demo-housekeeper',  'housekeeping@hotel.local', 'Hank Housekeeper', '+10000000003', 'HOUSEKEEPER'),
  ('demo-guest',        'guest@hotel.local',        'Gus Guest',        '+10000000004', 'GUEST')
ON CONFLICT (id) DO NOTHING;

-- Upcoming guest booking: room 101, 3 nights x 129.00 = 387.00
INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT '11111111-1111-4111-8111-111111111111', 'DEMO0001', 'demo-guest', r.id,
       CURRENT_DATE + 7, CURRENT_DATE + 10, 387.00, 'CONFIRMED'
FROM rooms r WHERE r.room_number = '101'
ON CONFLICT (id) DO NOTHING;

-- Active stay: room 201 checked in yesterday, 3 nights x 229.00 = 687.00
INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT '22222222-2222-4222-8222-222222222222', 'DEMO0002', 'demo-guest', r.id,
       CURRENT_DATE - 1, CURRENT_DATE + 2, 687.00, 'CHECKED_IN'
FROM rooms r WHERE r.room_number = '201'
ON CONFLICT (id) DO NOTHING;

-- Reflect the active stay + a checkout-clean on the room board
UPDATE rooms SET status = 'OCCUPIED' WHERE room_number = '201';
UPDATE rooms SET status = 'CLEANING' WHERE room_number = '202';

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes)
SELECT '33333333-3333-4333-8333-333333333333', r.id, 'demo-housekeeper', 'TODO', 'HIGH', 'Checkout clean for room 202'
FROM rooms r WHERE r.room_number = '202'
ON CONFLICT (id) DO NOTHING;

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes)
SELECT '44444444-4444-4444-8444-444444444444', r.id, 'demo-housekeeper', 'IN_PROGRESS', 'MEDIUM', 'Stayover tidy for room 201'
FROM rooms r WHERE r.room_number = '201'
ON CONFLICT (id) DO NOTHING;
