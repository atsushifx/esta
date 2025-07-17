// src/internal/types/validation.ts
// @(#) : 検証関連の内部型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { ToolEntry } from './tools';

/**
 * 検証結果（汎用）
 */
export type ValidateResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** エラーメッセージ */
  error?: string;
};

/**
 * 設定検証エラー
 */
export type ConfigValidationError = {
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したパス */
  path?: string;
  /** エラーの詳細情報 */
  details?: string;
};

/**
 * 詳細な設定検証結果
 */
export type DetailedValidateConfigResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** 検証されたデータ */
  data?: unknown;
  /** エラーの配列 */
  errors?: ConfigValidationError[];
};

/**
 * ツール検証結果
 */
export type ValidateToolsResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** 有効なツールエントリー */
  validEntries: ToolEntry[];
  /** エラーの配列 */
  errors: Array<{
    /** エラーが発生したインデックス */
    index: number;
    /** エラーが発生したエントリー */
    entry: ToolEntry;
    /** エラーメッセージ */
    error: string;
  }>;
};

/**
 * 検証結果（汎用）
 */
export type ValidationResult<T = unknown> = {
  /** 検証成功フラグ */
  success: boolean;
  /** 検証されたデータ */
  data?: T;
  /** エラーメッセージ */
  error?: string;
};
