import { useState } from 'react';
import { useTasks, useUpdateTask } from '../hooks/queries.js';

export default function HousekeepingView() {
  const [status, setStatus] = useState('');
  const { data = [] } = useTasks(status || undefined);
  const update = useUpdateTask();
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Housekeeping</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1 mb-4">
        <option value="">All</option>
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
      <div className="space-y-2">
        {data.map((t) => (
          <div key={t.id} className="border rounded p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-bold">Room {t.roomNumber} · {t.priority}</div>
              <div className="text-sm text-slate-600">{t.notes} — {t.status}</div>
            </div>
            <button onClick={() => update.mutate({ id: t.id, body: { status: 'IN_PROGRESS' } })} className="bg-amber-500 text-white px-2 py-1 rounded text-sm">Start</button>
            <button onClick={() => update.mutate({ id: t.id, body: { status: 'COMPLETED' } })} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Done</button>
          </div>
        ))}
      </div>
    </div>
  );
}
