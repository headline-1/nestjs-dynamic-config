import { LoggerService } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';

import { DynamicConfigSource } from './const';

export interface BaseDynamicConfigOptions {
  watchForChanges: boolean;
  logger?: LoggerService;
  onError?: (error: Error) => void;
  /**
   * This function parses raw config and returns well-formated config.
   * It's then returned as a result of {@link DynamicConfigService.config} and
   * {@link DynamicConfigService.configStream} functions.
   */
  parseConfig: (config: any) => any;
}

export interface FileDynamicConfigOptions extends BaseDynamicConfigOptions {
  source: DynamicConfigSource.FILE;

  /** One of dynamic config sources.
   * Watches for file changes and refreshes configuration on file change.
   * Active when source is set to #{DynamicConfigSource.FILE}.
   */
  configFilePath: string;

}

export interface StreamDynamicConfigOptions extends BaseDynamicConfigOptions {
  source: DynamicConfigSource.STREAM;

  /** One of dynamic config sources.
   * Observes an RxJS observable stream.
   * Active when source is set to #{DynamicConfigSource.STREAM}.
   */
  configStream: Observable<any>;
}

export type DynamicConfigOptions = FileDynamicConfigOptions | StreamDynamicConfigOptions;

export type Finalizer = () => any;

export interface ConfigSourceInitOptions {
  logger: LoggerService;
  subject: BehaviorSubject<any>;
  watch: boolean;
  onError: (error: Error) => void;
  addFinalizer: (finalizer: Finalizer) => void;
}

export interface ConfigSource {
  init(): any;
}
