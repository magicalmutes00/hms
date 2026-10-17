-- V4: performance indexes for availability, boards and filtering
CREATE INDEX IF NOT EXISTS idx_res_room_dates_status ON reservations (room_id, check_in_date, check_out_date, status);
CREATE INDEX IF NOT EXISTS idx_res_user_status ON reservations (user_id, status);
CREATE INDEX IF NOT EXISTS idx_hk_status_room_staff ON housekeeping_tasks (status, room_id, assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status_type ON rooms (status, room_type_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON rooms (room_number);
