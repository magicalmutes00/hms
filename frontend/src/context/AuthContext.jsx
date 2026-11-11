import { createContext, useContext, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { setAuthToken } from '../api/client.js';
import { authClient, getJwtToken, getSessionJwt, isRealJwt } from '../lib/authClient.js';

// Real Neon Auth session via better-auth, with paste-JWT fallback for local dev.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [devToken, setDevToken] = useState(() => localStorage.getItem('hms.token') || '');
  const [jwtToken, setJwtToken] = useState('');
  // 'loading' until we know whether a usable backend JWT can be obtained.
  const [tokenState, setTokenState] = useState('loading');
  const { data: session } = authClient.useSession();

  // Pull the signed JWT whenever a session exists. The backend is an OAuth2
  // resource server: only JWT-shaped tokens are attached, so public browsing
  // keeps working and malformed Bearer values never cause blanket 401s.
  useEffect(() => {
    let cancelled = false;
    const settle = () => { if (!cancelled) setTokenState('ready'); };
    // A stored token that is already a real JWT needs no server round trip —
    // fetching anyway just burns a doomed /token request on every load.
    if (isRealJwt(devToken)) { setJwtToken(devToken); settle(); return () => { cancelled = true; }; }
    if (!session?.user && !devToken) {
      setJwtToken('');
      settle();
      return () => { cancelled = true; };
    }
    setTokenState('loading');
    (async () => {
      // Primary: signed EdDSA JWT from GET /token (exchanges the session cookie).
      try {
        const tok = await getJwtToken();
        if (!cancelled && isRealJwt(tok)) { setJwtToken(tok); return; }
      } catch { /* try fallbacks */ }
      // Fallback: JWT from the set-auth-jwt response header.
      try {
        const headerJwt = await getSessionJwt();
        if (!cancelled && isRealJwt(headerJwt)) { setJwtToken(headerJwt); }
      } catch { /* none */ }
    })().finally(() => { if (!cancelled) setTokenState('ready'); });
    return () => { cancelled = true; };
  }, [session?.user, devToken]);

  // Only a *real* JWT is ever handed to the HTTP client. Neon Auth's opaque
  // session token is JWT-shaped (token.signature) but the API rejects it with
  // 401, so attaching it made the first request of every page load fail.
  const token = [jwtToken, session?.session?.access_token, session?.session?.token, devToken].find(isRealJwt) || '';
  const authReady = tokenState === 'ready';
  // "Signed in" must be true while the JWT is still being fetched, or a hard
  // reload of a protected route bounces to /login before it arrives. Once we
  // know the outcome only a usable backend JWT counts — an expired or opaque
  // session token would otherwise read as signed-in while every API call 401s
  // and the role gate can never resolve.
  const isAuthenticated = !!token || (!authReady && (!!session?.user || !!devToken));
  const user = session?.user
    ? { email: session.user.email, name: session.user.name }
    : (() => { try { return JSON.parse(localStorage.getItem('hms.user') || 'null'); } catch { return null; } })();

  // useLayoutEffect, not useEffect: React flushes layout effects before the
  // children's passive effects, so the axios default header is in place before
  // any query a route mounts can fire. Otherwise the first request of a
  // freshly-loaded page races the header and 401s.
  useLayoutEffect(() => {
    setAuthToken(token);
    if (devToken) localStorage.setItem('hms.token', devToken);
    else localStorage.removeItem('hms.token');
  }, [token, devToken]);

  const login = useCallback((sessionToken, profile) => {
    setDevToken(sessionToken);
    if (profile) localStorage.setItem('hms.user', JSON.stringify(profile));
  }, []);

  const logout = useCallback(async () => {
    try { await authClient.signOut(); } catch { /* no server session */ }
    setDevToken('');
    setJwtToken('');
    localStorage.removeItem('hms.user');
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, authReady, login, logout, authClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
