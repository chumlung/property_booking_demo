import type { Health } from '@property-booking/shared';

export type ServiceName = 'auth' | 'property' | 'booking' | 'payment';

export type ServiceStatusEvent = {
  service: ServiceName;
  status: 'ok' | 'down';
  source: 'webhook' | 'poller';
  updatedAt: string;
};

const serviceStatus = new Map<ServiceName, ServiceStatusEvent>();
let lastPolledAt = 0;

export function upsertServiceStatus(event: ServiceStatusEvent) {
  serviceStatus.set(event.service, event);
}

export function getServiceStatusSnapshot(): Record<ServiceName, Health> {
  const fallback = (service: ServiceName): Health => ({ service, status: 'down' });
  return {
    auth: serviceStatus.get('auth') ?? fallback('auth'),
    property: serviceStatus.get('property') ?? fallback('property'),
    booking: serviceStatus.get('booking') ?? fallback('booking'),
    payment: serviceStatus.get('payment') ?? fallback('payment'),
  };
}

export function setLastPolledAt(timestampMs: number) {
  lastPolledAt = timestampMs;
}

export function getLastPolledAt() {
  return lastPolledAt;
}
