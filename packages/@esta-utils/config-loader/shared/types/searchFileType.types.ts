// src: /shared/types/searchFileType.types.ts
// 設定ファイル検索タイプの定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * 設定ファイル検索タイプを定義します
 *
 * @description
 * 設定ファイルの検索範囲を指定するためのenumです。
 * 各タイプに応じて適切な検索ディレクトリが決定されます。
 *
 * @example
 * ```typescript
 * // プロジェクト内のみで検索
 * loadConfig('myapp', '.', TSearchConfigFileType.PROJECT);
 *
 * // ユーザーディレクトリで検索（デフォルト）
 * loadConfig('myapp', '.', TSearchConfigFileType.USER);
 *
 * // システム全体で検索
 * loadConfig('myapp', '.', TSearchConfigFileType.SYSTEM);
 * ```
 */
export enum TSearchConfigFileType {
  /** プロジェクトローカルな設定ファイルを検索 */
  PROJECT = 'project',
  /** ユーザー固有の設定ファイルを検索（デフォルト） */
  USER = 'user',
  /** システム全体の設定ファイルを検索 */
  SYSTEM = 'system',
}

// --  type / interface definition
