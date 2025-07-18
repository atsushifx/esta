// src/internal/types/config.ts
// @(#) : 設定関連の内部型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * 設定読み込み結果
 */
export type LoadConfigResult<T = unknown> = {
  /** 読み込み成功フラグ */
  success: boolean;
  /** 設定データ */
  config?: T;
  /** エラーメッセージ */
  error?: string;
};
