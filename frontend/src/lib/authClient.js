import { createAuthClient } from 'better-auth/react';

// Neon Auth (managed Better Auth). VITE_AUTH_URL is the auth base URL,
// e.g. https://<branch>.neonauth.<region>.aws.neon.tech/neondb/auth
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || '',
});
