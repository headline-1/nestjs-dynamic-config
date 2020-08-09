# Nest.js Dynamic Configuration Module

This module allows to automatically watch & reload configuration in runtime. For instance, Nest.js server may be used together with Vault Agent on Kubernetes and this module allows to continuously reload secrets file mounted in attached volume.

```ts
import { DynamicConfigModule } from 'nestjs-dynamic-config';

const onError = (error: Error) => {
  appLogger.error(error.message, error.stack, 'Config');
  process.exit(1);
};

export const ConfigModule = DynamicConfigModule.forRoot({
  logger: appLogger,
  source: DynamicConfigSource.FILE,
  configFilePath: process.env['CONFIG_FILE'], // 
  watchForChanges: !isTestEnv(), // Chokidar causes Jest to leak memory in tests.
  onError,
  parseConfig,
});

```
