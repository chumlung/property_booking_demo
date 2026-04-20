import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseCorsOrigins(raw: string | undefined): boolean | string[] {
  if (!raw || raw.trim() === '') return true;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: parseCorsOrigins(process.env.CORS_ORIGIN) });
  const port = process.env.PORT ?? '4004';
  await app.listen(Number(port));
}

bootstrap();
