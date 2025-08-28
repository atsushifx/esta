// tests/e2e/helpers/runtimeTestUtils.ts
// @(#) : E2E test helper functions for runtime detection tests
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Node.js built-in modules
import { exec } from 'child_process';
import { promisify } from 'util';

// Test framework utilities
import { expect } from 'vitest';

/** 非同期exec関数 - child_processのexecをPromise化 */
const execAsync = promisify(exec);

/**
 * ランタイム検出テストの結果を表す型定義
 */
export type RuntimeTestResult = {
  /** 実行ステータス - 通常は'success'または'error' */
  status: string;

  /** 検出されたランタイム名 - TExecRuntimeのenum値と対応 */
  runtime: string;

  /** テスト実行時のタイムスタンプ - ISO 8601形式 */
  timestamp: string;

  /** プロセス情報 - Node.jsの場合はversion、他の環境では識別情報 */
  process: string;
};

/**
 * ランタイム検出ヘルパープログラムを実行し、パースされた結果を返す
 *
 * @param command - 実行コマンド（'node', 'deno run', 'bun run'等）
 * @param helperPath - ヘルパープログラムのファイルパス
 * @returns ランタイム検出結果のPromise
 * @throws コマンド実行失敗またはJSON解析失敗時にエラーをthrow
 *
 * @example
 * ```typescript
 * const result = await executeRuntimeDetector('node', './helper.js');
 * console.log(result.runtime); // 'Node'
 * ```
 */
export const executeRuntimeDetector = async (command: string, helperPath: string): Promise<RuntimeTestResult> => {
  try {
    const { stdout, stderr } = await execAsync(`${command} "${helperPath}"`);

    if (stderr) {
      console.warn(`${command} stderr output:`, stderr);
    }

    expect(stdout.trim()).toBeTruthy();
    const result = JSON.parse(stdout.trim());

    // Validate result structure
    expect(result.status).toBe('success');
    expect(typeof result.runtime).toBe('string');
    expect(typeof result.timestamp).toBe('string');
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    expect(typeof result.process).toBe('string');

    return result;
  } catch (error) {
    const execError = error as { message?: string; stdout?: string; stderr?: string; code?: number };
    console.error(`${command} helper execution failed:`, {
      message: execError.message,
      stdout: execError.stdout,
      stderr: execError.stderr,
      code: execError.code,
    });
    throw error;
  }
};

/**
 * 指定されたランタイムが利用可能かチェックする
 *
 * @param command - チェックするランタイムコマンド（'node', 'deno', 'bun'等）
 * @returns ランタイムが利用可能な場合はtrue、そうでなければfalse
 *
 * @example
 * ```typescript
 * const isAvailable = await isRuntimeAvailable('deno');
 * if (isAvailable) {
 *   // Denoを使ったテストを実行
 * }
 * ```
 */
export const isRuntimeAvailable = async (command: string): Promise<boolean> => {
  try {
    const { stderr } = await execAsync(`${command} --version`);
    return !stderr || stderr.trim() === '';
  } catch {
    return false;
  }
};
