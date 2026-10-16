import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useMe } from '../hooks/queries.js';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated } = useAuth();
  const { data: me, isLoading } = useMe();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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
