import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useMe } from '../hooks/queries.js';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated } = useAuth();
  const { data: me, isLoading } = useMe();
  const nav = useNavigate();
  const loc = useLocation();
  if (!isAuthenticated) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (roles) {
    if (isLoading) {
      return (
        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        </main>
      );
    }
    if (!me || !roles.includes(me.role)) return <Navigate to="/" replace />;
  }
  return children;
}
