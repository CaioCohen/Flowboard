import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('exposes default Node.js metrics and Flowboard HTTP metric definitions', async () => {
    const service = new MetricsService();

    const metrics = await service.metrics();

    expect(metrics).toContain('process_resident_memory_bytes');
    expect(metrics).toContain('flowboard_http_requests_total');
    expect(metrics).toContain('flowboard_http_request_duration_seconds');
  });

  it('records request metrics using the normalized route instead of a concrete identifier', async () => {
    const service = new MetricsService();

    service.recordRequest({
      method: 'GET',
      route: '/workspaces/:id',
      statusCode: 200,
      durationSeconds: 0.125,
    });

    const metrics = await service.metrics();

    expect(metrics).toContain('flowboard_http_requests_total{method="GET",route="/workspaces/:id",status_code="200"} 1');
    expect(metrics).not.toContain('/workspaces/9a845006-128e-4f1d-8a48-439507e4fd70');
  });

  it('records health-check outcomes without database details', async () => {
    const service = new MetricsService();

    service.recordHealthCheck('ok');

    await expect(service.metrics()).resolves.toContain('flowboard_healthcheck_total{status="ok"} 1');
  });
});
