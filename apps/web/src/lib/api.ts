const env = (key: string, fallback: string) => process.env[key] ?? fallback;

export const apiUrls = {
  auth: env('NEXT_PUBLIC_API_AUTH_URL', 'http://localhost:4001'),
  property: env('NEXT_PUBLIC_API_PROPERTY_URL', 'http://localhost:4002'),
  booking: env('NEXT_PUBLIC_API_BOOKING_URL', 'http://localhost:4003'),
  payment: env('NEXT_PUBLIC_API_PAYMENT_URL', 'http://localhost:4004'),
} as const;

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
