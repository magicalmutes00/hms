import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyReservations } from '../hooks/queries.js';
import { endpoints } from '../api/client.js';
import { CalendarRange, Hash, DollarSign, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function MyBookingsPage() {
  const { data: bookings = [], isLoading, isError } = useMyReservations();
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const qc = useQueryClient();

  const cancel = async (code) => {
    setError(''); setCancelling(code);
    try {
      await endpoints.cancelByCode(code);
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
    } catch (e) { setError(e.message); }
    finally { setCancelling(null); }
  };

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
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
            <p className="text-slate-600">Manage your upcoming and past stays.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            <AlertCircle className="h-4 w-4" /> Could not load bookings. Sign in with a valid Neon Auth token.
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No bookings yet. <a href="/book" className="text-blue-600 hover:underline">Book your first stay</a>.
          </div>
        ) : (
          <div className="space-y-3">
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            {bookings.map((b) => (
              <article key={b.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{b.bookingCode}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusChip(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><Hash className="h-4 w-4" /> Room {b.roomNumber}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarRange className="h-4 w-4" /> {b.checkInDate} → {b.checkOutDate}</span>
                    <span className="inline-flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> ${b.totalAmount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === 'CHECKED_OUT' && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Completed</span>
                  )}
                  {b.status === 'CANCELLED' && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"><XCircle className="h-4 w-4" /> Cancelled</span>
                  )}
                  {b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT' && (
                    <button onClick={() => cancel(b.bookingCode)} disabled={cancelling === b.bookingCode} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-40">
                      {cancelling === b.bookingCode ? 'Cancelling…' : 'Cancel booking'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
