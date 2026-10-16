import { useState } from 'react';
import { useTasks, useUpdateTask } from '../hooks/queries.js';
import { Filter, Clock, CheckCircle2, PlayCircle, DoorOpen } from 'lucide-react';

export default function HousekeepingView() {
  const [status, setStatus] = useState('');
  const { data = [], isLoading } = useTasks(status || undefined);
  const update = useUpdateTask();

  const chip = (s) => {
    const map = {
      TODO: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      COMPLETED: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    };
    return map[s] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  };

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Housekeeping</h1>
            <p className="text-slate-600">Track and update room cleaning tasks.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
            <Filter className="h-4 w-4 text-slate-500" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent text-sm outline-none">
              <option value="">All</option>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No tasks match this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((t) => (
              <article key={t.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Room {t.roomNumber}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${chip(t.status)}`}>{t.status}</span>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200">{t.priority}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><DoorOpen className="h-4 w-4" /> Room {t.roomNumber}</span>
                    {t.notes && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {t.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.status !== 'IN_PROGRESS' && t.status !== 'COMPLETED' && (
                    <button onClick={() => update.mutate({ id: t.id, body: { status: 'IN_PROGRESS' } })} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100">
                      <PlayCircle className="h-4 w-4" /> Start
                    </button>
                  )}
                  {t.status !== 'COMPLETED' && (
                    <button onClick={() => update.mutate({ id: t.id, body: { status: 'COMPLETED' } })} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4" /> Complete
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
