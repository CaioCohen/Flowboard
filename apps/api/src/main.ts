import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestLoggingInterceptor } from './common/request-logging.interceptor';
import { SanitizedExceptionFilter } from './common/sanitized-exception.filter';
import { loadEnvironmentFile } from './config/environment-file';
import { RuntimeConfigService } from './config/runtime-config.service';
import { MetricsService } from './metrics/metrics.service';

async function bootstrap(): Promise<void> {
  loadEnvironmentFile();
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.enableShutdownHooks();
  const config = app.get(RuntimeConfigService);

  app.enableCors({ origin: config.frontendUrl, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, disableErrorMessages: true }));
  app.useGlobalInterceptors(new RequestLoggingInterceptor(app.get(MetricsService)));
  app.useGlobalFilters(new SanitizedExceptionFilter());
  await app.listen(config.port);
}

bootstrap().catch(() => {
  console.error(JSON.stringify({ level: 'error', event: 'startup_failed' }));
  process.exitCode = 1;
});
