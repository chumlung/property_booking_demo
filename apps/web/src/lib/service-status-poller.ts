import { apiUrls } from '@/lib/api';
import {
  getLastPolledAt,
  setLastPolledAt,
  upsertServiceStatus,
  type ServiceName,
} from '@/lib/service-status-store';
import type { Health } from '@property-booking/shared';

const services: Array<{ name: ServiceName; url: string }> = [
  { name: 'auth', url: apiUrls.auth },
  { name: 'property', url: apiUrls.property },
  { name: 'booking', url: apiUrls.booking },
  { name: 'payment', url: apiUrls.payment },
];

async function checkServiceHealth(name: ServiceName, baseUrl: string): Promise<Health> {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      cache: 'no-store',
      headers: { 'x-status-poller': 'nextjs' },
    });
    if (!response.ok) {
      return { service: name, status: 'down' };
    }
    const data = (await response.json()) as Health;
    return {
      service: name,
      status: data.status === 'ok' ? 'ok' : 'down',
    };
  } catch {
    return { service: name, status: 'down' };
  }
}

export async function pollAllServiceHealth() {
  const results = await Promise.all(
    services.map(async ({ name, url }) => {
      const health = await checkServiceHealth(name, url);
      upsertServiceStatus({
        service: name,
        status: health.status,
        source: 'poller',
        updatedAt: new Date().toISOString(),
      });
      return health;
    }),
  );
  setLastPolledAt(Date.now());
  return results;
}

export async function pollServiceHealthIfStale() {
  const intervalMs = Number(process.env.WEBHOOK_STATUS_POLL_INTERVAL_MS ?? '30000');
  const last = getLastPolledAt();
  if (Date.now() - last < intervalMs) return;
  await pollAllServiceHealth();
}
