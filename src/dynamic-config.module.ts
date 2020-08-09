import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigOptionsToken } from './const';
import { DynamicConfigOptions } from './types';
import { DynamicConfigService } from './dynamic-config.service';

@Global()
@Module({})
export class DynamicConfigModule {
  static forRoot<Config>(options: DynamicConfigOptions): DynamicModule {
    return {
      module: DynamicConfigModule,
      providers: [
        {
          provide: ConfigOptionsToken,
          useValue: options,
        },
        DynamicConfigService,
      ],
      exports: [DynamicConfigService],
    };
  }
}
