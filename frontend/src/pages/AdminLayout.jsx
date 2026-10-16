import { Outlet, NavLink } from 'react-router-dom';
import { ShieldCheck, List, BedDouble, Users } from 'lucide-react';

export default function AdminLayout() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
          <p className="text-slate-600">Manage inventory, content, and access control.</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <NavLink to="/admin" end className={({isActive}) => `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ring-1 transition ${isActive ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}>
            <ShieldCheck className="h-4 w-4" /> Overview
          </NavLink>
          <NavLink to="/admin/manage" className={({isActive}) => `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ring-1 transition ${isActive ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}>
            <List className="h-4 w-4" /> Manage
          </NavLink>
        </div>
        <Outlet />
      </section>
    </main>
  );
}
