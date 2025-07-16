// src/schemas/tools.ts
// @(#) : ツール関連スキーマ定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { any, object, optional, record, string } from 'valibot';

/**
 * ツールエントリーのスキーマ
 * 基本的なToolEntry構造を検証
 */
export const ToolEntrySchema = object({
  /** インストーラータイプ */
  installer: string(),
  /** ツールID */
  id: string(),
  /** GitHubリポジトリ */
  repository: string(),
  /** オプション（任意） */
  options: optional(record(string(), any())),
});
