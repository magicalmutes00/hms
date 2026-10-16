import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

// Neon Auth (managed Better Auth). VITE_AUTH_URL is the auth base URL,
// e.g. https://<branch>.neonauth.<region>.aws.neon.tech/neondb/auth
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || '',
  fetchOptions: { credentials: 'include' },
  plugins: [jwtClient()],
});

/** Fetch the signed JWT (requires the JWT plugin enabled server-side). */
export async function getJwtToken() {
  const { data, error } = await authClient.token();
  if (error) throw error;
  return data.token;
}

/**
 * JWT from the `set-auth-jwt` response header (better-auth jwt plugin pattern).
 * Requires the server to expose that header via CORS
 * (`Access-Control-Expose-Headers: set-auth-jwt`).
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
