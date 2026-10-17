import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { setAuthToken } from '../api/client.js';
import { authClient, getJwtToken, getSessionJwt } from '../lib/authClient.js';

// Real Neon Auth session via better-auth, with paste-JWT fallback for local dev.
const AuthContext = createContext(null);
const isJwt = (t) => typeof t === 'string' && t.split('.').length === 3;

export function AuthProvider({ children }) {
  const [devToken, setDevToken] = useState(() => localStorage.getItem('hms.token') || '');
  const [jwtToken, setJwtToken] = useState('');
  const { data: session } = authClient.useSession();

  // Pull the signed JWT whenever a session exists. The backend is an OAuth2
  // resource server: only JWT-shaped tokens are attached, so public browsing
  // keeps working and malformed Bearer values never cause blanket 401s.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.user) { setJwtToken(''); return; }
      // Primary: signed EdDSA JWT from GET /token (exchanges the session cookie).
      try {
        const tok = await getJwtToken();
        if (!cancelled && isJwt(tok)) { setJwtToken(tok); return; }
      } catch { /* try fallbacks */ }
      // Fallback: JWT from the set-auth-jwt response header.
      try {
        const headerJwt = await getSessionJwt();
        if (!cancelled && isJwt(headerJwt)) { setJwtToken(headerJwt); }
      } catch { /* none */ }
    })();
    return () => { cancelled = true; };
  }, [session?.user]);

  const jwt = [jwtToken, session?.session?.access_token, session?.session?.token, devToken].find(isJwt) || '';
  const user = session?.user
    ? { email: session.user.email, name: session.user.name }
    : (() => { try { return JSON.parse(localStorage.getItem('hms.user') || 'null'); } catch { return null; } })();

  useEffect(() => {
    setAuthToken(jwt);
    if (devToken) localStorage.setItem('hms.token', devToken);
    else localStorage.removeItem('hms.token');
  }, [jwt, devToken]);

  const login = useCallback((token, profile) => {
    setDevToken(token);
    if (profile) localStorage.setItem('hms.user', JSON.stringify(profile));
  }, []);

  const logout = useCallback(async () => {
    try { await authClient.signOut(); } catch { /* no server session */ }
    setDevToken('');
    setJwtToken('');
    localStorage.removeItem('hms.user');
  }, []);

  return (
    <AuthContext.Provider value={{ token: jwt, user, isAuthenticated: !!jwt, login, logout, authClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
