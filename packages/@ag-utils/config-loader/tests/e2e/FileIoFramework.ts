// src: ./tests/e2e/FileIOFramework.ts
// @(#): ファイルI/Oテストフレームワーク - パラメータ化されたファイル操作
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export type TestEnvironment = {
  tempDir: string;
  configDir: string;
  originalXdgConfigHome: string | undefined;
};

export type ConfigFileSpec = {
  filename: string;
  content: string | Record<string, unknown>;
  format?: 'json' | 'yaml' | 'jsonc' | 'ts';
};

export type TestScenario = {
  description: string;
  configFiles: ConfigFileSpec[];
  functionArgs: unknown[];
  expectedResult?: unknown;
  shouldThrow?: boolean;
  expectedError?: string;
};

export class FileIOFramework {
  private environments: Map<string, TestEnvironment> = new Map();

  /**
   * テスト環境のセットアップ
   */
  setupEnvironment(testId: string, configDirName: string): TestEnvironment {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-loader-test-'));
    const configDir = path.join(tempDir, configDirName);

    this.createDirectory(configDir);

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
   * ディレクトリ作成
   */
  createDirectory(dirPath: string): void {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  /**
   * ファイル書き込み
   */
  writeFile(filePath: string, content: string | Record<string, unknown>, format?: string): void {
    let fileContent: string;

    if (typeof content === 'string') {
      fileContent = content;
    } else {
      switch (format) {
        case 'json':
        case 'jsonc':
          fileContent = JSON.stringify(content, null, 2);
          break;
        case 'yaml':
          fileContent = content as unknown as string;
          break;
        case 'ts':
          fileContent = `export default ${JSON.stringify(content, null, 2)};`;
          break;
        default:
          fileContent = JSON.stringify(content, null, 2);
      }
    }

    fs.writeFileSync(filePath, fileContent);
  }

  /**
   * ファイル読み込み
   */
  readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * ファイル存在確認
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * 設定ファイルの作成
   */
  createConfigFile(env: TestEnvironment, spec: ConfigFileSpec): string {
    const filePath = path.join(env.configDir, spec.filename);

    if (typeof spec.content === 'string') {
      this.writeFile(filePath, spec.content);
    } else {
      this.writeFile(filePath, spec.content, spec.format);
    }

    return filePath;
  }

  /**
   * 複数の設定ファイルを作成
   */
  createConfigFiles(env: TestEnvironment, specs: ConfigFileSpec[]): string[] {
    return specs.map((spec) => this.createConfigFile(env, spec));
  }

  /**
   * 汎用テスト実行関数
   */
  executeTest<T>(
    testId: string,
    configDirName: string,
    configFiles: ConfigFileSpec[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testFunction: (...args: any[]) => T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...functionArgs: any[]
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
    scenarios: TestScenario[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testFunction: (...args: any[]) => T,
  ): { scenario: TestScenario; result: T | Error }[] {
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
    if (!this.fileExists(filePath)) {
      return false;
    }

    const fileContent = this.readFile(filePath);
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
    if (typeof result === 'string') {
      fs.writeFileSync(filePath, result);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    }
  }
}

export const testFramework = new FileIOFramework();
