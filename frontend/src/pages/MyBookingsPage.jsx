import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyReservations } from '../hooks/queries.js';
import { endpoints } from '../api/client.js';

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My bookings</h1>
      {isLoading ? <p>Loading…</p>
        : isError ? <p className="text-red-600">Could not load bookings. Sign in with a valid Neon Auth token.</p>
        : bookings.length === 0 ? <p className="text-slate-500">No bookings yet.</p> : (
          <div className="space-y-2">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {bookings.map((b) => (
              <div key={b.id} className="border rounded p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-mono font-bold">{b.bookingCode} · Room {b.roomNumber}</div>
                  <div className="text-sm text-slate-600">{b.checkInDate} → {b.checkOutDate} · ${b.totalAmount} · {b.status}</div>
                </div>
                {b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT' && (
                  <button onClick={() => cancel(b.bookingCode)} disabled={cancelling === b.bookingCode}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-40">
                    {cancelling === b.bookingCode ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
