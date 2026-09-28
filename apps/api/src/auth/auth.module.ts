import { Module } from '@nestjs/common';
import { RuntimeConfigModule } from '../config/runtime-config.module';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule, RuntimeConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
