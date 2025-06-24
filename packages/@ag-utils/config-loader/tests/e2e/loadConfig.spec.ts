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
import { SearchConfigFileType } from '@shared/types/common.types';

// test unit
import { loadConfig } from '@/loadConfig';

// test framework
import { type ConfigFileSpec, testFramework, type TestScenario } from './FileIoFramework';

describe('loadConfig E2E', () => {
  it('loads JSON config file', () => {
    const configData = { name: 'Test App', version: '1.0.0', debug: true };
    const configFiles: ConfigFileSpec[] = [
      { filename: 'myapp.json', content: configData, format: 'json' },
    ];

    const result = testFramework.executeTest(
      'json-test',
      'testApp',
      configFiles,
      loadConfig<typeof configData>,
      'myapp',
      'testApp',
    );

    expect(result).toEqual(configData);
  });

  it('loads YAML config file', () => {
    const yamlContent = `
name: Test App
version: 1.0.0
debug: true
features:
  - auth
  - logging
`;
    const configFiles: ConfigFileSpec[] = [
      { filename: 'myapp.yaml', content: yamlContent, format: 'yaml' },
    ];

    const result = testFramework.executeTest(
      'yaml-test',
      'testApp',
      configFiles,
      loadConfig,
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

  it('loads JSONC config file with comments', () => {
    const jsoncContent = `{
  // Application configuration
  "name": "Test App",
  "version": "1.0.0",
  /* Multi-line comment
     for debug flag */
  "debug": true
}`;
    const configFiles: ConfigFileSpec[] = [
      { filename: 'myapp.jsonc', content: jsoncContent, format: 'jsonc' },
    ];

    const result = testFramework.executeTest(
      'jsonc-test',
      'testApp',
      configFiles,
      loadConfig,
      'myapp',
      'testApp',
    );

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
    });
  });

  it('loads TypeScript config file', () => {
    const tsContent = `export default {
  name: 'Test App',
  version: '1.0.0',
  debug: true,
  database: {
    host: 'localhost',
    port: 5432
  }
};`;
    const configFiles: ConfigFileSpec[] = [
      { filename: 'myapp.ts', content: tsContent, format: 'ts' },
    ];

    const result = testFramework.executeTest(
      'ts-test',
      'testApp',
      configFiles,
      loadConfig,
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

  it('loads config with dot prefix', () => {
    const configData = { hidden: true, name: 'Hidden Config' };
    const configFiles: ConfigFileSpec[] = [
      { filename: '.myapp.json', content: configData, format: 'json' },
    ];

    const result = testFramework.executeTest(
      'dot-prefix-test',
      'testApp',
      configFiles,
      loadConfig,
      'myapp',
      'testApp',
    );

    expect(result).toEqual(configData);
  });

  it('prioritizes files without dot prefix over files with dot prefix', () => {
    const normalConfigData = { priority: 'normal', name: 'Normal Config' };
    const hiddenConfigData = { priority: 'hidden', name: 'Hidden Config' };
    const configFiles: ConfigFileSpec[] = [
      { filename: 'myapp.json', content: normalConfigData, format: 'json' },
      { filename: '.myapp.json', content: hiddenConfigData, format: 'json' },
    ];

    const result = testFramework.executeTest(
      'priority-test',
      'testApp',
      configFiles,
      loadConfig,
      'myapp',
      'testApp',
    );

    expect(result).toEqual(normalConfigData);
  });

  it('throws error when config file not found', () => {
    const configFiles: ConfigFileSpec[] = [];

    expect(() => {
      testFramework.executeTest(
        'not-found-test',
        'testApp',
        configFiles,
        loadConfig,
        'nonexistent',
        'testApp',
      );
    }).toThrow('Config file not found.');
  });

  it('uses current working directory as default', () => {
    const configData = { test: true };
    const configFiles: ConfigFileSpec[] = [
      { filename: 'testConfig.json', content: configData, format: 'json' },
    ];

    const result = testFramework.executeTest(
      'cwd-test',
      'testConfig',
      configFiles,
      loadConfig,
      'testConfig',
      'testConfig',
    );

    expect(result).toEqual(configData);
  });

  describe('SearchConfigFileType tests', () => {
    it('loads config with USER search type (default)', () => {
      const configData = { type: 'user', name: 'User Config' };
      const configFiles: ConfigFileSpec[] = [
        { filename: 'userApp.json', content: configData, format: 'json' },
      ];

      const result = testFramework.executeTest(
        'user-type-test',
        'testApp',
        configFiles,
        loadConfig,
        'userApp',
        'testApp',
        SearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('loads config with SYSTEM search type', () => {
      const configData = { type: 'system', name: 'System Config' };
      const configFiles: ConfigFileSpec[] = [
        { filename: 'systemApp.json', content: configData, format: 'json' },
      ];

      const result = testFramework.executeTest(
        'system-type-test',
        'testApp',
        configFiles,
        loadConfig,
        'systemApp',
        'testApp',
        SearchConfigFileType.SYSTEM,
      );

      expect(result).toEqual(configData);
    });

    it('defaults to USER search type when not specified', () => {
      const configData = { type: 'default', name: 'Default Config' };
      const configFiles: ConfigFileSpec[] = [
        { filename: 'defaultApp.json', content: configData, format: 'json' },
      ];

      const result = testFramework.executeTest(
        'default-type-test',
        'testApp',
        configFiles,
        loadConfig,
        'defaultApp',
        'testApp',
      );

      expect(result).toEqual(configData);
    });
  });

  describe('Parameterized tests example', () => {
    it('runs multiple config format tests', () => {
      const scenarios: TestScenario[] = [
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

      const results = testFramework.runParameterizedTests(
        'multi-format-test',
        'testApp',
        scenarios,
        loadConfig,
      );

      results.forEach(({ scenario, result }) => {
        expect(result).toEqual(scenario.expectedResult);
      });
    });
  });
});
