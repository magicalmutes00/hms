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
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config;
    if (err?.response?.status === 401 && cfg && cfg.headers?.Authorization && !cfg._retriedNoAuth) {
      cfg._retriedNoAuth = true;
      delete cfg.headers.Authorization;
      try {
        return await api.request(cfg);
      } catch { /* fall through to original error */ }
    }
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message;
    return Promise.reject(new Error(msg));
  }
);

export const endpoints = {
  rooms: (params) => api.get('/rooms', { params }).then((r) => r.data),
  roomTypes: () => api.get('/room-types').then((r) => r.data),
  myReservations: () => api.get('/reservations/mine').then((r) => r.data),
  allReservations: () => api.get('/reservations').then((r) => r.data),
  book: (body) => api.post('/reservations', body).then((r) => r.data),
  cancelByCode: (code) => api.delete(`/reservations/by-code/${code}`).then((r) => r.data),
  setReservationStatus: (id, status) =>
    api.patch(`/reservations/${id}/status`, null, { params: { status } }).then((r) => r.data),
  tasks: (status) => api.get('/housekeeping', { params: status ? { status } : {} }).then((r) => r.data),
  updateTask: (id, body) => api.patch(`/housekeeping/${id}`, body).then((r) => r.data),
  createTask: (body) => api.post('/housekeeping', body).then((r) => r.data),
  presignUpload: (body) => api.post('/storage/presign-upload', body).then((r) => r.data),
  createRoomType: (body) => api.post('/room-types', body).then((r) => r.data),
  createRoom: (body) => api.post('/rooms', body).then((r) => r.data),
  adminUsers: () => api.get('/admin/users').then((r) => r.data),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, null, { params: { role } }).then((r) => r.data),
};
