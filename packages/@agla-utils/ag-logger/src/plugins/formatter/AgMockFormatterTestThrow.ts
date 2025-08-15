// src/plugins/formatter/AgMockFormatterTestThrow.ts
// @(#) : AgMockFormatterTestThrow - Mock formatter that throws configured errors for testing
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgFormattedLogMessage, AgLogMessage } from '../../../shared/types';

/**
 * AgMockFormatterTestThrow - Mock formatter class that throws configured errors
 *
 * エラー投げ専用のモックフォーマッター:
 * - エラーメッセージの設定・取得（setter/getter）
 * - 実行時に設定されたエラーメッセージを投げる
 * - 統計情報の追跡（呼び出し回数、最終メッセージ）
 * - AgMockFormatterの機能を継承
 *
 * @example
 * ```typescript
 * // Basic usage with error message
 * const formatter = new AgMockFormatterTestThrow('Test error');
 * expect(() => formatter.execute(logMessage)).toThrow('Test error');
 *
 * // Setting error message via property
 * formatter.errorMessage = 'Updated error';
 * expect(() => formatter.execute(logMessage)).toThrow('Updated error');
 *
 * // Statistics tracking even with errors
 * const stats = formatter.getStats(); // { callCount: 2, lastMessage: logMessage }
 * ```
 */
export class AgMockFormatterTestThrow {
  /**
   * Static marker property to identify mock constructors.
   * Used by type guards and automatic instantiation logic.
   */
  static readonly __isMockConstructor = true as const;

  /**
   * Statistics tracking properties
   */
  private callCount = 0;
  private lastMessage: AgLogMessage | null = null;

  /**
   * Private field for error message storage
   */
  private _errorMessage: string;

  /**
   * Constructor accepting an optional error message
   *
   * @param errorMessage - Error message to throw on execution (default: empty string)
   */
  constructor(errorMessage = '') {
    this._errorMessage = errorMessage;
  }

  /**
   * Getter for error message property
   *
   * @returns Current error message
   */
  get errorMessage(): string {
    return this._errorMessage;
  }

  /**
   * Setter for error message property
   *
   * @param message - New error message to set
   */
  set errorMessage(message: string) {
    this._errorMessage = message;
  }

  /**
   * Execute method that throws configured error and tracks statistics.
   *
   * フォーマッタの呼び出し回数のカウント：
   * - callCountを1増加
   *
   * 最終メッセージの取得処理：
   * - lastMessageを現在のメッセージで更新
   *
   * エラー投げ処理：
   * - 設定されたエラーメッセージでErrorを投げる
   *
   * @param msg - Log message to process (recorded before throwing)
   * @throws Error with configured error message
   */
  public readonly execute: AgFormatFunction = (msg: AgLogMessage): AgFormattedLogMessage => {
    // フォーマッタの呼び出し回数のカウント
    this.callCount++;

    // 最終メッセージの取得処理
    this.lastMessage = msg;

    // エラー投げ処理
    throw new Error(this._errorMessage);
  };

  /**
   * Get current statistics including call count and last message.
   *
   * 呼び出し回数などのstatsをテスト用に変数へ引き渡す処理：
   * - callCount: フォーマッタの呼び出し回数
   * - lastMessage: 最後に処理されたメッセージ
   *
   * @returns Statistics object with callCount and lastMessage
   */
  getStats(): { callCount: number; lastMessage: AgLogMessage | null } {
    return {
      callCount: this.callCount,
      lastMessage: this.lastMessage,
    };
  }

  /**
   * Reset all statistics to initial state.
   *
   * 統計情報をクリア：
   * - callCountを0にリセット
   * - lastMessageをnullにリセット
   */
  reset(): void {
    this.callCount = 0;
    this.lastMessage = null;
  }
}
