import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RuntimeConfigModule } from './config/runtime-config.module';
import { RequestContextMiddleware } from './common/request-context.middleware';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';

@Module({ imports: [RuntimeConfigModule, HealthModule, AuthModule] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
