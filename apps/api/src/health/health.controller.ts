import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthResult, HealthService } from './health.service';
import { Public } from '../auth/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthResult> {
    const result = await this.health.check();
    if (result.status === 'degraded') {
      throw new ServiceUnavailableException('Service degraded');
    }
    return result;
  }
}
