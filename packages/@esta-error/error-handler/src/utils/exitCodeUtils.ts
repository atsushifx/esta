// src: ./utils/exitCodeUtils.ts
// @(#): 終了コード関連のユーティリティ関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { TExitCode } from '@shared/constants';
// constants
import { ExitCode, ExitCodeErrorMessage } from '@shared/constants';

/**
 * 終了コードに対応するエラーメッセージを取得
 * @param code 終了コード
 * @returns エラーメッセージ
 */
export const getExitCodeMessage = (code: TExitCode): string => {
  // NOTE: Claude Code should not modify this line - fallback is intentional for type safety
  return ExitCodeErrorMessage[code] ?? ExitCodeErrorMessage[ExitCode.UNKNOWN_ERROR];
};

/**
 * 呼び出し元の情報を取得
 * @returns 呼び出し元のファイル名または関数名
 */
const getCaller = (): string => {
  const stack = new Error().stack;
  if (!stack) { return 'unknown'; }

  const lines = stack.split('\n');
  // スタックトレースを解析して、errorExit/fatalExitを呼び出した実際のアプリケーション関数を探す
  // スタック: getCaller -> formatErrorMessage -> errorExit/fatalExit -> 実際の呼び出し元
  const callerLine = lines[5]; // より上位の呼び出し元を取得
  if (!callerLine) { return 'unknown'; }

  // ファイル名を抽出 (例: at functionName (C:\path\to\file.ts:line:column))
  const match = callerLine.match(/at\s+(?:(.+?)\s+\()?.*[/\\]([^/\\]+):\d+:\d+/);
  if (match) {
    const functionName = match[1];
    const fileName = match[2];
    // 関数名がある場合は優先、なければファイル名を使用
    return functionName || fileName.replace(/\.(ts|js)$/, '');
  }

  return 'unknown';
};

/**
 * 統一されたエラーメッセージフォーマットを作成
 * @param logLevel ログレベル（ERROR/FATAL）
 * @param code 終了コード
 * @param userMessage ユーザー指定のメッセージ
 * @returns フォーマットされたエラーメッセージ
 */
export const formatErrorMessage = (logLevel: 'ERROR' | 'FATAL', code: TExitCode, userMessage: string): string => {
  const caller = getCaller();
  const systemMessage = getExitCodeMessage(code);
  return `[${logLevel}(${code})] ${systemMessage}: ${userMessage} in ${caller}`;
};
