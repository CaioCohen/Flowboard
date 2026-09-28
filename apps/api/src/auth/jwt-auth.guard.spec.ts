import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const jwt = { verify: jest.fn() };
  const users = { findById: jest.fn() };
  const context = (authorization?: string) => ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization }, user: undefined }) }),
  }) as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('attaches the current user when a valid bearer token is supplied', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verify.mockResolvedValue({ sub: 'user-1' });
    users.findById.mockResolvedValue({ id: 'user-1', email: 'ada@example.test' });
    const guard = new JwtAuthGuard(reflector as never, jwt as never, users as never);

    await expect(guard.canActivate(context('Bearer valid-token'))).resolves.toBe(true);
  });

  it('rejects a missing bearer token on a protected route', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const guard = new JwtAuthGuard(reflector as never, jwt as never, users as never);

    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
