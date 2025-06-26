// src: ./tests/e2e/FileIOFramework.ts
// @(#): ファイルI/Oテストフレームワーク - パラメータ化されたファイル操作
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgE2eConfigFileSpec, AgE2eTestScenario } from '../shared/types/e2e-framework.types';
import type { TestEnvironment } from './types';

// lib
import * as path from 'path';

// file io utils
import {
  createDirectory,
  createTempDirectory,
  fileExists,
  readFile,
  removeDirectory,
  writeExpectedResult,
  writeFile,
  writeFileSync,
} from './utils/agE2eFileIoUtils';

// types

export class AgE2eFileIOFramework {
  private environments: Map<string, TestEnvironment> = new Map();

  // ---------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // ---------------------------------------------------------------------------

  private _restoreEnvironmentVariables(originalXdgConfigHome: string | undefined): void {
    if (originalXdgConfigHome !== undefined) {
      process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
    } else {
      delete process.env.XDG_CONFIG_HOME;
    }
  }

  private _parseExpectedResult(content: string): unknown {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - ENVIRONMENT MANAGEMENT
  // ---------------------------------------------------------------------------

  setupEnvironment(testId: string, configDirName: string): TestEnvironment {
    const tempDir = createTempDirectory('config-loader-test-');
    const configDir = path.join(tempDir, configDirName);

    createDirectory(configDir);

    const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
    process.env.XDG_CONFIG_HOME = tempDir;

    const env: TestEnvironment = {
      tempDir,
      configDir,
      originalXdgConfigHome,
    };

    this.environments.set(testId, env);
    return env;
  }

  async cleanupEnvironment(testId: string): Promise<void> {
    const env = this.environments.get(testId);
    if (!env) { return; }

    await removeDirectory(env.tempDir);
    this._restoreEnvironmentVariables(env.originalXdgConfigHome);
    this.environments.delete(testId);
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - CONFIG FILE OPERATIONS
  // ---------------------------------------------------------------------------

  createConfigFile(env: TestEnvironment, spec: AgE2eConfigFileSpec): string {
    const filePath = path.join(env.configDir, spec.filename);

    if (typeof spec.content === 'string') {
      writeFileSync(filePath, spec.content);
    } else {
      writeFileSync(filePath, spec.content, spec.format);
    }

    return filePath;
  }

  createConfigFiles(env: TestEnvironment, specs: AgE2eConfigFileSpec[]): string[] {
    return specs.map((spec) => this.createConfigFile(env, spec));
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - TEST EXECUTION
  // ---------------------------------------------------------------------------

  executeTest<T>(
    testId: string,
    configDirName: string,
    configFiles: AgE2eConfigFileSpec[],
    testFunction: (...args: unknown[]) => T,
    ...functionArgs: unknown[]
  ): T {
    const env = this.setupEnvironment(testId, configDirName);

    try {
      this.createConfigFiles(env, configFiles);
      return testFunction(...functionArgs);
    } finally {
      this.cleanupEnvironment(testId);
    }
  }

  runParameterizedTests<T>(
    testId: string,
    configDirName: string,
    scenarios: AgE2eTestScenario[],
    testFunction: (...args: unknown[]) => T,
  ): { scenario: AgE2eTestScenario; result: T | Error }[] {
    return scenarios.map((scenario, index) => {
      const uniqueTestId = `${testId}-${index}`;
      try {
        const result = this.executeTest(
          uniqueTestId,
          configDirName,
          scenario.configFiles,
          testFunction,
          ...scenario.functionArgs,
        );
        return { scenario, result };
      } catch (error) {
        return { scenario, result: error as Error };
      }
    });
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - TEST RESULT OPERATIONS
  // ---------------------------------------------------------------------------

  async compareWithFileContent(result: unknown, filePath: string): Promise<boolean> {
    if (!fileExists(filePath)) {
      return false;
    }

    const fileContent = await readFile(filePath);
    const expectedResult = this._parseExpectedResult(fileContent);

    return JSON.stringify(result) === JSON.stringify(expectedResult);
  }

  writeExpectedResult(result: unknown, filePath: string): void {
    writeExpectedResult(result, filePath);
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - FILE OPERATIONS (DELEGATED)
  // ---------------------------------------------------------------------------

  async readFile(filePath: string): Promise<string> {
    return await readFile(filePath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content);
  }

  fileExists(filePath: string): boolean {
    return fileExists(filePath);
  }

  createTempDirectory(prefix: string): string {
    return createTempDirectory(prefix);
  }

  async removeDirectory(dirPath: string): Promise<void> {
    await removeDirectory(dirPath);
  }
}

export const agE2ETestFramework = new AgE2eFileIOFramework();
