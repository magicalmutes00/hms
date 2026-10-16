import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Hotel, ClipboardList, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: endpoints.adminUsers });
  const { user } = useAuth();
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
            <p className="text-slate-600">Manage room inventory, users, and platform settings.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-slate-600">{user?.email || 'Admin'}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Room types</span>
              <ClipboardList className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-1 text-2xl font-semibold">Create & manage</p>
          </Link>
          <Link to="/admin" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Rooms</span>
              <Hotel className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-1 text-2xl font-semibold">Inventory</p>
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Users</span>
              <Sparkles className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-1 text-2xl font-semibold">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Access</span>
              <ShieldCheck className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-1 text-2xl font-semibold">RBAC enforced</p>
          </div>
        </div>
      </section>
    </main>
  );
}
