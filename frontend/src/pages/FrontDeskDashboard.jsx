import { useAllReservations } from '../hooks/queries.js';
import { endpoints } from '../api/client.js';
import { useQueryClient } from '@tanstack/react-query';

export default function FrontDeskDashboard() {
  const { data = [], isLoading } = useAllReservations();
  const qc = useQueryClient();
  const setStatus = async (id, status) => {
    await endpoints.setReservationStatus(id, status);
    qc.invalidateQueries({ queryKey: ['reservations'] });
  };
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Front Desk</h1>
      {isLoading ? <p>Loading…</p> : (
        <table className="w-full text-sm border">
          <thead><tr className="bg-slate-100">
            <th className="p-2 text-left">Code</th><th className="p-2">Room</th>
            <th className="p-2">Dates</th><th className="p-2">Total</th>
            <th className="p-2">Status</th><th className="p-2">Actions</th>
          </tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 font-mono">{r.bookingCode}</td>
                <td className="p-2">{r.roomNumber}</td>
                <td className="p-2">{r.checkInDate} → {r.checkOutDate}</td>
                <td className="p-2">${r.totalAmount}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 flex gap-1">
                  <button onClick={() => setStatus(r.id, 'CHECKED_IN')} className="bg-blue-600 text-white px-2 py-0.5 rounded">Check-in</button>
                  <button onClick={() => setStatus(r.id, 'CHECKED_OUT')} className="bg-green-600 text-white px-2 py-0.5 rounded">Check-out</button>
                  <button onClick={() => setStatus(r.id, 'CANCELLED')} className="bg-red-600 text-white px-2 py-0.5 rounded">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
