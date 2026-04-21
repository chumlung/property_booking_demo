import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  live() {
    return { status: 'ok', service: 'auth' };
  }
  
  @Get('ready')
  async checkDatabaseReadiness() {
    const isDatabaseReady = await this.healthService.checkDatabaseReadiness();
    if (!isDatabaseReady) {
      throw new ServiceUnavailableException({
        status: 'down',
        service: 'auth',
        checks: { database: 'down' },
      });
    }

    return { status: 'ok', service: 'auth', checks: { database: 'up' } };
  }
}
