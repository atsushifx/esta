// src: tests/e2e/runtime-detect/helpers/runtime-detector.ts
// @(#) : Runtime detector helper program for E2E testing
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Internal module imports - runtime detection functionality
import { getRuntime } from '../../../../src/getRuntime.ts';

// Type exports for E2E tests
export type { TExecRuntime } from '../../../../shared/types/TExecRuntime.types.ts';
export { getRuntime } from '../../../../src/getRuntime.ts';

/** 現在のランタイム環境を検出した結果 */
const runtime = getRuntime();

/**
 * E2Eテスト用のJSON出力結果オブジェクト
 * ランタイム検出結果、タイムスタンプ、プロセス情報、実行ステータスを含む
 */
const result = {
  /** 検出されたランタイム環境 */
  runtime,

  /** 実行時のタイムスタンプ（ISO 8601形式） */
  timestamp: new Date().toISOString(),

  /** プロセスバージョン情報または'unknown' */
  process: process.version || 'unknown',

  /** 実行ステータス - 成功時は'success' */
  status: 'success',
};

console.log(JSON.stringify(result));
