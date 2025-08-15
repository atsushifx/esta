// src/plugins/formatter/AgMockFormatter.ts
// @(#) : AgMockFormatter - Mock formatter class implementing AgMockConstructor interface
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgFormattedLogMessage, AgLogMessage } from '../../../shared/types';
import type { AgFormatRoutine } from '../../internal/types/AgMockConstructor.interface';

/**
 * AgMockFormatter - Base class implementing AgMockConstructor interface
 *
 * Provides mock formatter functionality with statistics tracking:
 * - フォーマッタの呼び出し回数のカウント
 * - 最終メッセージの取得処理
 * - 設定されたフォーマットルーチンの呼び出し
 * - 呼び出し回数などのstatsをテスト用に変数へ引き渡す処理
 *
 * @example
 * ```typescript
 * // Basic usage with message-only routine
 * const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
 * const formatter = new AgMockFormatter(messageOnlyRoutine);
 *
 * // Format messages and track statistics
 * const result = formatter.execute(logMessage);
 * const stats = formatter.getStats(); // { callCount: 1, lastMessage: logMessage }
 *
 * // Reset statistics
 * formatter.reset();
 * ```
 */
export class AgMockFormatter {
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
   * Constructor accepting a format routine function
   *
   * @param formatRoutine - Format routine function that processes AgLogMessage
   */
  constructor(private formatRoutine: AgFormatRoutine) {}

  /**
   * Execute method that formats messages and tracks statistics.
   *
   * フォーマッタの呼び出し回数のカウント：
   * - callCountを1増加
   *
   * 最終メッセージの取得処理：
   * - lastMessageを現在のメッセージで更新
   *
   * 設定されたフォーマットルーチンの呼び出し：
   * - コンストラクタで設定されたformatRoutineを呼び出し
   * - formatRoutineの結果を返す
   *
   * @param msg - Log message to format
   * @returns Formatted log message from the routine
   */
  public readonly execute: AgFormatFunction = (msg: AgLogMessage): AgFormattedLogMessage => {
    // フォーマッタの呼び出し回数のカウント
    this.callCount++;

    // 最終メッセージの取得処理
    this.lastMessage = msg;

    // 設定されたフォーマットルーチンの呼び出し
    return this.formatRoutine(msg);
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

export default AgMockFormatter;
