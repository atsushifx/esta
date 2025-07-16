// shared/types/tools.types.ts
// @(#) : ツール関連共有型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * ツール設定エントリー
 * 個別のツールのインストール設定を表す
 */
export type ToolEntry = {
  /** インストーラータイプ（'eget', 'script'等） */
  installer: string;
  /** ツールの一意識別子 */
  id: string;
  /** GitHubリポジトリ（'owner/repo'形式） */
  repository: string;
  /** バージョン指定（セマンティックバージョンまたは"latest"） */
  version?: string;
  /** インストーラー固有のオプション */
  options?: Record<string, string>;
};

/**
 * ツール設定全体
 * 複数のツールエントリーとデフォルト設定を含む
 */
export type ToolsConfig = {
  /** デフォルトインストールディレクトリ */
  defaultInstallDir: string;
  /** デフォルト一時ディレクトリ */
  defaultTempDir: string;
  /** ツールエントリーのリスト */
  tools: ToolEntry[];
};

/**
 * 部分的なツール設定
 * 設定ファイル読み込み時に使用
 */
export type PartialToolsConfig = Partial<ToolsConfig>;
