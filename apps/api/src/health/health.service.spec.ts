import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ok when the database probe succeeds', async () => {
    const service = new HealthService({ ping: async () => undefined });

    await expect(service.check()).resolves.toEqual({ status: 'ok' });
  });

  it('reports degraded without exposing database failure details', async () => {
    const logError = jest.spyOn(console, 'error').mockImplementation();
    const service = new HealthService({
      ping: async () => {
        throw new Error('postgresql://user:password@host/private');
      },
    });

    await expect(service.check()).resolves.toEqual({ status: 'degraded' });
    logError.mockRestore();
  });
});
