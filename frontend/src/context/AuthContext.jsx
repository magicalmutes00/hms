import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { setAuthToken } from '../api/client.js';
import { authClient, getSessionJwt } from '../lib/authClient.js';

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
      // Primary: Neon Auth stores the JWT at session.access_token (see auth-flow docs).
      const at = session?.session?.access_token;
      if (!cancelled && isJwt(at)) { setJwtToken(at); return; }
      try {
        // Fallback: JWT from the set-auth-jwt response header.
        const headerJwt = await getSessionJwt();
        if (!cancelled && isJwt(headerJwt)) { setJwtToken(headerJwt); return; }
        // Fallback: jwtClient token() endpoint.
        const { data, error } = await authClient.token();
        if (!cancelled && !error && isJwt(data?.token)) setJwtToken(data.token);
      } catch { /* fall back below */ }
    })();
    return () => { cancelled = true; };
  }, [session?.user, session?.session?.access_token]);

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
