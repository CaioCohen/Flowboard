import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
const jwtAuth = { sign: jest.fn().mockResolvedValue('token') };

describe('AuthService', () => {
  it('creates a user with a password hash and returns a session without it', async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' }) };
    const service = new AuthService(users as never, jwtAuth as never);

    const session = await service.register({ firstName: ' Ada ', lastName: ' Lovelace ', email: 'ADA@example.test', password: 'Password-9!', passwordConfirmation: 'Password-9!' });

    expect(users.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'ada@example.test', firstName: 'Ada', lastName: 'Lovelace', passwordHash: expect.any(String) }));
    expect(session.user).toEqual({ id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' });
    expect(session.token).toEqual(expect.any(String));
  });

  it('rejects an email already owned by a user', async () => {
    const service = new AuthService({ findByEmail: jest.fn().mockResolvedValue({ id: 'u1' }) } as never, jwtAuth as never);

    await expect(service.register({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test', password: 'Password-9!', passwordConfirmation: 'Password-9!' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns the same generic error for unknown email and wrong password', async () => {
    const unknown = new AuthService({ findByEmail: jest.fn().mockResolvedValue(null) } as never, jwtAuth as never);
    const wrongPassword = new AuthService({ findByEmail: jest.fn().mockResolvedValue({ id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test', passwordHash: 'scrypt$invalid$invalid' }) } as never, jwtAuth as never);

    await expect(unknown.login({ email: 'unknown@example.test', password: 'Password-9!' })).rejects.toMatchObject(new UnauthorizedException('Email or password is incorrect.'));
    await expect(wrongPassword.login({ email: 'ada@example.test', password: 'Password-9!' })).rejects.toMatchObject(new UnauthorizedException('Email or password is incorrect.'));
  });
});
