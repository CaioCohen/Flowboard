import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { RuntimeConfigService } from '../config/runtime-config.service';

const config = { jwtSecret: 'test-secret', jwtExpiration: '1h' };

describe('AuthService', () => {
  it('creates a user with a password hash and returns a session without it', async () => {
    const database = { query: jest.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id: 'u1', first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.test' }] }) };
    const service = new AuthService(database as unknown as DatabaseService, config as RuntimeConfigService);

    const session = await service.register({ firstName: ' Ada ', lastName: ' Lovelace ', email: 'ADA@example.test', password: 'Password-9!', passwordConfirmation: 'Password-9!' });

    expect(database.query.mock.calls[1][0]).toContain('INSERT INTO "User"');
    expect(database.query.mock.calls[1][1]).toHaveLength(6);
    expect(database.query.mock.calls[1][1][0]).toEqual(expect.any(String));
    expect(database.query.mock.calls[1][1][4]).not.toBe('Password-9!');
    expect(database.query.mock.calls[1][1][5]).toEqual(expect.any(Date));
    expect(session.user).toEqual({ id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' });
    expect(session.token).toEqual(expect.any(String));
  });

  it('rejects an email already owned by a user', async () => {
    const service = new AuthService({ query: jest.fn().mockResolvedValue({ rows: [{ id: 'u1' }] }) } as unknown as DatabaseService, config as RuntimeConfigService);

    await expect(service.register({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test', password: 'Password-9!', passwordConfirmation: 'Password-9!' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns the same generic error for unknown email and wrong password', async () => {
    const unknown = new AuthService({ query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as DatabaseService, config as RuntimeConfigService);
    const wrongPassword = new AuthService({ query: jest.fn().mockResolvedValue({ rows: [{ id: 'u1', first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.test', password_hash: 'scrypt$invalid$invalid' }] }) } as unknown as DatabaseService, config as RuntimeConfigService);

    await expect(unknown.login({ email: 'unknown@example.test', password: 'Password-9!' })).rejects.toMatchObject(new UnauthorizedException('Email or password is incorrect.'));
    await expect(wrongPassword.login({ email: 'ada@example.test', password: 'Password-9!' })).rejects.toMatchObject(new UnauthorizedException('Email or password is incorrect.'));
  });
});
