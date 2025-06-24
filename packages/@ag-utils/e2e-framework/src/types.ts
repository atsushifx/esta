// src/types.ts
// @(#): 内部型定義 - E2Eフレームワーク内部専用型
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @internal
 * E2Eフレームワーク内部でのみ使用されるテスト環境の定義
 */
export type TestEnvironment = {
  tempDir: string;
  configDir: string;
  originalXdgConfigHome: string | undefined;
};
