import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { Injectable } from '@nestjs/common';

export type RequestMetric = {
  method: string;
  route: string;
  statusCode: number;
  durationSeconds: number;
};

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpRequests = new Counter({
    name: 'flowboard_http_requests_total',
    help: 'Total completed HTTP requests handled by Flowboard.',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });
  private readonly httpRequestDuration = new Histogram({
    name: 'flowboard_http_request_duration_seconds',
    help: 'Duration in seconds of completed HTTP requests handled by Flowboard.',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry],
  });
  private readonly healthChecks = new Counter({
    name: 'flowboard_healthcheck_total',
    help: 'Total Flowboard health-check results.',
    labelNames: ['status'],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  get contentType(): string {
    return this.registry.contentType;
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }

  recordRequest(metric: RequestMetric): void {
    const labels = {
      method: metric.method,
      route: metric.route,
      status_code: String(metric.statusCode),
    };
    this.httpRequests.inc(labels);
    this.httpRequestDuration.observe(labels, metric.durationSeconds);
  }

  recordHealthCheck(status: 'ok' | 'degraded'): void {
    this.healthChecks.inc({ status });
  }
}
