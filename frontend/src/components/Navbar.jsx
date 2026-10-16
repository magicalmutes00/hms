import { Link, useNavigate } from 'react-router-dom';
import { Hotel } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center gap-6">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <Hotel size={20} /> HMS
      </Link>
      <Link to="/book" className="hover:underline">Book</Link>
      <Link to="/my-bookings" className="hover:underline">My bookings</Link>
      <Link to="/front-desk" className="hover:underline">Front Desk</Link>
      <Link to="/housekeeping" className="hover:underline">Housekeeping</Link>
      <span className="ml-auto flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-sm opacity-80">{user?.email || 'signed in'}</span>
            <button className="bg-slate-700 px-3 py-1 rounded" onClick={() => { logout(); nav('/'); }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-600 px-3 py-1 rounded">Sign in</Link>
        )}
      </span>
    </nav>
  );
}
