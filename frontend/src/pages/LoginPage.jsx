import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Dev sign-in: paste a Neon Auth JWT. In production wire this to
// `authClient.signIn.*` from @better-auth/react and store the session token.
export default function LoginPage() {
  const [jwt, setJwt] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <p className="text-sm text-slate-600 mb-2">
        Neon Auth (Better Auth) issues the JWT. Paste it here for local dev, or integrate the real client.
      </p>
      <textarea value={jwt} onChange={(e) => setJwt(e.target.value)} rows={4}
        className="w-full border rounded p-2 font-mono text-xs" placeholder="eyJhbGciOi…" />
      <button onClick={() => { login(jwt, { email: 'dev@hotel.local' }); nav('/book'); }}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded w-full">Sign in</button>
    </div>
  );
}
