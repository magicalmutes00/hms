import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useRooms, useBook, useRoomTypes, useAvailability } from '../hooks/queries.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import BookingCalendar from '../components/BookingCalendar.jsx';
import { BedDouble, CalendarRange, CheckCircle2 } from 'lucide-react';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function BookingPage() {
  const [range, setRange] = useState({ checkIn: today(), checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd') });
  const { checkIn, checkOut } = range;
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [selected, setSelected] = useState(null);
  const [focusRoomId, setFocusRoomId] = useState('');
  const valid = checkOut > checkIn;
  const { data: rooms = [], isLoading, refetch } = useRooms(valid ? { checkIn, checkOut } : null);
  const { data: types = [] } = useRoomTypes();
  const { data: avail } = useAvailability(focusRoomId, month);
  const book = useBook();
  const toast = useToast();

  const confirm = async () => {
    try {
      const res = await book.mutateAsync({ roomId: selected.id, checkInDate: checkIn, checkOutDate: checkOut });
      toast.push(`Booked! Code ${res.bookingCode}`);
    } catch (e) { toast.push(e.message, 'error'); }
    finally { setSelected(null); }
  };

  const typeMap = Object.fromEntries(types.map((t) => [t.id, t]));

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Book a room</h1>
            <p className="text-slate-600">Choose dates and pick an available room.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm">
            <CalendarRange className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              {checkIn} → {checkOut}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-medium">Select dates</h2>
                <p className="text-sm text-slate-500">Click start, then end date.</p>
              </div>
              <div className="p-4">
                <BookingCalendar checkIn={checkIn} checkOut={checkOut}
                  onChange={(r) => { setRange(r); setMonth(r.checkIn.slice(0, 7)); }}
                  bookedDates={avail?.bookedDates || []} onMonthChange={setMonth} />
                <label className="mt-3 block text-sm text-slate-600">
                  Show availability for
                  <select value={focusRoomId} onChange={(e) => setFocusRoomId(e.target.value)}
                    className="mt-1 w-full border rounded px-2 py-1 bg-white">
                    <option value="">— pick a room below —</option>
                    {rooms.map((r) => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
                  </select>
                </label>
                <button onClick={() => refetch()} disabled={!valid} className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40">
                  Search availability
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Available rooms</h2>
                <p className="text-sm text-slate-500">{rooms.length} result{rooms.length === 1 ? '' : 's'}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="h-24 w-full rounded-xl bg-slate-200" />
                    <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : !valid ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Check-out must be after check-in.
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
                No rooms available for these dates. Try adjusting your range.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rooms.map((r) => {
                  const t = typeMap[r.roomTypeId];
                  return (
                    <article key={r.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {t?.imageUrls?.[0] ? (
                          <img src={t.imageUrls[0]} alt={r.roomTypeTitle} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                            <BedDouble className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium ring-1 ring-black/5">
                          Room {r.roomNumber}
                        </div>
                        {t?.basePrice && (
                          <div className="absolute right-3 bottom-3 rounded-full bg-slate-950/90 px-2.5 py-0.5 text-xs font-medium text-white">
                            ${t.basePrice}/night
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{r.roomTypeTitle}</h3>
                            <p className="text-sm text-slate-500">Floor {r.floor} · {r.status}</p>
                          </div>
                          <button onClick={() => { book.reset(); setSelected(r); setFocusRoomId(r.id); }} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                            Select
                          </button>
                        </div>
                        {t?.amenities?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {t.amenities.slice(0, 3).map((a) => (
                              <span key={a} className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs ring-1 ring-slate-200">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Confirm booking — Room ${selected?.roomNumber}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarRange className="h-4 w-4" />
            <span>{checkIn} → {checkOut}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>{selected?.roomTypeTitle} · Floor {selected?.floor}</span>
          </div>
          {book.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{book.error.message}</p>}
          <button onClick={confirm} disabled={book.isPending} className="mt-2 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:opacity-40">
            {book.isPending ? 'Confirming…' : 'Confirm booking'}
          </button>
        </div>
      </Modal>
    </main>
  );
}
