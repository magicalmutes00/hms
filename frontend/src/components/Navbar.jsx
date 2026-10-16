import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Hotel, CalendarRange, ClipboardCheck, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/book', label: 'Book' },
    { to: '/my-bookings', label: 'My bookings' },
    { to: '/front-desk', label: 'Front desk' },
    { to: '/housekeeping', label: 'Housekeeping' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <Hotel className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Hotel HMS</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-slate-600 transition hover:text-slate-900">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500">{user?.email || 'Signed in'}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
              Sign in
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-2 text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t pt-2">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
