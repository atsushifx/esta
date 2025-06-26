// tests: ./tests/e2e/testExecution.spec.ts
// @(#): E2Eテスト実行 - AgE2eFileIOFrameworkの完全なワークフローテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import type { AgE2eConfigFileSpec, AgE2eTestScenario } from '../../shared/types/e2e-framework.types';

import * as path from 'path';

// vitest
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

// test target
import { AgE2eFileIOFramework } from '../../src/AgE2eFileIoFramework';

describe('E2E Test Execution Workflow', () => {
  let framework: AgE2eFileIOFramework;
  let testId: string;

  beforeEach(() => {
    framework = new AgE2eFileIOFramework();
    testId = `e2e-test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  });

  afterEach(async () => {
    await framework.cleanupEnvironment(testId);
  });

  describe('Complete Test Workflow', () => {
    test('executes full workflow: setup → config creation → test execution → cleanup', async () => {
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'app.json', content: { name: 'test-app', version: '1.0.0' }, format: 'json' },
        { filename: 'settings.ts', content: { debug: true, port: 3000 }, format: 'typescript' },
      ];

      const mockConfigLoader = async (configPath: string): Promise<Record<string, unknown>> => {
        const configContent = await framework.readFile(configPath);
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
        result = await mockConfigLoader(configPath);
      } finally {
        await framework.cleanupEnvironment(testId);
      }

      expect(result).toEqual({ name: 'test-app', version: '1.0.0' });
    });

    test('handles complex multi-step configuration loading workflow', async () => {
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'base.json', content: { environment: 'test', logging: { level: 'debug' } }, format: 'json' },
        { filename: 'overrides.json', content: { logging: { level: 'info', format: 'json' } }, format: 'json' },
        { filename: 'secrets.json', content: { apiKey: 'test-key-123', dbUrl: 'test://localhost' }, format: 'json' },
      ];

      const mockComplexConfigLoader = async (basePath: string): Promise<Record<string, unknown>> => {
        const baseConfigPath = path.join(basePath, 'base.json');
        const overridePath = path.join(basePath, 'overrides.json');
        const secretsPath = path.join(basePath, 'secrets.json');

        const baseConfig = JSON.parse(await framework.readFile(baseConfigPath));
        const overrides = JSON.parse(await framework.readFile(overridePath));
        const secrets = JSON.parse(await framework.readFile(secretsPath));

        return {
          ...baseConfig,
          logging: { ...baseConfig.logging, ...overrides.logging },
          ...secrets,
        };
      };

      const env = framework.setupEnvironment(testId, 'complex-config');
      try {
        framework.createConfigFiles(env, configFiles);
        const result = await mockComplexConfigLoader(env.configDir);

        expect(result).toEqual({
          environment: 'test',
          logging: { level: 'info', format: 'json' },
          apiKey: 'test-key-123',
          dbUrl: 'test://localhost',
        });
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });
  });

  describe('Parameterized E2E Test Scenarios', () => {
    test('runs multiple real-world configuration scenarios', async () => {
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
            { filename: 'config.ts', content: { database: { host: 'localhost', port: 5432 } }, format: 'typescript' },
          ],
          functionArgs: ['typescript'],
          expectedResult: { database: { host: 'localhost', port: 5432 } },
        },
      ];

      const mockEnvironmentConfigLoader = async (
        envType: string,
        configDir: string,
      ): Promise<Record<string, unknown>> => {
        if (envType === 'typescript') {
          const tsConfigPath = path.join(configDir, 'config.ts');
          const content = await framework.readFile(tsConfigPath);
          const match = content.match(/export default (.+);/s);
          return match ? JSON.parse(match[1]) : {};
        } else {
          const jsonConfigPath = path.join(configDir, 'config.json');
          return JSON.parse(await framework.readFile(jsonConfigPath));
        }
      };

      const results: { scenario: AgE2eTestScenario; result: Record<string, unknown> | Error }[] = [];

      for (const [index, scenario] of scenarios.entries()) {
        const uniqueTestId = `${testId}-${index}`;
        const env = framework.setupEnvironment(uniqueTestId, 'test-config');

        try {
          framework.createConfigFiles(env, scenario.configFiles);
          const result = await mockEnvironmentConfigLoader(scenario.functionArgs[0] as string, env.configDir);
          results.push({ scenario, result });
        } catch (error) {
          results.push({ scenario, result: error as Error });
        } finally {
          await framework.cleanupEnvironment(uniqueTestId);
        }
      }

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
    test('compares test results with expected output files', async () => {
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
        const comparisonResult = await framework.compareWithFileContent(testResult, expectedFilePath);
        expect(comparisonResult).toBe(true);

        // Compare with different result
        const differentResult = { ...testResult, summary: { total: 2, passed: 1, failed: 1 } };
        const differentComparisonResult = await framework.compareWithFileContent(differentResult, expectedFilePath);
        expect(differentComparisonResult).toBe(false);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('handles string-based configuration comparison', async () => {
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

        const comparisonResult = await framework.compareWithFileContent(configContent, configFilePath);
        expect(comparisonResult).toBe(true);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('compareWithFileContent returns true for matching JSON content', async () => {
      const env = framework.setupEnvironment(testId, 'json-comparison-test');
      try {
        const filePath = path.join(env.configDir, 'expected.json');
        const expectedContent = { name: 'test', value: 42 };
        await framework.writeFile(filePath, JSON.stringify(expectedContent, null, 2));

        const result = await framework.compareWithFileContent(expectedContent, filePath);

        expect(result).toBe(true);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('compareWithFileContent returns true for matching string content', async () => {
      const env = framework.setupEnvironment(testId, 'string-comparison-test');
      try {
        const filePath = path.join(env.configDir, 'expected.txt');
        const expectedContent = 'test string';
        await framework.writeFile(filePath, expectedContent);

        const result = await framework.compareWithFileContent(expectedContent, filePath);

        expect(result).toBe(true);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('compareWithFileContent returns false for non-matching content', async () => {
      const env = framework.setupEnvironment(testId, 'mismatch-test');
      try {
        const filePath = path.join(env.configDir, 'expected.json');
        const fileContent = { name: 'test', value: 42 };
        const testContent = { name: 'different', value: 99 };
        await framework.writeFile(filePath, JSON.stringify(fileContent, null, 2));

        const result = await framework.compareWithFileContent(testContent, filePath);

        expect(result).toBe(false);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('compareWithFileContent returns false for non-existent file', async () => {
      const env = framework.setupEnvironment(testId, 'nonexistent-test');
      try {
        const filePath = path.join(env.configDir, 'non-existent.json');
        const testContent = { name: 'test' };

        const result = await framework.compareWithFileContent(testContent, filePath);

        expect(result).toBe(false);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('writeExpectedResult writes string content', async () => {
      const env = framework.setupEnvironment(testId, 'write-string-test');
      try {
        const filePath = path.join(env.configDir, 'expected.txt');
        const content = 'expected result';

        framework.writeExpectedResult(content, filePath);

        expect(framework.fileExists(filePath)).toBe(true);
        const readContent = await framework.readFile(filePath);
        expect(readContent).toBe(content);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('writeExpectedResult writes JSON content', async () => {
      const env = framework.setupEnvironment(testId, 'write-json-test');
      try {
        const filePath = path.join(env.configDir, 'expected.json');
        const content = { name: 'test', value: 42 };

        framework.writeExpectedResult(content, filePath);

        expect(framework.fileExists(filePath)).toBe(true);
        const readContent = await framework.readFile(filePath);
        const fileContent = JSON.parse(readContent);
        expect(fileContent).toEqual(content);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });
  });

  describe('Environment Integration', () => {
    test('verifies XDG_CONFIG_HOME environment variable handling', async () => {
      const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;

      const env = framework.setupEnvironment(testId, 'xdg-test');

      // Verify XDG_CONFIG_HOME is set to temp directory
      expect(process.env.XDG_CONFIG_HOME).toBe(env.tempDir);
      expect(process.env.XDG_CONFIG_HOME).not.toBe(originalXdgConfigHome);

      // Verify config directory exists within XDG_CONFIG_HOME
      expect(env.configDir).toBe(path.join(env.tempDir, 'xdg-test'));
      expect(framework.fileExists(env.configDir)).toBe(true);

      await framework.cleanupEnvironment(testId);

      // Verify XDG_CONFIG_HOME is restored after cleanup
      expect(process.env.XDG_CONFIG_HOME).toBe(originalXdgConfigHome);
    });

    test('setupEnvironment creates temporary directory and sets XDG_CONFIG_HOME', () => {
      const configDirName = 'test-config';
      const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;

      const env = framework.setupEnvironment(testId, configDirName);

      expect(env.tempDir).toBeTruthy();
      expect(framework.fileExists(env.tempDir)).toBe(true);
      expect(env.configDir).toBe(path.join(env.tempDir, configDirName));
      expect(framework.fileExists(env.configDir)).toBe(true);
      expect(env.originalXdgConfigHome).toBe(originalXdgConfigHome);
      expect(process.env.XDG_CONFIG_HOME).toBe(env.tempDir);
    });

    test('cleanupEnvironment removes temporary directory and restores XDG_CONFIG_HOME', async () => {
      const configDirName = 'test-config';
      const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;

      const env = framework.setupEnvironment(testId, configDirName);
      const tempDir = env.tempDir;

      expect(framework.fileExists(tempDir)).toBe(true);

      await framework.cleanupEnvironment(testId);

      expect(framework.fileExists(tempDir)).toBe(false);
      expect(process.env.XDG_CONFIG_HOME).toBe(originalXdgConfigHome);
    });

    test('cleanupEnvironment handles non-existent environment gracefully', async () => {
      await expect(framework.cleanupEnvironment('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('Config File Management E2E', () => {
    test('createConfigFile creates file with string content', async () => {
      const env = framework.setupEnvironment(testId, 'config-string-test');
      try {
        const spec = {
          filename: 'test.txt',
          content: 'test content',
        };

        const filePath = framework.createConfigFile(env, spec);

        expect(filePath).toBe(path.join(env.configDir, spec.filename));
        expect(framework.fileExists(filePath)).toBe(true);
        expect(await framework.readFile(filePath)).toBe(spec.content);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('createConfigFile creates JSON file with object content', async () => {
      const env = framework.setupEnvironment(testId, 'config-json-test');
      try {
        const spec = {
          filename: 'config.json',
          content: { name: 'test', value: 42 },
          format: 'json' as const,
        };

        const filePath = framework.createConfigFile(env, spec);

        expect(framework.fileExists(filePath)).toBe(true);
        const fileContent = JSON.parse(await framework.readFile(filePath));
        expect(fileContent).toEqual(spec.content);
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });

    test('createConfigFiles creates multiple files', async () => {
      const env = framework.setupEnvironment(testId, 'config-multiple-test');
      try {
        const specs = [
          { filename: 'config1.json', content: { a: 1 }, format: 'json' as const },
          { filename: 'config2.txt', content: 'text content' },
        ];

        const filePaths = framework.createConfigFiles(env, specs);

        expect(filePaths).toHaveLength(2);
        filePaths.forEach((filePath) => {
          expect(framework.fileExists(filePath)).toBe(true);
        });
      } finally {
        await framework.cleanupEnvironment(testId);
      }
    });
  });
});
