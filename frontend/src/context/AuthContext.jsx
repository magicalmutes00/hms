import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { setAuthToken } from '../api/client.js';

// Wraps Neon Auth (Better Auth). In production, replace the dev stub with
// @better-auth/react `useSession` / `authClient.token()` and pass the JWT here.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hms.token') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hms.user') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    setAuthToken(token || '');
    if (token) localStorage.setItem('hms.token', token);
    else localStorage.removeItem('hms.token');
  }, [token]);

  // Dev-only login: paste a Neon Auth JWT (or use real Better Auth client).
  const login = useCallback((jwt, profile) => {
    setToken(jwt);
    setUser(profile || null);
    if (profile) localStorage.setItem('hms.user', JSON.stringify(profile));
  }, []);

  const logout = useCallback(() => {
    setToken(''); setUser(null);
    localStorage.removeItem('hms.user');
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
