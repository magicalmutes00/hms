import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, KeyRound, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jwt, setJwt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, authClient } = useAuth();
  const nav = useNavigate();

  const emailLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res?.error) throw new Error(res.error.message || 'Sign-in failed');
      // Persist the returned token (cookie sessions are third-party here and
      // browsers block them; the token in the response body always works).
      const t = res?.data?.token;
      if (t) login(t, { email });
      nav('/book');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="bg-slate-50">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-6">
        <div className="grid w-full max-w-4xl gap-8 rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2 overflow-hidden">
          <div className="relative hidden md:block">
            <img
              className="h-full w-full object-cover"
              alt="Hotel room"
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <p className="mt-1 text-sm text-white/80">Sign in to manage bookings, front desk, and housekeeping.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-slate-600">Use your Neon Auth credentials or a JWT for local dev.</p>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <form onSubmit={emailLogin} className="space-y-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-400 focus:shadow-sm" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-400 focus:shadow-sm" />
              <button disabled={loading} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40">
                <LogIn className="h-4 w-4" /> {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <details className="mt-6 text-sm">
              <summary className="cursor-pointer text-slate-500">Advanced: paste session JWT (dev)</summary>
              <div className="mt-3 space-y-2">
                <textarea value={jwt} onChange={(e) => setJwt(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs outline-none" placeholder="eyJhbGciOi…" />
                <button onClick={() => { login(jwt, { email: 'dev@hotel.local' }); nav('/book'); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50">
                  <KeyRound className="h-4 w-4" /> Use JWT
                </button>
              </div>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}
