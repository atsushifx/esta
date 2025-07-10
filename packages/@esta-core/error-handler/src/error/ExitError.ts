// src: ./error/ExitError.ts
// @(#): 終了エラークラス実装
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { TExitCode } from '@shared/constants/exitCode';

/**
 * 終了コードと致命的フラグを持つカスタムエラークラス
 * アプリケーションの終了時に使用される統一されたエラー処理を提供
 */
export class ExitError extends Error {
  readonly code: TExitCode;
  readonly fatal: boolean;

  /**
   * ExitErrorインスタンスを作成
   * @param code 終了コード
   * @param message エラーメッセージ
   * @param fatal 致命的エラーかどうか（デフォルト: false）
   */
  constructor(code: TExitCode, message: string, fatal = false) {
    super(message);
    this.name = 'ExitError';
    this.code = code;
    this.fatal = fatal;
    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace?.(this, ExitError);
  }

  /**
   * エラーが致命的かどうかを判定
   * @returns 致命的エラーの場合true
   */
  isFatal(): boolean {
    return this.fatal;
  }
}
