// src/internal/types/tools.ts
// @(#) : ツール関連の内部型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * ツールエントリー
 */
export type ToolEntry = {
  /** インストーラータイプ */
  installer: string;
  /** ツールID */
  id: string;
  /** リポジトリ */
  repository: string;
  /** バージョン（任意） */
  version?: string;
  /** オプション（任意） */
  options?: Record<string, string>;
};

/**
 * ツール設定（完全版）
 */
export type ToolsConfig = {
  /** デフォルトインストールディレクトリ */
  defaultInstallDir: string;
  /** デフォルト一時ディレクトリ */
  defaultTempDir: string;
  /** ツールエントリーの配列 */
  tools: ToolEntry[];
};

/**
 * ツール設定（部分版）
 */
export type PartialToolsConfig = {
  /** デフォルトインストールディレクトリ（任意） */
  defaultInstallDir?: string;
  /** デフォルト一時ディレクトリ（任意） */
  defaultTempDir?: string;
  /** ツールエントリーの配列（任意） */
  tools?: ToolEntry[];
};
