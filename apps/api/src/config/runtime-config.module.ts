import { Global, Module } from '@nestjs/common';
import { validateEnvironment } from './environment';
import { RuntimeConfigService } from './runtime-config.service';

@Global()
@Module({
  providers: [
    { provide: 'RUNTIME_CONFIG', useFactory: () => validateEnvironment(process.env) },
    RuntimeConfigService,
  ],
  exports: [RuntimeConfigService],
})
export class RuntimeConfigModule {}
