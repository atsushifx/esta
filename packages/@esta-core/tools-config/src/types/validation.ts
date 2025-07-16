// src/types/validation.ts
// @(#) : 検証関連型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { ToolEntry, ToolsConfig } from './tools';

/**
 * バリデーション結果の基本型
 */
export type ValidationResult<T> = {
  /** 検証成功フラグ */
  success: boolean;
  /** 検証済みデータ（成功時） */
  data?: T;
  /** エラーメッセージ（失敗時） */
  error?: string;
};

/**
 * ツール設定の検証結果
 */
export type ValidateResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** 検証済みデータ（成功時） */
  data?: ToolsConfig;
  /** エラーメッセージ（失敗時） */
  error?: string;
};

/**
 * ツールエントリーリストの検証結果
 */
export type ValidateToolsResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** 有効なエントリーリスト */
  validEntries: ToolEntry[];
  /** エラー情報の配列 */
  errors: Array<{
    /** エントリーのインデックス */
    index: number;
    /** 元のエントリーデータ */
    entry: unknown;
    /** エラーメッセージ */
    error: string;
  }>;
};

/**
 * 設定検証エラーの詳細情報
 */
export type ConfigValidationError = {
  /** エラーが発生したフィールド */
  field: string;
  /** エラーメッセージ */
  message: string;
  /** エラーが発生した値 */
  value?: unknown;
};

/**
 * 詳細な設定検証結果
 */
export type DetailedValidateConfigResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** 検証済み設定（成功時） */
  config?: ToolsConfig;
  /** エラー情報の配列 */
  errors: ConfigValidationError[];
  /** 正規化済み設定 */
  normalizedConfig?: ToolsConfig;
};
