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
