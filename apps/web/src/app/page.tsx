import Image from 'next/image';
import { apiUrls, fetchJson } from '@/lib/api';
import type { Booking, Health, Payment, Property, User } from '@property-booking/shared';

async function load() {
  const [authHealth, propertyHealth, bookingHealth, paymentHealth] = await Promise.all([
    fetchJson<Health>(`${apiUrls.auth}/health`),
    fetchJson<Health>(`${apiUrls.property}/health`),
    fetchJson<Health>(`${apiUrls.booking}/health`),
    fetchJson<Health>(`${apiUrls.payment}/health`),
  ]);

  const [users, properties, bookings, payments] = await Promise.all([
    fetchJson<User[]>(`${apiUrls.auth}/users`),
    fetchJson<Property[]>(`${apiUrls.property}/properties`),
    fetchJson<Booking[]>(`${apiUrls.booking}/bookings`),
    fetchJson<Payment[]>(`${apiUrls.payment}/payments`),
  ]);

  return {
    health: { authHealth, propertyHealth, bookingHealth, paymentHealth },
    users,
    properties,
    bookings,
    payments,
  };
}

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof load>>;
  let error: string | null = null;
  try {
    data = await load();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load demo data';
    data = {
      health: {
        authHealth: { status: 'down', service: 'auth' },
        propertyHealth: { status: 'down', service: 'property' },
        bookingHealth: { status: 'down', service: 'booking' },
        paymentHealth: { status: 'down', service: 'payment' },
      },
      users: [],
      properties: [],
      bookings: [],
      payments: [],
    };
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-12 border-b border-stone-800 pb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Property booking demo site built on Microservices architecture</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-50 md:text-5xl">
          Property booking (WIP)
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-400">
          Progress so far:
          <ul>
            <li>Component level architecture design</li>
            <li>Initial setup of project structure</li>
            <li>CI/CD pipeline setup to deploy</li>
            <ul>
              <li>Front end built with Next.js on Vercel</li>
              <li>Backend built with NestJS on Render</li>
              <li>Database built with PostgreSQL on Supabase</li>
            </ul>
          </ul>
        </p>
        {error ? (
          <p className="mt-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            Could not reach all services: {error}
          </p>
        ) : null}
      </header>

      <div>
        <h2 className="mb-6 text-2xl font-semibold text-stone-100">Health Check Status</h2>
      </div>
      <section className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ['Auth', data.health.authHealth],
            ['Property', data.health.propertyHealth],
            ['Booking', data.health.bookingHealth],
            ['Payment', data.health.paymentHealth],
          ] as const
        ).map(([label, h]) => (
          <div
            key={label}
            className="rounded-xl border border-stone-800 bg-stone-950/60 px-4 py-4 shadow-lg shadow-black/20"
          >
            <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
            <p className="mt-2 font-mono text-sm text-stone-200">{h.service}</p>
            <p
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                h.status === 'ok'
                  ? 'bg-emerald-950 text-emerald-300'
                  : 'bg-amber-950 text-amber-200'
              }`}
            >
              {h.status}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-stone-100">Stays</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.properties.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/40"
            >
              {p.imageUrl ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-stone-500">{p.city}</p>
                <h3 className="mt-1 text-lg font-medium text-stone-50">{p.title}</h3>
                <p className="mt-3 text-sm text-stone-400">
                  From{' '}
                  <span className="font-mono text-stone-200">${p.pricePerNight}</span> / night
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-stone-100">Guests (auth)</h2>
          <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800">
            {data.users.map((u) => (
              <li key={u.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
                <span className="font-medium text-stone-100">{u.name}</span>
                <span className="font-mono text-xs text-stone-500">{u.email}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-stone-100">Bookings</h2>
          <ul className="divide-y divide-stone-800 rounded-xl border border-stone-800">
            {data.bookings.map((b) => (
              <li key={b.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-200">{b.guestEmail}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-amber-950 text-amber-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-stone-500">
                  {b.checkIn} → {b.checkOut}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-stone-100">Payments</h2>
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950/80 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {data.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs text-stone-400">{p.bookingId}</td>
                  <td className="px-4 py-3 font-mono">
                    {p.currency} {p.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'succeeded'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
