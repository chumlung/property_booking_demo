import Image from 'next/image';
import { apiUrls, fetchJson } from '@/lib/api';
import { pollServiceHealthIfStale } from '@/lib/service-status-poller';
import { getServiceStatusSnapshot } from '@/lib/service-status-store';
import type { Booking, Health, Payment, Property, User } from '@property-booking/shared';

const SERVICE_STATUS: Health = { status: 'down', service: 'unknown' };

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    return await fetchJson<T>(url);
  } catch {
    return null;
  }
}

async function load() {
  await pollServiceHealthIfStale();
  const webhookStatus = getServiceStatusSnapshot();

  const [authHealthRaw, propertyHealthRaw, bookingHealthRaw, paymentHealthRaw] = await Promise.all([
    safeFetch<Health>(`${apiUrls.auth}/health`),
    safeFetch<Health>(`${apiUrls.property}/health`),
    safeFetch<Health>(`${apiUrls.booking}/health`),
    safeFetch<Health>(`${apiUrls.payment}/health`),
  ]);

  const [usersRaw, propertiesRaw, bookingsRaw, paymentsRaw] = await Promise.all([
    safeFetch<User[]>(`${apiUrls.auth}/users`),
    safeFetch<Property[]>(`${apiUrls.property}/properties`),
    safeFetch<Booking[]>(`${apiUrls.booking}/bookings`),
    safeFetch<Payment[]>(`${apiUrls.payment}/payments`),
  ]);

  const authHealth = authHealthRaw ?? webhookStatus.auth ?? { ...SERVICE_STATUS, service: 'auth' };
  const propertyHealth =
    propertyHealthRaw ?? webhookStatus.property ?? { ...SERVICE_STATUS, service: 'property' };
  const bookingHealth =
    bookingHealthRaw ?? webhookStatus.booking ?? { ...SERVICE_STATUS, service: 'booking' };
  const paymentHealth =
    paymentHealthRaw ?? webhookStatus.payment ?? { ...SERVICE_STATUS, service: 'payment' };

  const users = usersRaw ?? [];
  const properties = propertiesRaw ?? [];
  const bookings = bookingsRaw ?? [];
  const payments = paymentsRaw ?? [];

  const downServices = [authHealth, propertyHealth, bookingHealth, paymentHealth]
    .filter((h) => h.status !== 'ok')
    .map((h) => h.service);

  return {
    health: { authHealth, propertyHealth, bookingHealth, paymentHealth },
    users,
    properties,
    bookings,
    payments,
    downServices,
  };
}

export default async function HomePage() {
  const data = await load();
  const hasDownServices = data.downServices.length > 0;

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
        {hasDownServices ? (
          <p className="mt-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            Waking up the services: {data.downServices.join(', ')}
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
