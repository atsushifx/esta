// shared/types/e2e-framework.types.ts
// @(#): E2Eフレームワーク型定義 - 外部公開用AgE2e型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * E2Eテストで使用する設定ファイルの仕様
 */
export type AgE2eConfigFileSpec = {
  filename: string;
  content: string | Record<string, unknown>;
  format?: 'json' | 'yaml' | 'jsonc' | 'ts';
};

/**
 * E2Eテストのシナリオ定義
 */
export type AgE2eTestScenario = {
  description: string;
  configFiles: AgE2eConfigFileSpec[];
  functionArgs: unknown[];
  expectedResult?: unknown;
  shouldThrow?: boolean;
  expectedError?: string;
};

/**
 * E2Eテストの実行結果
 */
export type AgE2eTestResult<T> = {
  scenario: AgE2eTestScenario;
  result: T | Error;
};
