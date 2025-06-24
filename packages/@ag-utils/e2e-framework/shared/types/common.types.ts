// shared/types/testCommon.types.ts
// @(#): 共通テスト型定義 - E2Eテストフレームワーク用型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
