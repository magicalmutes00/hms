import { Link } from 'react-router-dom';
import { useRoomTypes } from '../hooks/queries.js';
import { BedDouble, Bath, Wifi, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { data: types = [], isLoading } = useRoomTypes();
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
              A refined stay. <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Effortless booking.</span>
            </h1>
            <p className="mt-4 text-slate-300 text-lg max-w-xl">
              Modern, production-grade hotel management — browse rooms, check availability, and confirm in seconds.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/book" className="rounded-xl bg-amber-400 px-5 py-3 font-medium text-slate-950 shadow-sm transition hover:shadow-md">
                Book your stay
              </Link>
              <Link to="/my-bookings" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-medium text-white backdrop-blur transition hover:bg-white/15">
                View my bookings
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-white/80">
              <div className="flex flex-col items-center">
                <BedDouble className="h-6 w-6" />
                <span className="mt-2 text-sm">Smart rooms</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="h-6 w-6" />
                <span className="mt-2 text-sm">Premium comfort</span>
              </div>
              <div className="flex flex-col items-center">
                <Wifi className="h-6 w-6" />
                <span className="mt-2 text-sm">Seamless access</span>
              </div>
            </div>
          </div>
          <div className="relative h-80 md:h-[26rem] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img
              className="h-full w-full object-cover"
              alt="Hotel lobby"
              src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Room types</h2>
            <p className="text-slate-600">Hand-picked accommodations for every stay.</p>
          </div>
          <Link to="/book" className="text-sm font-medium text-blue-600 hover:underline">
            Check availability →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-48 w-full rounded-2xl bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {types.map((t) => (
              <article key={t.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {t.imageUrls?.[0] ? (
                    <img
                      src={t.imageUrls[0]}
                      alt={t.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <BedDouble className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow ring-1 ring-black/5">
                    Sleeps {t.capacity}
                  </div>
                  <div className="absolute right-4 bottom-4 rounded-full bg-slate-950/90 px-3 py-1 text-xs font-medium text-white shadow">
                    ${t.basePrice}/night
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{t.description}</p>
                  {t.amenities?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs ring-1 ring-slate-200">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm text-slate-500">From ${t.basePrice}</span>
                    <Link to="/book" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                      Book now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-3 text-center md:text-left">
          <div>
            <h3 className="font-semibold">Real availability</h3>
            <p className="mt-1 text-sm text-slate-600">Pessimistic locking prevents double-booking with live overlap checks.</p>
          </div>
          <div>
            <h3 className="font-semibold">Production secure</h3>
            <p className="mt-1 text-sm text-slate-600">Neon Auth JWTs validated via JWKS, role-based access, and presigned object storage.</p>
          </div>
          <div>
            <h3 className="font-semibold">Ops ready</h3>
            <p className="mt-1 text-sm text-slate-600">Flyway schema, health checks, Docker + Render blueprint included.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
