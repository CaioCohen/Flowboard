import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  const validEnvironment = {
    DATABASE_URL: 'postgresql://flowboard:local@localhost:5432/flowboard',
    JWT_SECRET: 'local-development-secret',
    JWT_EXPIRATION: '15m',
    PORT: '3000',
    FRONTEND_URL: 'http://localhost:5173',
  };

  it('returns a normalized runtime configuration for a valid environment', () => {
    expect(validateEnvironment(validEnvironment)).toEqual({
      databaseUrl: 'postgresql://flowboard:local@localhost:5432/flowboard',
      jwtSecret: 'local-development-secret',
      jwtExpiration: '15m',
      port: 3000,
      frontendUrl: 'http://localhost:5173',
    });
  });

  it('fails without echoing values when a required setting is missing', () => {
    expect(() => validateEnvironment({ ...validEnvironment, JWT_SECRET: '' })).toThrow(
      'Invalid runtime configuration: JWT_SECRET is required',
    );
  });

  it('rejects a non-numeric port', () => {
    expect(() => validateEnvironment({ ...validEnvironment, PORT: 'api' })).toThrow(
      'Invalid runtime configuration: PORT must be a valid TCP port',
    );
  });
});
