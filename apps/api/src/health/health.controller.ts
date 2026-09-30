import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthResult, HealthService } from './health.service';
import { Public } from '../auth/public.decorator';
import { MetricsService } from '../metrics/metrics.service';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly health: HealthService, private readonly metrics: MetricsService) {}

  @Get()
  async getHealth(): Promise<HealthResult> {
    const result = await this.health.check();
    this.metrics.recordHealthCheck(result.status);
    if (result.status === 'degraded') {
      throw new ServiceUnavailableException('Service degraded');
    }
    return result;
  }
}
