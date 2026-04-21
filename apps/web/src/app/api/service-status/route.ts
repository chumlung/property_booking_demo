import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getServiceStatusSnapshot, upsertServiceStatus } from '@/lib/service-status-store';

type IncomingEvent = {
  service?: 'auth' | 'property' | 'booking' | 'payment';
  status?: 'ok' | 'down';
  updatedAt?: string;
};

function isValidEvent(payload: IncomingEvent): payload is Required<IncomingEvent> {
  const validService = ['auth', 'property', 'booking', 'payment'].includes(payload.service ?? '');
  const validStatus = payload.status === 'ok' || payload.status === 'down';
  return validService && validStatus;
}

export async function GET() {
  return NextResponse.json({
    statuses: getServiceStatusSnapshot(),
    source: 'in-memory',
  });
}

export async function POST(request: NextRequest) {
  const sharedSecret = process.env.WEBHOOK_STATUS_HMAC_SECRET;
  if (!sharedSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const timestampHeader = request.headers.get('x-webhook-timestamp');
  const signatureHeader = request.headers.get('x-webhook-signature');
  if (!timestampHeader || !signatureHeader) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 401 });
  }

  const maxSkewMs = Number(process.env.WEBHOOK_STATUS_MAX_SKEW_MS ?? '300000');
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) {
    return NextResponse.json({ error: 'Invalid webhook timestamp' }, { status: 401 });
  }
  const now = Date.now();
  if (Math.abs(now - timestamp) > maxSkewMs) {
    return NextResponse.json({ error: 'Webhook timestamp expired' }, { status: 401 });
  }

  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  const expectedSig = createHmac('sha256', sharedSecret)
    .update(`${timestampHeader}.${rawBody}`)
    .digest('hex');
  const providedSig = signatureHeader.replace(/^sha256=/, '');

  const expectedBuffer = Buffer.from(expectedSig);
  const providedBuffer = Buffer.from(providedSig);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let body: IncomingEvent;
  try {
    body = JSON.parse(rawBody) as IncomingEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!isValidEvent(body)) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
  }

  upsertServiceStatus({
    service: body.service,
    status: body.status,
    source: 'webhook',
    updatedAt: body.updatedAt ?? new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
