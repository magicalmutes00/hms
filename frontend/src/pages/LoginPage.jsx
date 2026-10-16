import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Primary: Neon Auth (Better Auth) email+password. Fallback: paste a session JWT (local dev).
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jwt, setJwt] = useState('');
  const [error, setError] = useState('');
  const { login, authClient } = useAuth();
  const nav = useNavigate();

  const emailLogin = async () => {
    setError('');
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res?.error) throw new Error(res.error.message || 'Sign-in failed');
      nav('/book');
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
        className="w-full border rounded p-2" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password"
        className="w-full border rounded p-2" />
      <button onClick={emailLogin} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Sign in</button>
      <details className="text-sm">
        <summary className="cursor-pointer text-slate-500">Advanced: paste session JWT (dev)</summary>
        <textarea value={jwt} onChange={(e) => setJwt(e.target.value)} rows={3}
          className="w-full border rounded p-2 font-mono text-xs mt-2" placeholder="eyJhbGciOi…" />
        <button onClick={() => { login(jwt, { email: 'dev@hotel.local' }); nav('/book'); }}
          className="mt-2 bg-slate-700 text-white px-4 py-1 rounded w-full">Use JWT</button>
      </details>
    </div>
  );
}
