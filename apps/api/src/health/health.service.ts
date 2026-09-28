import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface DatabaseProbe {
  ping(): Promise<void>;
}

export type HealthResult = { status: 'ok' | 'degraded' };

@Injectable()
export class HealthService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseProbe) {}

  async check(): Promise<HealthResult> {
    try {
      await this.database.ping();
      return { status: 'ok' };
    } catch {
      console.error(JSON.stringify({ level: 'error', event: 'database_unavailable' }));
      return { status: 'degraded' };
    }
  }
}
