import { Module } from '@nestjs/common';
import { RuntimeConfigModule } from '../config/runtime-config.module';
import { DatabaseService } from './database.service';

@Module({ imports: [RuntimeConfigModule], providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}
