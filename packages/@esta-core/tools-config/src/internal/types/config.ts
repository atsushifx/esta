// src/internal/types/config.ts
// @(#) : 設定関連の内部型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * 設定ファイル情報
 */
export type ConfigFileInfo = {
  /** ファイルパス */
  path: string;
  /** ファイル形式 */
  format: SupportedConfigFileFormat;
  /** ファイルの存在確認済みかどうか */
  exists: boolean;
};

/**
 * 設定検索オプション
 */
export type ConfigSearchOptions = {
  /** 検索を開始するディレクトリ */
  startDir?: string;
  /** 検索するファイル名（拡張子なし） */
  configName?: string;
  /** 検索を停止するディレクトリ */
  stopDir?: string;
};

/**
 * 設定読み込み結果
 */
export type LoadConfigResult<T = unknown> = {
  /** 読み込み成功フラグ */
  success: boolean;
  /** 設定データ */
  config?: T;
  /** 設定ファイル情報 */
  fileInfo?: ConfigFileInfo;
  /** エラーメッセージ */
  error?: string;
};

/**
 * サポートされる設定ファイル形式
 */
export type SupportedConfigFileFormat =
  | 'json' // 標準JSON形式
  | 'jsonc' // コメント付きJSON形式
  | 'yaml' // YAML形式
  | 'yml' // YAML形式（短縮版）
  | 'js' // JavaScript設定ファイル
  | 'ts' // TypeScript設定ファイル
  | ''; // 拡張子なし（JSONとして処理）
