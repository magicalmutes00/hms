import { Link } from 'react-router-dom';
import { useAdminStats } from '../hooks/queries.js';
import { Hotel, ClipboardList, Users, Sparkles, BedDouble } from 'lucide-react';

export default function AdminDashboard() {
  const { data: s, isLoading } = useAdminStats();
  const res = s?.reservationsByStatus || {};
  const tasks = s?.tasksByStatus || {};

  const cards = [
    ['Users', s?.users ?? '—', Users, '/admin/manage'],
    ['Rooms', `${s?.roomsOccupied ?? '—'}/${s?.rooms ?? '—'} occupied`, BedDouble, '/admin/manage'],
    ['Occupancy', `${s?.occupancyPct ?? '—'}%`, Hotel, '/front-desk'],
    ['Open tasks', (tasks.TODO || 0) + (tasks.IN_PROGRESS || 0), ClipboardList, '/housekeeping'],
  ];

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
            <p className="text-slate-600">Live platform overview and management.</p>
          </div>
          <Link to="/admin/manage" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
            Manage inventory & users
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, Icon, to]) => (
            <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <Icon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-1 text-2xl font-semibold">{isLoading ? '…' : value}</p>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-medium mb-3">Reservations by status</h2>
            {isLoading ? <p className="text-slate-400">…</p> : (
              <div className="space-y-2">
                {['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'PENDING'].map((k) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{k}</span>
                    <span className="font-semibold">{res[k] || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-medium mb-3">Housekeeping by status</h2>
            {isLoading ? <p className="text-slate-400">…</p> : (
              <div className="space-y-2">
                {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((k) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{k}</span>
                    <span className="font-semibold">{tasks[k] || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-slate-400" />
            <p className="text-sm text-slate-600">
              Checkout auto-creates a high-priority cleaning task; completing it releases the room back to available.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
