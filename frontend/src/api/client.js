import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

export function setAuthToken(token) {
  if (token && !isExpiredJwt(token)) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/** True when the JWT's exp claim is in the past (or payload unreadable as JWT). */
function isExpiredJwt(token) {
  try {
    const seg = token.split('.');
    if (seg.length !== 3) return true;
    const payload = JSON.parse(atob(seg[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !!payload.exp && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// A stale/invalid Bearer poisons even public endpoints (Spring 401s any
// request with a bad token). Retry once without it; if the anonymous call
// succeeds the token was the problem — drop it so browsing recovers.
// If the call still 401s WITH a token attached, the token itself is rejected
// (bad signature / expired / wrong issuer): clear it and send the user back
// to login instead of stranding them on error screens.
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config;
    const hadAuth = !!cfg?.headers?.Authorization;
    if (err?.response?.status === 401 && hadAuth && !cfg._retriedNoAuth) {
      cfg._retriedNoAuth = true;
      delete cfg.headers.Authorization;
      try {
        return await api.request(cfg);
      } catch { /* fall through to handling below */ }
    }
    if (err?.response?.status === 401 && hadAuth) {
      delete api.defaults.headers.common.Authorization;
      localStorage.removeItem('hms.token');
      localStorage.removeItem('hms.user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message;
    return Promise.reject(new Error(msg));
  }
);

export const endpoints = {
  me: () => api.get('/me').then((r) => r.data),
  rooms: (params) => api.get('/rooms', { params }).then((r) => r.data),
  roomTypes: () => api.get('/room-types').then((r) => r.data),
  availability: (roomId, month) => api.get(`/rooms/${roomId}/availability`, { params: { month } }).then((r) => r.data),
  myReservations: () => api.get('/reservations/mine').then((r) => r.data),
  allReservations: () => api.get('/reservations').then((r) => r.data),
  book: (body, idempotencyKey) => api.post('/reservations', body, {
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  }).then((r) => r.data),
  cancelByCode: (code) => api.delete(`/reservations/by-code/${code}`).then((r) => r.data),
  setReservationStatus: (id, status) =>
    api.patch(`/reservations/${id}/status`, null, { params: { status } }).then((r) => r.data),
  tasks: (status) => api.get('/housekeeping', { params: status ? { status } : {} }).then((r) => r.data),
  staff: () => api.get('/housekeeping/staff').then((r) => r.data),
  updateTask: (id, body) => api.patch(`/housekeeping/${id}`, body).then((r) => r.data),
  createTask: (body) => api.post('/housekeeping', body).then((r) => r.data),
  presignUpload: (body) => api.post('/storage/presign-upload', body).then((r) => r.data),
  deleteObject: (key) => api.delete('/storage/object', { params: { key } }).then((r) => r.data),
  adminStats: () => api.get('/admin/stats').then((r) => r.data),
  createRoomType: (body) => api.post('/room-types', body).then((r) => r.data),
  createRoom: (body) => api.post('/rooms', body).then((r) => r.data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`).then((r) => r.data),
  deleteRoomType: (id) => api.delete(`/room-types/${id}`).then((r) => r.data),
  adminUsers: () => api.get('/admin/users').then((r) => r.data),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, null, { params: { role } }).then((r) => r.data),
};
