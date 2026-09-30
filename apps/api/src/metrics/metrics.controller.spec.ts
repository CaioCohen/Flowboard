import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  it('returns Prometheus text metrics with the registry content type', async () => {
    const metrics = { metrics: jest.fn().mockResolvedValue('metric_name 1\n'), contentType: 'text/plain; version=0.0.4; charset=utf-8' } as unknown as MetricsService;
    const controller = new MetricsController(metrics);
    const response = { setHeader: jest.fn() };

    await expect(controller.getMetrics(response as never)).resolves.toBe('metric_name 1\n');
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  });
});
