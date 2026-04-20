import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [PrismaModule, HealthModule, PropertiesModule],
})
export class AppModule {}
