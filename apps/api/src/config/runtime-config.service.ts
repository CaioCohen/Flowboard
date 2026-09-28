import { Inject, Injectable } from '@nestjs/common';
import { RuntimeConfiguration } from './environment';

@Injectable()
export class RuntimeConfigService {
  constructor(@Inject('RUNTIME_CONFIG') private readonly config: RuntimeConfiguration) {}

  get databaseUrl(): string { return this.config.databaseUrl; }
  get jwtSecret(): string { return this.config.jwtSecret; }
  get jwtExpiration(): string { return this.config.jwtExpiration; }
  get port(): number { return this.config.port; }
  get frontendUrl(): string { return this.config.frontendUrl; }
}
