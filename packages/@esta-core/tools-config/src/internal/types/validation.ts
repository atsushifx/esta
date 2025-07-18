// src/internal/types/validation.ts
// @(#) : 検証関連の内部型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * オプション定義の型。
 * コマンドライン引数におけるショート・ロングオプション、および値の有無を記述します。
 *
 * @property short - ショートオプション（例: "-h"）。存在しない場合は空文字列 `""`。
 * @property long - ロングオプション（例: "--help"）。必須。
 * @property requireValue - このオプションが値を必要とするかどうか（例: "--output <file>" → true）
 */
export type ValidOption = {
  short: string;
  long: string;
  requireValue: boolean;
};

/**
 * バリデーション結果の型定義
 */
export type ValidateToolsResult = {
  success: boolean;
  error?: string;
};
