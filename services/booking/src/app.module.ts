import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/bookings.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, HealthModule, BookingsModule],
})
export class AppModule {}
