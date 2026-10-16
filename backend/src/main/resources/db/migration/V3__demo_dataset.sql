-- V3: richer demo dataset (idempotent; safe to re-apply and under Flyway).
-- New room numbers/types/users; V1/V2 rows untouched.

INSERT INTO room_types (id, title, base_price, capacity, description, amenities, image_urls) VALUES
  ('55555555-5555-4555-8555-555555555555', 'Executive City View', 289.00, 2,
   'High-floor executive room with skyline view and work lounge',
   ARRAY['WiFi','TV','AC','Work-desk','Coffee-machine'],
   ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop']),
  ('66666666-6666-4666-8666-666666666666', 'Honeymoon Suite', 459.00, 2,
   'Romantic suite with jacuzzi and private balcony',
   ARRAY['WiFi','TV','AC','Jacuzzi','Balcony','Champagne'],
   ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop']),
  ('77777777-7777-4777-8777-777777777777', 'Accessible Comfort', 149.00, 2,
   'Step-free accessible room with adapted bathroom',
   ARRAY['WiFi','TV','AC','Step-free','Grab-rails'],
   ARRAY['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop']),
  ('88888888-8888-4888-8888-888888888888', 'Penthouse', 899.00, 4,
   'Top-floor penthouse with terrace and butler service',
   ARRAY['WiFi','TV','AC','Terrace','Butler','Kitchen'],
   ARRAY['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (id, email, full_name, phone, role) VALUES
  ('demo-guest-2', 'anita@hotel.local',  'Anita Guest',  '+10000000005', 'GUEST'),
  ('demo-guest-3', 'bob@hotel.local',    'Bob Guest',    '+10000000006', 'GUEST'),
  ('demo-guest-4', 'cara@hotel.local',   'Cara Guest',   '+10000000007', 'GUEST'),
  ('demo-guest-5', 'dev@hotel.local',    'Dev Guest',    '+10000000008', 'GUEST')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, room_number, room_type_id, floor, status) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '103', (SELECT id FROM room_types WHERE title = 'Standard Double'), 1, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '104', (SELECT id FROM room_types WHERE title = 'Standard Double'), 1, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '105', (SELECT id FROM room_types WHERE title = 'Accessible Comfort'), 1, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '203', (SELECT id FROM room_types WHERE title = 'Deluxe King'), 2, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '204', (SELECT id FROM room_types WHERE title = 'Deluxe King'), 2, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '302', (SELECT id FROM room_types WHERE title = 'Family Suite'), 3, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', '303', (SELECT id FROM room_types WHERE title = 'Family Suite'), 3, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8', '401', (SELECT id FROM room_types WHERE title = 'Executive City View'), 4, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9', '402', (SELECT id FROM room_types WHERE title = 'Executive City View'), 4, 'AVAILABLE'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10', '403', (SELECT id FROM room_types WHERE title = 'Honeymoon Suite'), 4, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- Past stays (checked out)
INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'DEMO0003', 'demo-guest-2', r.id,
       CURRENT_DATE - 10, CURRENT_DATE - 7, 387.00, 'CHECKED_OUT'
FROM rooms r WHERE r.room_number = '103'
ON CONFLICT (id) DO NOTHING;

INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'DEMO0004', 'demo-guest-3', r.id,
       CURRENT_DATE - 5, CURRENT_DATE - 2, 687.00, 'CHECKED_OUT'
FROM rooms r WHERE r.room_number = '203'
ON CONFLICT (id) DO NOTHING;

-- Current stays
INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'DEMO0005', 'demo-guest-2', r.id,
       CURRENT_DATE - 1, CURRENT_DATE + 3, 1396.00, 'CHECKED_IN'
FROM rooms r WHERE r.room_number = '302'
ON CONFLICT (id) DO NOTHING;

INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb4-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'DEMO0006', 'demo-guest-4', r.id,
       CURRENT_DATE, CURRENT_DATE + 2, 578.00, 'CHECKED_IN'
FROM rooms r WHERE r.room_number = '401'
ON CONFLICT (id) DO NOTHING;

-- Upcoming
INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb5-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'DEMO0007', 'demo-guest-3', r.id,
       CURRENT_DATE + 5, CURRENT_DATE + 8, 687.00, 'CONFIRMED'
FROM rooms r WHERE r.room_number = '204'
ON CONFLICT (id) DO NOTHING;

INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb6-bbbb-4bbb-8bbb-bbbbbbbbbbb6', 'DEMO0008', 'demo-guest-5', r.id,
       CURRENT_DATE + 7, CURRENT_DATE + 9, 578.00, 'CONFIRMED'
FROM rooms r WHERE r.room_number = '402'
ON CONFLICT (id) DO NOTHING;

INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb7-bbbb-4bbb-8bbb-bbbbbbbbbbb7', 'DEMO0009', 'demo-guest-4', r.id,
       CURRENT_DATE + 12, CURRENT_DATE + 15, 1047.00, 'CONFIRMED'
FROM rooms r WHERE r.room_number = '303'
ON CONFLICT (id) DO NOTHING;

INSERT INTO reservations (id, booking_code, user_id, room_id, check_in_date, check_out_date, total_amount, status)
SELECT 'bbbbbbb8-bbbb-4bbb-8bbb-bbbbbbbbbbb8', 'DEMO0010', 'demo-guest-5', r.id,
       CURRENT_DATE + 3, CURRENT_DATE + 5, 258.00, 'CANCELLED'
FROM rooms r WHERE r.room_number = '104'
ON CONFLICT (id) DO NOTHING;

UPDATE rooms SET status = 'OCCUPIED' WHERE room_number IN ('302', '401');

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes, completed_at)
SELECT 'ccccccc5-cccc-4ccc-8ccc-ccccccccccc5', r.id, 'demo-housekeeper', 'COMPLETED', 'LOW', 'Post-stay deep clean', now()
FROM rooms r WHERE r.room_number = '103'
ON CONFLICT (id) DO NOTHING;

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes, completed_at)
SELECT 'ccccccc6-cccc-4ccc-8ccc-ccccccccccc6', r.id, 'demo-housekeeper', 'COMPLETED', 'MEDIUM', 'Post-stay deep clean', now()
FROM rooms r WHERE r.room_number = '203'
ON CONFLICT (id) DO NOTHING;

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes)
SELECT 'ccccccc7-cccc-4ccc-8ccc-ccccccccccc7', r.id, 'demo-housekeeper', 'IN_PROGRESS', 'MEDIUM', 'Stayover tidy for occupied suite'
FROM rooms r WHERE r.room_number = '302'
ON CONFLICT (id) DO NOTHING;

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes)
SELECT 'ccccccc8-cccc-4ccc-8ccc-ccccccccccc8', r.id, 'demo-housekeeper', 'TODO', 'HIGH', 'Turndown service'
FROM rooms r WHERE r.room_number = '401'
ON CONFLICT (id) DO NOTHING;

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes)
SELECT 'ccccccc9-cccc-4ccc-8ccc-ccccccccccc9', r.id, NULL, 'TODO', 'LOW', 'Pre-arrival inspection'
FROM rooms r WHERE r.room_number = '204'
ON CONFLICT (id) DO NOTHING;

INSERT INTO housekeeping_tasks (id, room_id, assigned_staff_id, status, priority, notes)
SELECT 'cccccc10-cccc-4ccc-8ccc-cccccccccc10', r.id, NULL, 'TODO', 'MEDIUM', 'Pre-arrival inspection'
FROM rooms r WHERE r.room_number = '402'
ON CONFLICT (id) DO NOTHING;
