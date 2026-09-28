import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { RuntimeConfigService } from '../config/runtime-config.service';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: RuntimeConfigService) {
    this.pool = new Pool({ connectionString: config.databaseUrl, max: 1 });
  }

  async ping(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
