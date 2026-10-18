import axios from 'axios';
import { getJwtToken } from '../lib/authClient.js';

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

// Neon Auth JWTs expire in ~15 min. On a 401 with a Bearer token, first try a
// silent refresh (GET /token exchanges the still-valid session cookie for a
// fresh JWT) and retry once — this keeps users signed in seamlessly. Only if
// refresh fails is the token cleared and the user sent to login.
let refreshing = null;
async function silentRefresh() {
  if (!refreshing) {
    refreshing = getJwtToken()
      .then((tok) => {
        if (tok && !isExpiredJwt(tok)) {
          api.defaults.headers.common.Authorization = `Bearer ${tok}`;
          return tok;
        }
        return '';
      })
      .catch(() => '')
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config;
    const hadAuth = !!cfg?.headers?.Authorization;
    if (err?.response?.status === 401 && hadAuth && !cfg._retriedRefresh) {
      cfg._retriedRefresh = true;
      const fresh = await silentRefresh();
      if (fresh) {
        cfg.headers.Authorization = `Bearer ${fresh}`;
        return api.request(cfg);
      }
    }
    // A stale/invalid Bearer poisons even public endpoints (Spring 401s any
    // request with a bad token). Retry once without it; if the anonymous call
    // succeeds the token was the problem — drop it so browsing recovers.
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
  // GET /reservations is the only paginated endpoint (Page<ReservationDto>
  // serialises to {content, totalPages, totalElements}). The Front Desk board
  // renders the whole working set and filters it client-side, so walk every
  // page and flatten — handing the board the Page object itself made
  // `data.filter(...)` throw "e.filter is not a function" and blank the page.
  allReservations: async () => {
    const size = 50;
    const items = [];
    for (let page = 0; page < 100; page += 1) {
      const { data } = await api.get('/reservations', { params: { page, size } });
      if (Array.isArray(data)) return data; // non-paginated shape: take as-is
      const chunk = Array.isArray(data?.content) ? data.content : [];
      items.push(...chunk);
      if (chunk.length === 0 || page + 1 >= (data?.totalPages ?? 1)) break;
      if (typeof data?.totalElements === 'number' && items.length >= data.totalElements) break;
    }
    return items;
  },
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
