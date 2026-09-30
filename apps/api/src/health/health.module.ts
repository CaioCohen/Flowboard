import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [DatabaseModule, MetricsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
