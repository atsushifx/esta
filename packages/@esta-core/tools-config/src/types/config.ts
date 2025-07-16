// src/types/config.ts
// @(#) : 設定関連型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { TSearchConfigFileType } from '@esta-utils/config-loader';
import type { PartialToolsConfig } from './tools';

/**
 * 設定読み込み結果
 */
export type LoadConfigResult = {
  /** 読み込み成功フラグ */
  success: boolean;
  /** 読み込まれた設定（部分的） */
  config?: PartialToolsConfig;
  /** エラーメッセージ */
  error?: string;
};

/**
 * @esta-utils/config-loaderがサポートするファイル形式
 * - JSON: .json, .jsonc, 拡張子なし
 * - YAML: .yaml, .yml
 * - Script: .js, .ts
 */
export type SupportedConfigFileFormat =
  | 'json' // 標準JSON形式
  | 'jsonc' // コメント付きJSON形式
  | 'yaml' // YAML形式
  | 'yml' // YAML形式（短縮版）
  | 'js' // JavaScript設定ファイル
  | 'ts' // TypeScript設定ファイル
  | ''; // 拡張子なし（JSONとして処理）

/**
 * 設定ファイル検索オプション
 */
export type ConfigSearchOptions = {
  /** ベース名（拡張子なし） */
  baseNames: string | string[];
  /** アプリケーション名 */
  appName: string;
  /** 検索タイプ */
  searchType: TSearchConfigFileType;
  /** ベースディレクトリ（PROJECT検索時に使用） */
  baseDirectory?: string;
};

/**
 * 設定ファイルの情報
 */
export type ConfigFileInfo = {
  /** ファイルパス */
  path: string;
  /** ファイル形式 */
  format: SupportedConfigFileFormat;
  /** 存在するかどうか */
  exists: boolean;
};
