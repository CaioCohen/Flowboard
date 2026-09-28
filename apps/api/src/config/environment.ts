export interface RuntimeConfiguration {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  port: number;
  frontendUrl: string;
}

type Environment = Record<string, string | undefined>;

export function validateEnvironment(environment: Environment): RuntimeConfiguration {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRATION', 'PORT', 'FRONTEND_URL'] as const;
  for (const key of required) {
    if (!environment[key]?.trim()) {
      throw new Error(`Invalid runtime configuration: ${key} is required`);
    }
  }

  const port = Number(environment.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid runtime configuration: PORT must be a valid TCP port');
  }

  validateUrl(environment.DATABASE_URL!, ['postgres:', 'postgresql:'], 'DATABASE_URL');
  validateUrl(environment.FRONTEND_URL!, ['http:', 'https:'], 'FRONTEND_URL');

  return {
    databaseUrl: environment.DATABASE_URL!,
    jwtSecret: environment.JWT_SECRET!,
    jwtExpiration: environment.JWT_EXPIRATION!,
    port,
    frontendUrl: environment.FRONTEND_URL!,
  };
}

function validateUrl(value: string, protocols: string[], key: string): void {
  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol)) throw new Error();
  } catch {
    throw new Error(`Invalid runtime configuration: ${key} must be a valid URL`);
  }
}
