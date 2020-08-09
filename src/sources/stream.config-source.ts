import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { ConfigSource, ConfigSourceInitOptions } from '../types';

const context = 'StreamConfigSource';

export interface StreamConfigSourceInitOptions extends ConfigSourceInitOptions {
  stream: Observable<any>;
}

export class StreamConfigSource implements ConfigSource {
  constructor(protected readonly options: StreamConfigSourceInitOptions) {
  }

  async init(): Promise<void> {
    const { logger, subject, onError, watch, addFinalizer, stream } = this.options;
    if (!watch) {
      const value = await stream.pipe(first()).toPromise();
      subject.next(value);
      subject.complete();
      return;
    }

    logger.log('Watching for config stream changes...', context);

    const subscription = stream.subscribe(
      value => subject.next(value),
      error => onError(error),
      () => subject.complete(),
    );
    addFinalizer(() => {
      subscription.unsubscribe();
    });
  }
}
