import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

describe('JwtAuthService', () => {
  const config = { jwtSecret: 'a-secure-test-secret-with-at-least-32-bytes', jwtExpiration: '15m' };

  it('verifies a token it issues and returns its subject', async () => {
    const service = new JwtAuthService(new JwtService(), config as never);

    const token = await service.sign({ id: 'user-1', email: 'ada@example.test', firstName: 'Ada', lastName: 'Lovelace' });

    await expect(service.verify(token)).resolves.toMatchObject({ sub: 'user-1', email: 'ada@example.test', firstName: 'Ada', lastName: 'Lovelace' });
  });

  it('rejects a tampered token', async () => {
    const service = new JwtAuthService(new JwtService(), config as never);
    const token = await service.sign({ id: 'user-1', email: 'ada@example.test', firstName: 'Ada', lastName: 'Lovelace' });

    await expect(service.verify(`${token}x`)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
