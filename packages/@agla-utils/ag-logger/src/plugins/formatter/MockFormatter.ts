//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatRoutine, AgMockConstructor } from '../../../shared/types/AgMockConstructor.class';

// plugins
import { AgMockFormatter } from './AgMockFormatter';
// utilities
import { AgToLabel } from '../../utils/AgLogHelpers';

/**
 * ErrorThrowFormatter - 実行時にエラーメッセージを変更可能なフォーマッタ
 * AgMockFormatterを拡張し、setErrorMessageによる動的エラーメッセージ変更をサポート
 */
class ErrorThrowFormatter extends AgMockFormatter {
  static readonly __isMockConstructor = true as const;
  private currentErrorMessage: string;

  constructor(routine?: AgFormatRoutine, defaultErrorMessage = 'Default mock error') {
    // AgLoggerConfigからの呼び出しに対応
    // routineが渡されても無視し、エラールーチンを使用

    // エラーメッセージをクロージャで保持するため、先に変数に保存
    let errorMessage = defaultErrorMessage;

    // エラールーチン：保存したエラーメッセージでErrorを投げる
    const errorRoutine: AgFormatRoutine = (_msg) => {
      throw new Error(errorMessage);
    };

    super(errorRoutine);

    // super()後にthisにアクセス可能
    this.currentErrorMessage = defaultErrorMessage;

    // setErrorMessageでクロージャの変数も更新するため、メソッドをオーバーライド
    this.setErrorMessage = (newErrorMessage: string) => {
      this.currentErrorMessage = newErrorMessage;
      errorMessage = newErrorMessage;
    };
  }

  /**
   * 実行時にエラーメッセージを動的に変更
   * @param errorMessage - 新しいエラーメッセージ
   */
  setErrorMessage(errorMessage: string): void {
    this.currentErrorMessage = errorMessage;
  }

  /**
   * 現在のエラーメッセージを取得
   * @returns 現在設定されているエラーメッセージ
   */
  getErrorMessage(): string {
    return this.currentErrorMessage;
  }
}

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

  /**
   * 固定値を返すフォーマッタファクトリ関数
   * 指定した値を常に返すMockFormatterを作成
   *
   * @param value - 常に返す固定値
   * @returns 固定値を返すMockFormatterクラス
   */
  returnValue: (value: string) => createMockFormatter(() => value),

  /**
   * 動的エラーメッセージ対応フォーマッタ
   * 実行時にsetErrorMessageでエラーメッセージを変更可能
   *
   * @param defaultErrorMessage - デフォルトのエラーメッセージ（省略可能）
   * @returns 動的エラーメッセージ変更可能なErrorThrowFormatterクラス
   */
  errorThrow: ErrorThrowFormatter,
} as const;

export default MockFormatter;
