import path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamicConfigModule } from '../dynamic-config.module';
import { DynamicConfigSource } from '../const';
import { DynamicConfigService } from '../dynamic-config.service';

describe('DynamicConfigModule', () => {
  // Temporarily store process.env here, as tests may modify it.
  let processEnv: any;
  let module: TestingModule;

  const getTestConfigModule = async (filePath: string) => {
    return module = await Test.createTestingModule({
      imports: [
        DynamicConfigModule.forRoot({
          source: DynamicConfigSource.FILE,
          configFilePath: filePath,
          watchForChanges: false,
          parseConfig: config => JSON.parse(config),
        }),
      ],
    }).compile();
  };

  beforeEach(() => {
    processEnv = { ...process.env };
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    process.env = processEnv;
  });

  it('loads config', async () => {
    const module = await getTestConfigModule(path.join(__dirname, 'config.mock.json'));
    const configService = module.get(DynamicConfigService);

    const config = await configService.config();
    expect(config).toEqual({
      'SERVER_PORT': '8080',
      'HOST': 'example.com'
    });
  });

});
