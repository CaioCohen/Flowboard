import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RuntimeConfigModule } from '../config/runtime-config.module';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthService } from './jwt-auth.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [DatabaseModule, RuntimeConfigModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService, UserRepository],
  exports: [JwtAuthService, UserRepository],
})
export class AuthModule {}
