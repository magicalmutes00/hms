import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

// Neon Auth (managed Better Auth). VITE_AUTH_URL is the auth base URL,
// e.g. https://<branch>.neonauth.<region>.aws.neon.tech/neondb/auth
const BASE = import.meta.env.VITE_AUTH_URL || '';
export const authClient = createAuthClient({
  baseURL: BASE,
  fetchOptions: { credentials: 'include' },
  plugins: [jwtClient()],
});

const isJwt = (t) => typeof t === 'string' && t.split('.').length === 3;

/**
 * True only for a real JOSE token: three segments whose *header* decodes to
 * {"alg":"..."}. Neon Auth's opaque session tokens (token.signature) also have
 * three segments, so a naive check accepts them — and sending one as a Bearer
 * is rejected by the API with 401 on every request.
 */
export function isRealJwt(t) {
  if (typeof t !== 'string') return false;
  const seg = t.split('.');
  if (seg.length !== 3) return false;
  try {
    const b64 = seg[0].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const header = JSON.parse(atob(padded));
    return typeof header.alg === 'string' && header.alg.length > 0;
  } catch {
    return false;
  }
}

/**
 * Fetch a signed EdDSA JWT from Neon Auth. The browser holds an HttpOnly
 * session cookie (`__Secure-neon-auth.session_token`); GET /token exchanges
 * it for a short-lived JWT. We call the endpoint directly for reliability
 * rather than depending on the better-auth plugin's shape.
 */
export async function getJwtToken() {
  try {
    const r = await fetch(`${BASE}/token`, { method: 'GET', credentials: 'include' });
    if (r.ok) {
      const { token } = await r.json();
      if (isJwt(token)) return token;
    }
  } catch { /* fall through to plugin */ }
  // Fallback: better-auth jwtClient token() endpoint.
  try {
    const { data, error } = await authClient.token();
    if (!error && isJwt(data?.token)) return data.token;
  } catch { /* no session */ }
  return '';
}

/**
 * JWT from the `set-auth-jwt` response header (better-auth jwt plugin pattern).
 * Requires the server to expose that header via CORS.
 */
export async function getSessionJwt() {
  let jwt = '';
  await authClient.getSession({
    fetchOptions: {
      onSuccess: (ctx) => {
        jwt = ctx.response.headers.get('set-auth-jwt') || '';
      },
    },
  });
  return jwt;
}
