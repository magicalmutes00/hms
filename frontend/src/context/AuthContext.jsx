import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { setAuthToken } from '../api/client.js';
import { authClient } from '../lib/authClient.js';

// Real Neon Auth session via better-auth, with paste-JWT fallback for local dev.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [devToken, setDevToken] = useState(() => localStorage.getItem('hms.token') || '');
  const { data: session } = authClient.useSession();
  const jwt = session?.session?.token || devToken || '';
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
    localStorage.removeItem('hms.user');
  }, []);

  return (
    <AuthContext.Provider value={{ token: jwt, user, isAuthenticated: !!jwt, login, logout, authClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
