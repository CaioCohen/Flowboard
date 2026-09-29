import { DatabaseService } from './database.service';

describe('DatabaseService transactions', () => {
  it('rolls back the membership transaction when the notification insert fails', async () => {
    const client = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (sql === 'INSERT notification') throw new Error('notification insert failed');
      }),
      release: jest.fn(),
    };
    const service = new DatabaseService({ databaseUrl: 'postgres://unused' } as never);
    (service as unknown as { pool: { connect: jest.Mock } }).pool = { connect: jest.fn().mockResolvedValue(client) };

    await expect(service.transaction(async (transaction) => {
      await transaction.query('INSERT membership');
      await transaction.query('INSERT notification');
    })).rejects.toThrow('notification insert failed');

    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(['BEGIN', 'INSERT membership', 'INSERT notification', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});
