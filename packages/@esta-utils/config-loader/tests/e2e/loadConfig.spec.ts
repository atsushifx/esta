// src: ./__tests__/loadConfig.spec.ts
// @(#): loadConfig E2E テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// types
import { TSearchConfigFileType } from '../../shared/types/searchFileType.types';

// test unit
import { loadConfig } from '@/loadConfig';

// test framework
import { agE2ETestFramework } from '@agla-e2e/fileio-framework';
import type { AgE2eConfigFileSpec, AgE2eTestScenario } from '@agla-e2e/fileio-framework';

// Helper function to wrap loadConfig for executeTest
const loadConfigWrapper = async <T = object>(...args: unknown[]): Promise<T> => {
  return await loadConfig<T>(
    args[0] as string,
    args[1] as string,
    args[2] as TSearchConfigFileType | undefined,
  );
};

describe('loadConfig E2E', () => {
  it('loads JSON config file', async () => {
    const configData = { name: 'Test App', version: '1.0.0', debug: true };
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: 'myapp.json', content: configData, format: 'json' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'json-test',
      'testApp',
      configFiles,
      loadConfigWrapper<typeof configData>,
      'myapp',
      'testApp',
    );

    expect(result).toEqual(configData);
  });

  it('loads YAML config file', async () => {
    const yamlContent = `
name: Test App
version: 1.0.0
debug: true
features:
  - auth
  - logging
`;
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: 'myapp.yaml', content: yamlContent, format: 'yaml' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'yaml-test',
      'testApp',
      configFiles,
      loadConfigWrapper,
      'myapp',
      'testApp',
    );

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
      features: ['auth', 'logging'],
    });
  });

  it('loads JSONC config file with comments', async () => {
    const jsoncContent = `{
  // Application configuration
  "name": "Test App",
  "version": "1.0.0",
  /* Multi-line comment
     for debug flag */
  "debug": true
}`;
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: 'myapp.jsonc', content: jsoncContent, format: 'json' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'jsonc-test',
      'testApp',
      configFiles,
      loadConfigWrapper,
      'myapp',
      'testApp',
    );

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
    });
  });

  it('loads TypeScript config file', async () => {
    const tsContent = `export default {
  name: 'Test App',
  version: '1.0.0',
  debug: true,
  database: {
    host: 'localhost',
    port: 5432
  }
};`;
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: 'myapp.ts', content: tsContent, format: 'typescript' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'ts-test',
      'testApp',
      configFiles,
      loadConfigWrapper,
      'myapp',
      'testApp',
    );

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
      database: {
        host: 'localhost',
        port: 5432,
      },
    });
  });

  it('loads config with dot prefix', async () => {
    const configData = { hidden: true, name: 'Hidden Config' };
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: '.myapp.json', content: configData, format: 'json' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'dot-prefix-test',
      'testApp',
      configFiles,
      loadConfigWrapper,
      'myapp',
      'testApp',
    );

    expect(result).toEqual(configData);
  });

  it('prioritizes files without dot prefix over files with dot prefix', async () => {
    const normalConfigData = { priority: 'normal', name: 'Normal Config' };
    const hiddenConfigData = { priority: 'hidden', name: 'Hidden Config' };
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: 'myapp.json', content: normalConfigData, format: 'json' },
      { filename: '.myapp.json', content: hiddenConfigData, format: 'json' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'priority-test',
      'testApp',
      configFiles,
      loadConfigWrapper,
      'myapp',
      'testApp',
    );

    expect(result).toEqual(normalConfigData);
  });

  it('throws error when config file not found', async () => {
    const configFiles: AgE2eConfigFileSpec[] = [];

    await expect(async () => {
      await agE2ETestFramework.executeTest(
        'not-found-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'nonexistent',
        'testApp',
      );
    }).rejects.toThrow('Config file not found.');
  });

  it('uses current working directory as default', async () => {
    const configData = { test: true };
    const configFiles: AgE2eConfigFileSpec[] = [
      { filename: 'testConfig.json', content: configData, format: 'json' },
    ];

    const result = await agE2ETestFramework.executeTest(
      'cwd-test',
      'testConfig',
      configFiles,
      loadConfigWrapper,
      'testConfig',
      'testConfig',
    );

    expect(result).toEqual(configData);
  });

  describe('TEstaSearchConfigFileType tests', () => {
    it('loads config with USER search type (default)', async () => {
      const configData = { type: 'user', name: 'User Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'userApp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'user-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'userApp',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('loads config with SYSTEM search type', async () => {
      const configData = { type: 'system', name: 'System Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'systemApp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'system-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'systemApp',
        'testApp',
        TSearchConfigFileType.SYSTEM,
      );

      expect(result).toEqual(configData);
    });

    it('defaults to USER search type when not specified', async () => {
      const configData = { type: 'default', name: 'Default Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'defaultApp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'default-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'defaultApp',
        'testApp',
      );

      expect(result).toEqual(configData);
    });
  });

  describe('Parameterized tests example', () => {
    it('runs multiple config format tests', async () => {
      const scenarios: AgE2eTestScenario[] = [
        {
          description: 'JSON format',
          configFiles: [{ filename: 'app.json', content: { format: 'json' }, format: 'json' }],
          functionArgs: ['app', 'testApp'],
          expectedResult: { format: 'json' },
        },
        {
          description: 'YAML format',
          configFiles: [{ filename: 'app.yaml', content: 'format: yaml', format: 'yaml' }],
          functionArgs: ['app', 'testApp'],
          expectedResult: { format: 'yaml' },
        },
      ];

      const results = await agE2ETestFramework.runParameterizedTests(
        'multi-format-test',
        'testApp',
        scenarios,
        loadConfigWrapper,
      );

      for (const { scenario, result } of results) {
        expect(await result).toEqual(scenario.expectedResult);
      }
    });
  });
});
