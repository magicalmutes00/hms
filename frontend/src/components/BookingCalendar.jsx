import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, parseISO } from 'date-fns';

/** Month calendar date-range picker. Props: checkIn/checkOut (yyyy-MM-dd), onChange({checkIn, checkOut}). */
export default function BookingCalendar({ checkIn, checkOut, onChange }) {
  const [cursor, setCursor] = useState(() => startOfMonth(parseISO(checkIn)));
  const [anchor, setAnchor] = useState(null);

  const days = [];
  for (let d = startOfWeek(startOfMonth(cursor)), end = endOfWeek(endOfMonth(cursor)); d <= end; d = addDays(d, 1)) {
    days.push(d);
  }

  const pick = (day) => {
    const s = format(day, 'yyyy-MM-dd');
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
    <div className="border rounded p-4 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setCursor(addMonths(cursor, -1))} className="px-2">←</button>
        <span className="font-bold">{format(cursor, 'MMMM yyyy')}</span>
        <button onClick={() => setCursor(addMonths(cursor, 1))} className="px-2">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => <span key={w} className="text-slate-400">{w}</span>)}
        {days.map((d) => {
          const s = format(d, 'yyyy-MM-dd');
          const sel = inRange(s);
          return (
            <button key={s} onClick={() => pick(d)}
              className={`py-1.5 rounded text-sm ${sel ? 'bg-blue-600 text-white' : isSameMonth(d, cursor) ? 'hover:bg-slate-100' : 'text-slate-300'}`}>
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
      <p className="text-sm mt-2 text-slate-600">{checkIn} → {checkOut} (click a start date, then an end date)</p>
    </div>
  );
}
