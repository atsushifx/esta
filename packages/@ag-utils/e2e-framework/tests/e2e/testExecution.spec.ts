// tests: ./tests/e2e/testExecution.spec.ts
// @(#): E2Eテスト実行 - AgE2eFileIOFrameworkの完全なワークフローテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as fs from 'fs';
import * as path from 'path';

// vitest
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

// test target
import { AgE2eFileIOFramework } from '../../src/AgE2eFileIoFramework';

import type { AgE2eConfigFileSpec, AgE2eTestScenario } from '../../shared/types/e2e-framework.types';

describe('E2E Test Execution Workflow', () => {
  let framework: AgE2eFileIOFramework;
  let testId: string;

  beforeEach(() => {
    framework = new AgE2eFileIOFramework();
    testId = `e2e-test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  });

  afterEach(() => {
    framework.cleanupEnvironment(testId);
  });

  describe('Complete Test Workflow', () => {
    test('executes full workflow: setup → config creation → test execution → cleanup', () => {
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'app.json', content: { name: 'test-app', version: '1.0.0' }, format: 'json' },
        { filename: 'settings.ts', content: { debug: true, port: 3000 }, format: 'ts' },
      ];

      const mockConfigLoader = (configPath: string): Record<string, unknown> => {
        const configContent = fs.readFileSync(configPath, 'utf8');
        if (configPath.endsWith('.json')) {
          return JSON.parse(configContent);
        }
        if (configPath.endsWith('.ts')) {
          const match = configContent.match(/export default (.*);/);
          return match ? JSON.parse(match[1]) : {};
        }
        return {};
      };

      const env = framework.setupEnvironment(testId, 'test-app-config');
      let result: Record<string, unknown>;

      try {
        framework.createConfigFiles(env, configFiles);
        const configPath = path.join(env.configDir, 'app.json');
        result = mockConfigLoader(configPath);
      } finally {
        framework.cleanupEnvironment(testId);
      }

      expect(result).toEqual({ name: 'test-app', version: '1.0.0' });
    });

    test('handles complex multi-step configuration loading workflow', () => {
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'base.json', content: { environment: 'test', logging: { level: 'debug' } }, format: 'json' },
        { filename: 'overrides.json', content: { logging: { level: 'info', format: 'json' } }, format: 'json' },
        { filename: 'secrets.json', content: { apiKey: 'test-key-123', dbUrl: 'test://localhost' }, format: 'json' },
      ];

      const mockComplexConfigLoader = (basePath: string): Record<string, unknown> => {
        const baseConfigPath = path.join(basePath, 'base.json');
        const overridePath = path.join(basePath, 'overrides.json');
        const secretsPath = path.join(basePath, 'secrets.json');

        const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'));
        const overrides = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
        const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

        return {
          ...baseConfig,
          logging: { ...baseConfig.logging, ...overrides.logging },
          ...secrets,
        };
      };

      const env = framework.setupEnvironment(testId, 'complex-config');
      try {
        framework.createConfigFiles(env, configFiles);
        const result = mockComplexConfigLoader(env.configDir);

        expect(result).toEqual({
          environment: 'test',
          logging: { level: 'info', format: 'json' },
          apiKey: 'test-key-123',
          dbUrl: 'test://localhost',
        });
      } finally {
        framework.cleanupEnvironment(testId);
      }
    });
  });

  describe('Parameterized E2E Test Scenarios', () => {
    test('runs multiple real-world configuration scenarios', () => {
      const scenarios: AgE2eTestScenario[] = [
        {
          description: 'Development environment configuration',
          configFiles: [
            { filename: 'config.json', content: { env: 'development', debug: true, port: 3000 }, format: 'json' },
          ],
          functionArgs: ['development'],
          expectedResult: { env: 'development', debug: true, port: 3000 },
        },
        {
          description: 'Production environment configuration',
          configFiles: [
            { filename: 'config.json', content: { env: 'production', debug: false, port: 8080 }, format: 'json' },
          ],
          functionArgs: ['production'],
          expectedResult: { env: 'production', debug: false, port: 8080 },
        },
        {
          description: 'TypeScript configuration export',
          configFiles: [
            { filename: 'config.ts', content: { database: { host: 'localhost', port: 5432 } }, format: 'ts' },
          ],
          functionArgs: ['typescript'],
          expectedResult: { database: { host: 'localhost', port: 5432 } },
        },
      ];

      const mockEnvironmentConfigLoader = (envType: string, configDir: string): Record<string, unknown> => {
        if (envType === 'typescript') {
          const tsConfigPath = path.join(configDir, 'config.ts');
          const content = fs.readFileSync(tsConfigPath, 'utf8');
          const match = content.match(/export default (.+);/s);
          return match ? JSON.parse(match[1]) : {};
        } else {
          const jsonConfigPath = path.join(configDir, 'config.json');
          return JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8'));
        }
      };

      const results: { scenario: AgE2eTestScenario; result: Record<string, unknown> | Error }[] = [];

      scenarios.forEach((scenario, index) => {
        const uniqueTestId = `${testId}-${index}`;
        const env = framework.setupEnvironment(uniqueTestId, 'test-config');

        try {
          framework.createConfigFiles(env, scenario.configFiles);
          const result = mockEnvironmentConfigLoader(scenario.functionArgs[0] as string, env.configDir);
          results.push({ scenario, result });
        } catch (error) {
          results.push({ scenario, result: error as Error });
        } finally {
          framework.cleanupEnvironment(uniqueTestId);
        }
      });

      expect(results).toHaveLength(3);

      results.forEach((result, index) => {
        expect(result.result).toEqual(scenarios[index].expectedResult);
        expect(result.scenario.description).toBe(scenarios[index].description);
      });
    });

    test('handles error scenarios in parameterized tests', () => {
      const errorScenarios: AgE2eTestScenario[] = [
        {
          description: 'Missing configuration file',
          configFiles: [],
          functionArgs: ['missing-config'],
          shouldThrow: true,
          expectedError: 'Configuration file not found',
        },
        {
          description: 'Invalid JSON configuration',
          configFiles: [
            { filename: 'invalid.json', content: '{ invalid json }' },
          ],
          functionArgs: ['invalid-json'],
          shouldThrow: true,
          expectedError: 'Invalid JSON format',
        },
      ];

      const mockErrorProneConfigLoader = (...args: unknown[]): never => {
        const configType = args[0] as string;
        if (configType === 'missing-config') {
          throw new Error('Configuration file not found');
        }
        if (configType === 'invalid-json') {
          throw new Error('Invalid JSON format');
        }
        throw new Error('Unknown error');
      };

      const results = framework.runParameterizedTests(
        testId,
        'error-test-config',
        errorScenarios,
        mockErrorProneConfigLoader,
      );

      expect(results).toHaveLength(2);

      results.forEach((result, index) => {
        expect(result.result).toBeInstanceOf(Error);
        if (result.result instanceof Error) {
          expect(result.result.message).toBe(errorScenarios[index].expectedError);
        }
      });
    });
  });

  describe('File Content Comparison E2E', () => {
    test('compares test results with expected output files', () => {
      const testResult = {
        status: 'success',
        tests: [
          { name: 'test1', passed: true, duration: 15 },
          { name: 'test2', passed: true, duration: 23 },
        ],
        summary: { total: 2, passed: 2, failed: 0 },
      };

      const env = framework.setupEnvironment(testId, 'comparison-test');

      try {
        // Write expected result
        const expectedFilePath = path.join(env.configDir, 'expected-result.json');
        framework.writeExpectedResult(testResult, expectedFilePath);

        // Compare with same result
        const comparisonResult = framework.compareWithFileContent(testResult, expectedFilePath);
        expect(comparisonResult).toBe(true);

        // Compare with different result
        const differentResult = { ...testResult, summary: { total: 2, passed: 1, failed: 1 } };
        const differentComparisonResult = framework.compareWithFileContent(differentResult, expectedFilePath);
        expect(differentComparisonResult).toBe(false);
      } finally {
        framework.cleanupEnvironment(testId);
      }
    });

    test('handles string-based configuration comparison', () => {
      const configContent = `
# Application Configuration
app.name=test-application
app.version=1.2.3
app.environment=test

# Database Settings
db.host=localhost
db.port=5432
db.name=test_database
      `.trim();

      const env = framework.setupEnvironment(testId, 'string-comparison-test');

      try {
        const configFilePath = path.join(env.configDir, 'app.properties');
        framework.writeExpectedResult(configContent, configFilePath);

        const comparisonResult = framework.compareWithFileContent(configContent, configFilePath);
        expect(comparisonResult).toBe(true);
      } finally {
        framework.cleanupEnvironment(testId);
      }
    });
  });

  describe('Environment Integration', () => {
    test('verifies XDG_CONFIG_HOME environment variable handling', () => {
      const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;

      const env = framework.setupEnvironment(testId, 'xdg-test');

      // Verify XDG_CONFIG_HOME is set to temp directory
      expect(process.env.XDG_CONFIG_HOME).toBe(env.tempDir);
      expect(process.env.XDG_CONFIG_HOME).not.toBe(originalXdgConfigHome);

      // Verify config directory exists within XDG_CONFIG_HOME
      expect(env.configDir).toBe(path.join(env.tempDir, 'xdg-test'));
      expect(fs.existsSync(env.configDir)).toBe(true);

      framework.cleanupEnvironment(testId);

      // Verify XDG_CONFIG_HOME is restored after cleanup
      expect(process.env.XDG_CONFIG_HOME).toBe(originalXdgConfigHome);
    });
  });
});
