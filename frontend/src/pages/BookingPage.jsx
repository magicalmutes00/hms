import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useRooms, useBook } from '../hooks/queries.js';
import Modal from '../components/Modal.jsx';
import BookingCalendar from '../components/BookingCalendar.jsx';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function BookingPage() {
  const [range, setRange] = useState({ checkIn: today(), checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd') });
  const { checkIn, checkOut } = range;
  const [selected, setSelected] = useState(null);
  const valid = checkOut > checkIn;
  const { data: rooms = [], isLoading, refetch } = useRooms(valid ? { checkIn, checkOut } : null);
  const book = useBook();

  const confirm = async () => {
    await book.mutateAsync({ roomId: selected.id, checkInDate: checkIn, checkOutDate: checkOut });
    setSelected(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book a room</h1>
      <div className="flex gap-4 mb-4 flex-wrap items-start">
        <BookingCalendar checkIn={checkIn} checkOut={checkOut} onChange={setRange} />
        <button onClick={() => refetch()} disabled={!valid} className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-40">Search</button>
      </div>
      {!valid && <p className="text-red-600 text-sm mb-4">Check-out must be after check-in.</p>}
      {isLoading ? <p>Searching…</p> : (
        <div className="grid md:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="border rounded p-4">
              <div className="font-bold">Room {r.roomNumber}</div>
              <div className="text-sm text-slate-600">{r.roomTypeTitle} · Floor {r.floor} · {r.status}</div>
              <button onClick={() => { book.reset(); setSelected(r); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">Select</button>
            </div>
          ))}
          {valid && rooms.length === 0 && <p className="text-slate-500">No rooms available for these dates.</p>}
        </div>
      )}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Confirm booking — Room ${selected?.roomNumber}`}>
        <p className="text-sm mb-4">{checkIn} → {checkOut}</p>
        {book.isError && <p className="text-red-600 text-sm mb-2">{book.error.message}</p>}
        <button onClick={confirm} disabled={book.isPending} className="bg-green-600 text-white px-4 py-2 rounded w-full">
          {book.isPending ? 'Booking…' : 'Confirm'}
        </button>
      </Modal>
    </div>
  );
}
