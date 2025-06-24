// src: ./tests/e2e/FileIOFramework.ts
// @(#): ファイルI/Oテストフレームワーク - パラメータ化されたファイル操作
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// file io utils
import { createDirectory, fileExists, readFile, writeExpectedResult, writeFile } from './utils/agE2eFileIoUtils';

import type { AgE2eConfigFileSpec, AgE2eTestScenario } from '../shared/types/e2e-framework.types';
import type { TestEnvironment } from './types';

// types

export class AgE2eFileIOFramework {
  private environments: Map<string, TestEnvironment> = new Map();

  /**
   * テスト環境のセットアップ
   */
  setupEnvironment(testId: string, configDirName: string): TestEnvironment {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-loader-test-'));
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
   * テスト環境のクリーンアップ
   */
  cleanupEnvironment(testId: string): void {
    const env = this.environments.get(testId);
    if (!env) { return; }

    if (fs.existsSync(env.tempDir)) {
      fs.rmSync(env.tempDir, { recursive: true, force: true });
    }

    if (env.originalXdgConfigHome !== undefined) {
      process.env.XDG_CONFIG_HOME = env.originalXdgConfigHome;
    } else {
      delete process.env.XDG_CONFIG_HOME;
    }

    this.environments.delete(testId);
  }

  /**
   * 設定ファイルの作成
   */
  createConfigFile(env: TestEnvironment, spec: AgE2eConfigFileSpec): string {
    const filePath = path.join(env.configDir, spec.filename);

    if (typeof spec.content === 'string') {
      writeFile(filePath, spec.content);
    } else {
      writeFile(filePath, spec.content, spec.format);
    }

    return filePath;
  }

  /**
   * 複数の設定ファイルを作成
   */
  createConfigFiles(env: TestEnvironment, specs: AgE2eConfigFileSpec[]): string[] {
    return specs.map((spec) => this.createConfigFile(env, spec));
  }

  /**
   * 汎用テスト実行関数
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
   * パラメータ化されたテストの実行
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

  /**
   * テスト結果とファイル内容の比較
   */
  compareWithFileContent(result: unknown, filePath: string): boolean {
    if (!fileExists(filePath)) {
      return false;
    }

    const fileContent = readFile(filePath);
    let expectedResult: unknown;

    try {
      expectedResult = JSON.parse(fileContent);
    } catch {
      expectedResult = fileContent;
    }

    return JSON.stringify(result) === JSON.stringify(expectedResult);
  }

  /**
   * 期待値ファイルへの結果書き込み
   */
  writeExpectedResult(result: unknown, filePath: string): void {
    writeExpectedResult(result, filePath);
  }
}

export const agE2ETestFramework = new AgE2eFileIOFramework();
