import { Link } from 'react-router-dom';
import { useRoomTypes } from '../hooks/queries.js';

export default function LandingPage() {
  const { data: types = [], isLoading } = useRoomTypes();
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Find your stay</h1>
      <p className="text-slate-600 mb-6">Browse room types backed by Neon Postgres + Object Storage.</p>
      {isLoading ? <p>Loading…</p> : (
        <div className="grid md:grid-cols-3 gap-4">
          {types.map((t) => (
            <div key={t.id} className="border rounded-lg overflow-hidden">
              {t.imageUrls?.[0] && <img src={t.imageUrls[0]} alt={t.title} className="h-40 w-full object-cover" />}
              <div className="p-4">
                <h2 className="font-bold">{t.title}</h2>
                <p className="text-sm text-slate-600">Sleeps {t.capacity} · ${t.basePrice}/night</p>
                <p className="text-sm mt-2 line-clamp-2">{t.description}</p>
                <Link to="/book" className="mt-3 inline-block bg-blue-600 text-white px-4 py-1.5 rounded">Book now</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
