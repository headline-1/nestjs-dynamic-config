import * as fs from 'fs';
import * as util from 'util';

import { ConfigSource, ConfigSourceInitOptions } from '../types';

export interface FileConfigSourceInitOptions extends ConfigSourceInitOptions {
  configFilePath: string;
}

const context = 'FileConfigSource';
const readFile = util.promisify(fs.readFile);

export class FileConfigSource implements ConfigSource {

  constructor(protected readonly options: FileConfigSourceInitOptions) {
  }

  async init(): Promise<void> {
    const { logger, configFilePath, addFinalizer, watch, onError, subject } = this.options;
    const startWatcher = async () => {
      logger.log('Watching for config file changes...', context);
      const chokidar = await import('chokidar');
      const watcher = chokidar.watch(configFilePath, {
        disableGlobbing: true,
        usePolling: true,
        interval: 3000,
        binaryInterval: 3000,
        followSymlinks: false,
      });
      watcher.on('change', pushConfig);
      addFinalizer(() => watcher.close());
    };

    const pushConfig = () => {
      this.readConfigFile()
        .then(config => subject.next(config))
        .catch(error => onError(error));
    };
    pushConfig();

    if (watch) {
      // Optionally watch for changes - we may not need this in some situations.
      await startWatcher();
    }
  }

  private async readConfigFile(): Promise<string> {
    const { configFilePath, logger } = this.options;
    if (!configFilePath) {
      throw new Error('configFilePath value is missing. Did you forget to set it in DynamicConfigOptions?');
    }
    logger.log(`Reading config file at '${configFilePath}'.`, context);
    return await readFile(configFilePath, { encoding: 'utf8' });
  }
}
