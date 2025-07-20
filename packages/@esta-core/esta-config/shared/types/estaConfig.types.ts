// shared/types/estaConfig.types.ts
// @(#) : EstaConfig type definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel } from '@agla-utils/ag-logger';

/**
 * ESTA統合設定のメイン型定義
 */
export type EstaConfig = {
  /** ツール設定ファイルのパス */
  toolsConfigPath: string;
  /** ログ出力レベル */
  logLevel: AgLogLevel;
};

/**
 * ESTA統合設定の部分型定義（設定ファイル用）
 */
export type PartialEstaConfig = {
  /** ツール設定ファイルのパス */
  toolsConfigPath?: string;
  /** ログ出力レベル */
  logLevel?: AgLogLevel;
};
