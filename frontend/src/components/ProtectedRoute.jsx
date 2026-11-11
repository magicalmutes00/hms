import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useMe } from '../hooks/queries.js';

function Gate() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
    </main>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const { token, authReady } = useAuth();
  const { data: me, isLoading } = useMe();
  const loc = useLocation();

  // Still resolving the session / backend JWT. Wait rather than flashing
  // /login on a hard reload of a protected route.
  if (!authReady) return <Gate />;

  // Settled, but no usable JWT — the stored session is gone.
  if (!token) {
    return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }

  if (roles) {
    if (isLoading) return <Gate />;
    if (!me || !roles.includes(me.role)) return <Navigate to="/" replace />;
  }
  return children;
}
