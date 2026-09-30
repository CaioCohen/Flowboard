import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RuntimeConfigModule } from './config/runtime-config.module';
import { RequestContextMiddleware } from './common/request-context.middleware';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NotificationsModule } from './notifications/notifications.module';
import { WorkspaceModule } from './workspaces/workspace.module';
import { TicketsModule } from './tickets/tickets.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [RuntimeConfigModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), MetricsModule, HealthModule, AuthModule, NotificationsModule, WorkspaceModule, TicketsModule],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
