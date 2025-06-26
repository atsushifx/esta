// src: ./tests/e2e/FileIOFramework.ts
// @(#): File I/O Test Framework - Parameterized File Operations
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

/**
 * Main class for E2E File I/O testing framework.
 * Provides methods to setup isolated test environments,
 * manage configuration files, execute parameterized tests,
 * and perform file operations with convenience utilities.
 */
export class AgE2eFileIOFramework {
  private environments: Map<string, TestEnvironment> = new Map();

  // ---------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // ---------------------------------------------------------------------------

  /**
   * Restores the original XDG_CONFIG_HOME environment variable after a test.
   *
   * @param originalXdgConfigHome - The original XDG_CONFIG_HOME value or undefined if not set.
   */
  private _restoreEnvironmentVariables(originalXdgConfigHome: string | undefined): void {
    if (originalXdgConfigHome !== undefined) {
      process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
    } else {
      delete process.env.XDG_CONFIG_HOME;
    }
  }

  /**
   * Parses the expected result content, attempting JSON parse,
   * otherwise returns the raw string.
   *
   * @param content - The content string to parse.
   * @returns Parsed object or original string if parse fails.
   */
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

  /**
   * Sets up a temporary isolated environment for a test case.
   * Creates a temporary directory and configuration subdirectory,
   * and sets environment variables accordingly.
   *
   * @param testId - Unique identifier for the test.
   * @param configDirName - Name for the config directory inside temp directory.
   * @returns The created TestEnvironment object.
   */
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

  /**
   * Cleans up the environment for a given test ID.
   * Removes temporary directories and restores environment variables.
   *
   * @param testId - The test ID whose environment to clean up.
   */
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

  /**
   * Creates a configuration file in the test environment.
   *
   * @param env - The test environment.
   * @param spec - Specification of the config file to create.
   * @returns The full file path of the created file.
   */
  createConfigFile(env: TestEnvironment, spec: AgE2eConfigFileSpec): string {
    const filePath = path.join(env.configDir, spec.filename);

    if (typeof spec.content === 'string') {
      writeFileSync(filePath, spec.content);
    } else {
      writeFileSync(filePath, spec.content, spec.format);
    }

    return filePath;
  }

  /**
   * Creates multiple configuration files from specs.
   *
   * @param env - The test environment.
   * @param specs - Array of config file specifications.
   * @returns Array of created file paths.
   */
  createConfigFiles(env: TestEnvironment, specs: AgE2eConfigFileSpec[]): string[] {
    return specs.map((spec) => this.createConfigFile(env, spec));
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - TEST EXECUTION
  // ---------------------------------------------------------------------------

  /**
   * Executes a test function within a temporary environment.
   * Sets up environment, creates config files, executes test, and cleans up.
   *
   * @param testId - Unique test identifier.
   * @param configDirName - Config directory name inside temp environment.
   * @param configFiles - Config files to create.
   * @param testFunction - Test function to execute.
   * @param functionArgs - Arguments to pass to the test function.
   * @returns The result of the test function execution.
   */
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

  /**
   * Runs multiple parameterized test scenarios.
   *
   * @param testId - Base test ID.
   * @param configDirName - Config directory name.
   * @param scenarios - Array of test scenarios.
   * @param testFunction - Test function to run for each scenario.
   * @returns Array of objects containing scenario and result or error.
   */
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

  /**
   * Compares a test result with the content of a file.
   * Reads and parses the expected file content, then compares JSON stringified values.
   *
   * @param result - The test result to compare.
   * @param filePath - The file path containing expected content.
   * @returns True if result matches expected content, false otherwise.
   */
  async compareWithFileContent(result: unknown, filePath: string): Promise<boolean> {
    if (!fileExists(filePath)) {
      return false;
    }

    const fileContent = await readFile(filePath);
    const expectedResult = this._parseExpectedResult(fileContent);

    return JSON.stringify(result) === JSON.stringify(expectedResult);
  }

  /**
   * Writes the expected result to a file.
   *
   * @param result - The expected result to write.
   * @param filePath - The file path to write to.
   */
  writeExpectedResult(result: unknown, filePath: string): void {
    writeExpectedResult(result, filePath);
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API - FILE OPERATIONS (DELEGATED)
  // ---------------------------------------------------------------------------

  /**
   * Reads a file asynchronously.
   *
   * @param filePath - The path of the file to read.
   * @returns Promise resolving to file content string.
   */
  async readFile(filePath: string): Promise<string> {
    return await readFile(filePath);
  }

  /**
   * Writes content to a file asynchronously.
   *
   * @param filePath - The path of the file to write.
   * @param content - The string content to write.
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content);
  }

  /**
   * Checks synchronously if a file or directory exists.
   *
   * @param filePath - The path to check.
   * @returns True if exists, false otherwise.
   */
  fileExists(filePath: string): boolean {
    return fileExists(filePath);
  }

  /**
   * Creates a temporary directory with a given prefix.
   *
   * @param prefix - Prefix for the temporary directory.
   * @returns Path to the created temporary directory.
   */
  createTempDirectory(prefix: string): string {
    return createTempDirectory(prefix);
  }

  /**
   * Removes a directory asynchronously.
   *
   * @param dirPath - The directory path to remove.
   */
  async removeDirectory(dirPath: string): Promise<void> {
    await removeDirectory(dirPath);
  }
}

export const agE2ETestFramework = new AgE2eFileIOFramework();
