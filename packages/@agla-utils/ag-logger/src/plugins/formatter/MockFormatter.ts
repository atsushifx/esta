//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatRoutine, AgMockConstructor } from '../../internal/types/AgMockConstructor.class';

// plugins
import { AgMockFormatter } from './AgMockFormatter';
// utilities
import { AgToLabel } from '../../utils/AgLogHelpers';

/**
 * MockFormatter.ts
 *
 * カリー化されたファクトリ関数を提供し、カスタムルーチンをbindした
 * MockFormatterクラスを生成する機能を実装
 */

/**
 * カリー化されたファクトリ関数
 * カスタムルーチンを受け取り、そのルーチンをbindしたMockFormatterクラスを返す
 *
 * @param formatRoutine - カスタムフォーマットルーチン
 * @returns カスタムルーチンをbindしたMockFormatterクラス
 */
export const createMockFormatter = (formatRoutine: AgFormatRoutine): AgMockConstructor => {
  return class extends AgMockFormatter {
    static readonly __isMockConstructor = true as const;

    constructor() {
      super(formatRoutine);
    }
  };
};

/**
 * MockFormatter - 使いやすいプリセット付きのファクトリオブジェクト
 * 直感的なAPIを提供し、よく使われるフォーマットパターンをプリセットとして用意
 */
export const MockFormatter = {
  /**
   * カスタムルーチン用ファクトリ
   * ユーザー定義のフォーマットルーチンでMockFormatterを作成
   */
  withRoutine: createMockFormatter,

  /**
   * JSON形式でログメッセージをフォーマット
   */
  json: createMockFormatter((msg) => {
    const levelLabel = AgToLabel(msg.logLevel);
    const logEntry = {
      timestamp: msg.timestamp.toISOString(),
      logLevel: msg.logLevel,
      ...(levelLabel && { level: levelLabel }),
      message: msg.message,
      ...(msg.args.length > 0 && { args: msg.args }),
    };
    return JSON.stringify(logEntry);
  }),

  /**
   * メッセージ部分のみを抽出
   */
  messageOnly: createMockFormatter((msg) => msg.message),

  /**
   * パススルーフォーマット（ログメッセージをそのまま返す）
   */
  passthrough: createMockFormatter((msg) => msg),

  /**
   * タイムスタンプ付きでメッセージをフォーマット
   */
  timestamped: createMockFormatter((msg) => `[${new Date().toISOString()}] ${msg.message}`),

  /**
   * プレフィックス付きファクトリ関数
   * 指定したプレフィックスでメッセージをフォーマット
   *
   * @param prefix - メッセージの前に付けるプレフィックス
   * @returns プレフィックス付きフォーマットのMockFormatterクラス
   */
  prefixed: (prefix: string) => createMockFormatter((msg) => `${prefix}: ${msg.message}`),
} as const;
