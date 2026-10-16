import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAllReservations, useRooms } from '../hooks/queries.js';
import { endpoints } from '../api/client.js';
import { useToast } from '../components/Toast.jsx';

const FILTERS = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'PENDING'];

export default function FrontDeskDashboard() {
  const { data = [], isLoading } = useAllReservations();
  const { data: rooms = [] } = useRooms();
  const qc = useQueryClient();
  const toast = useToast();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const setStatus = async (id, status) => {
    setError(''); setBusy(`${id}:${status}`);
    try {
      await endpoints.setReservationStatus(id, status);
      toast.push(`Reservation ${status.toLowerCase().replace('_', ' ')}`);
      qc.invalidateQueries({ queryKey: ['reservations'] });
    } catch (e) { setError(e.message); toast.push(e.message, 'error'); }
    finally { setBusy(null); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const arrivals = data.filter((r) => r.checkInDate === today && r.status === 'CONFIRMED').length;
  const departures = data.filter((r) => r.checkOutDate === today && r.status === 'CHECKED_IN').length;
  const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const shown = filter === 'ALL' ? data : data.filter((r) => r.status === filter);

  const statusChip = (s) => {
    const map = {
      CONFIRMED: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      CHECKED_IN: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
      CHECKED_OUT: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
      CANCELLED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
      PENDING: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    };
    return map[s] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  };

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Front desk</h1>
          <p className="text-slate-600">Check-in/out, cancellations, and live stay board.</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Occupied rooms', `${occupied}/${rooms.length || '—'}`],
            ["Today's arrivals", arrivals],
            ["Today's departures", departures],
            ['Total bookings', data.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-sm ring-1 transition ${
                filter === f ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}>
              {f === 'ALL' ? `All (${data.length})` : `${f} (${data.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No reservations with this status.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600">Code</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600">Guest</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600">Room</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600">Dates</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600">Amount</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-mono text-xs">{r.bookingCode}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.userId || '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.roomNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.checkInDate} → {r.checkOutDate}</td>
                    <td className="px-4 py-2.5 text-slate-600">${r.totalAmount}</td>
                    <td className="px-4 py-2.5"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusChip(r.status)}`}>{r.status}</span></td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setStatus(r.id, 'CHECKED_IN')} disabled={busy === `${r.id}:CHECKED_IN`} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">Check-in</button>
                        <button onClick={() => setStatus(r.id, 'CHECKED_OUT')} disabled={busy === `${r.id}:CHECKED_OUT`} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-40">Check-out</button>
                        <button onClick={() => setStatus(r.id, 'CANCELLED')} disabled={busy === `${r.id}:CANCELLED`} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-40">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
