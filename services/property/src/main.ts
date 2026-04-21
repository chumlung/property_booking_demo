import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createHmac } from 'crypto';
import { AppModule } from './app.module';

function parseCorsOrigins(raw: string | undefined): boolean | string[] {
  if (!raw || raw.trim() === '') return true;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function emitServiceStatus(service: 'property', status: 'ok' | 'down') {
  const url = process.env.WEBHOOK_STATUS_URL;
  const secret = process.env.WEBHOOK_STATUS_HMAC_SECRET;
  if (!url || !secret) return;

  const payload = JSON.stringify({
    service,
    status,
    updatedAt: new Date().toISOString(),
  });
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-timestamp': timestamp,
        'x-webhook-signature': `sha256=${signature}`,
      },
      body: payload,
    });
  } catch (error) {
    console.error('[service-status] webhook emit failed', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: parseCorsOrigins(process.env.CORS_ORIGIN) });
  const port = process.env.PORT ?? '4002';
  await app.listen(Number(port));
  await emitServiceStatus('property', 'ok');
}

bootstrap();
