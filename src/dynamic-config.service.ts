import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { isNotNil } from './utils';
import { ConfigOptionsToken, DynamicConfigSource } from './const';
import { ConfigSource, ConfigSourceInitOptions, DynamicConfigOptions, Finalizer } from './types';
import { FileConfigSource } from './sources/file.config-source';
import { StreamConfigSource } from './sources/stream.config-source';

const context = 'ConfigService';

@Injectable()
export class DynamicConfigService<Config> implements OnModuleDestroy {
  private readonly finalizers: Finalizer[] = [];
  private config$?: Observable<Config>;
  private logger = this.options.logger || Logger;

  constructor(
    @Inject(ConfigOptionsToken) private readonly options: DynamicConfigOptions,
  ) {
  }

  async config(): Promise<Config> {
    return this.configStream().pipe(first()).toPromise();
  }

  configStream(): Observable<Config> {
    return this.config$ || this.init();
  }

  createDataSource(options: ConfigSourceInitOptions): ConfigSource {
    switch (this.options.source) {
      case DynamicConfigSource.FILE:
        return new FileConfigSource({ ...options, configFilePath: this.options.configFilePath });
      case DynamicConfigSource.STREAM:
        return new StreamConfigSource({ ...options, stream: this.options.configStream });
      default:
        throw new Error(`Invalid DynamicConfigSource '${(options as any).source}'.`);
    }
  }

  public async onModuleDestroy(): Promise<void> {
    for (const finalizer of this.finalizers) {
      await Promise.resolve(finalizer());
    }
    this.finalizers.splice(0, this.finalizers.length);
    this.config$ = undefined;
  }

  private init(): Observable<Config> {
    const { watchForChanges } = this.options;

    this.logger.log('Initializing configuration service', context);

    const subject = new BehaviorSubject<Config | undefined>(undefined);

    const dataSource = this.createDataSource({
      logger: this.logger,
      addFinalizer: finalizer => this.finalizers.push(finalizer),
      subject,
      onError: this.options.onError ?? (error => subject.error(error)),
      watch: watchForChanges,
    });
    dataSource.init().catch((err: any) => subject.error(err));

    this.finalizers.push(() => {
      subject.complete();
      subject.unsubscribe();
    });

    return this.config$ = subject.pipe(
      filter(isNotNil),
      map(config => this.options.parseConfig(config)),
    );
  }
}
