import { NextRequest, NextResponse } from 'next/server';
import { pollAllServiceHealth } from '@/lib/service-status-poller';

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.WEBHOOK_STATUS_POLLER_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ error: 'Poller secret not configured' }, { status: 500 });
  }

  const providedSecret = request.headers.get('x-status-poller-secret');
  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const statuses = await pollAllServiceHealth();
  return NextResponse.json({ ok: true, statuses });
}
