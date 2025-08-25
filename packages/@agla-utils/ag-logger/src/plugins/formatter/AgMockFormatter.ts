// src/plugins/formatter/AgMockFormatter.ts
// @(#) : AgMockFormatter - Mock formatter class implementing AgMockConstructor interface
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgFormattedLogMessage, AgLogMessage } from '../../../shared/types';
import type { AgFormatRoutine } from '../../../shared/types/AgMockConstructor.class';

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
   * Default passthrough routine that returns the message as-is.
   * Used when no routine is provided to the constructor.
   */
  private static readonly DEFAULT_PASSTHROUGH_ROUTINE: AgFormatRoutine = (msg) => msg;

  /**
   * Statistics tracking properties
   */
  private callCount = 0;
  private lastMessage: AgLogMessage | null = null;

  /**
   * The format routine function used for message formatting
   */
  private formatRoutine: AgFormatRoutine;

  /**
   * Constructor accepting an optional format routine function.
   * If no routine is provided, uses a default passthrough routine.
   *
   * @param formatRoutine - Optional format routine function that processes AgLogMessage
   */
  constructor(formatRoutine?: AgFormatRoutine) {
    this.formatRoutine = formatRoutine ?? AgMockFormatter.DEFAULT_PASSTHROUGH_ROUTINE;
  }

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
  execute: AgFormatFunction = (msg: AgLogMessage): AgFormattedLogMessage => {
    this.callCount++;
    this.lastMessage = msg;
    return this.formatRoutine(msg);
  };

  /**
   * Gets statistics about formatter usage.
   *
   * @returns Statistics object containing call count and last message
   */
  getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
    callCount: this.callCount,
    lastMessage: this.lastMessage,
  });

  /**
   * Resets formatter statistics to initial state.
   */
  reset = (): void => {
    this.callCount = 0;
    this.lastMessage = null;
  };
}

export default AgMockFormatter;
