import { AuthService } from './auth.service';

describe('AuthService persistence boundary', () => {
  it('registers through the user repository instead of a raw database adapter', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' }),
    };
    const jwt = { sign: jest.fn().mockResolvedValue('token') };
    const service = new AuthService(users as never, jwt as never);

    await expect(service.register({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test', password: 'Password-9!', passwordConfirmation: 'Password-9!' }))
      .resolves.toMatchObject({ user: { id: 'u1', email: 'ada@example.test' }, token: 'token' });
  });
});
