import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  live() {
    return { status: 'ok', service: 'booking' };
  }

  @Get('live')
  liveness() {
    return { status: 'ok', service: 'booking' };
  }

  @Get('ready')
  async readiness() {
    const databaseReady = await this.healthService.isDatabaseReady();
    if (!databaseReady) {
      throw new ServiceUnavailableException({
        status: 'down',
        service: 'booking',
        checks: { database: 'down' },
      });
    }

    return { status: 'ok', service: 'booking', checks: { database: 'up' } };
  }
}
