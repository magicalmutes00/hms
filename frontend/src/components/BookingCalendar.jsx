import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, parseISO } from 'date-fns';

/**
 * Month calendar date-range picker.
 * Props: checkIn/checkOut (yyyy-MM-dd), onChange({checkIn, checkOut}),
 * bookedDates (array of yyyy-MM-dd, shown red + not selectable as start),
 * onMonthChange(yyyy-MM) fired on month navigation.
 */
export default function BookingCalendar({ checkIn, checkOut, onChange, bookedDates = [], onMonthChange }) {
  const [cursor, setCursor] = useState(() => startOfMonth(parseISO(checkIn)));
  const [anchor, setAnchor] = useState(null);
  const booked = new Set(bookedDates);

  const nav = (dir) => {
    const next = addMonths(cursor, dir);
    setCursor(next);
    onMonthChange?.(format(next, 'yyyy-MM'));
  };

  const days = [];
  for (let d = startOfWeek(startOfMonth(cursor)), end = endOfWeek(endOfMonth(cursor)); d <= end; d = addDays(d, 1)) {
    days.push(d);
  }

  const pick = (day) => {
    const s = format(day, 'yyyy-MM-dd');
    if (booked.has(s)) return;
    if (!anchor || (anchor && checkIn && s < anchor)) {
      setAnchor(s);
      onChange({ checkIn: s, checkOut: s });
    } else {
      onChange({ checkIn: anchor, checkOut: s });
      setAnchor(null);
    }
  };

  const inRange = (s) => checkIn && checkOut && s >= checkIn && s <= checkOut;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => nav(-1)} className="px-2">←</button>
        <span className="font-bold">{format(cursor, 'MMMM yyyy')}</span>
        <button onClick={() => nav(1)} className="px-2">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => <span key={w} className="text-slate-400">{w}</span>)}
        {days.map((d) => {
          const s = format(d, 'yyyy-MM-dd');
          const sel = inRange(s);
          const isBooked = booked.has(s);
          return (
            <button key={s} onClick={() => pick(d)} disabled={isBooked} title={isBooked ? 'Booked' : s}
              className={`py-1.5 rounded text-sm relative ${
                sel ? 'bg-blue-600 text-white'
                : isBooked ? 'bg-red-100 text-red-400 line-through cursor-not-allowed'
                : isSameMonth(d, cursor) ? 'hover:bg-slate-100' : 'text-slate-300'}`}>
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
      <p className="text-sm mt-2 text-slate-600">{checkIn} → {checkOut}</p>
      {bookedDates.length > 0 && (
        <p className="text-xs mt-1 text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400 mr-1" />
          {bookedDates.length} booked day{bookedDates.length === 1 ? '' : 's'} this month
        </p>
      )}
    </div>
  );
}
