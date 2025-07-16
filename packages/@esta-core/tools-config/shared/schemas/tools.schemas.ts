// shared/schemas/tools.schemas.ts
// @(#) : ツール関連スキーマ定義（正規化機能付き）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { array, check, object, optional, pipe, record, string, transform } from 'valibot';
import { validateAndNormalizePath } from '../../src/validator/utils';

/**
 * ツールエントリーのスキーマ
 * 基本的なToolEntry構造を検証し、文字列を英小文字に正規化
 */
export const ToolEntrySchema = object({
  /** インストーラータイプ（正規化: 英小文字） */
  installer: pipe(string(), transform((installer) => installer.toLowerCase())),
  /** ツールID（正規化: 英小文字） */
  id: pipe(string(), transform((id) => id.toLowerCase())),
  /** GitHubリポジトリ（正規化: 英小文字） */
  repository: pipe(string(), transform((repo) => repo.toLowerCase())),
  /** バージョン指定（セマンティックバージョンまたは"latest"、任意） */
  version: optional(string()),
  /** オプション（任意、文字列値は正規化: 英小文字） */
  options: optional(
    pipe(
      record(string(), string()),
      transform((options) => {
        const normalized: Record<string, string> = {};
        for (const [key, value] of Object.entries(options)) {
          // optionsは全てstring想定
          normalized[key] = value.toLowerCase();
        }
        return normalized;
      }),
    ),
  ),
});

/**
 * パス正規化関数
 * パスの形式を統一（区切り文字を統一し、小文字に正規化）
 */
const normalizePath = (path: string): string => {
  const normalized = validateAndNormalizePath(path);
  // Windows形式のパスを Unix形式に変換し、小文字に正規化
  return normalized.replace(/\\/g, '/').toLowerCase();
};

/**
 * ツール設定全体のスキーマ（部分設定対応）
 * パス検証と正規化を含む。必須フィールドのチェックは別途実施
 */
export const ToolsConfigSchema = object({
  defaultInstallDir: optional(pipe(
    string(),
    check(
      (path) => {
        try {
          validateAndNormalizePath(path);
          return true;
        } catch {
          return false;
        }
      },
      'defaultInstallDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
    ),
    transform(normalizePath),
  )),
  defaultTempDir: optional(pipe(
    string(),
    check(
      (path) => {
        try {
          validateAndNormalizePath(path);
          return true;
        } catch {
          return false;
        }
      },
      'defaultTempDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
    ),
    transform(normalizePath),
  )),
  tools: optional(array(ToolEntrySchema)),
});

/**
 * 完全なツール設定のスキーマ
 * 必須フィールドの存在とディレクトリ重複をチェック
 */
export const CompleteToolsConfigSchema = pipe(
  ToolsConfigSchema,
  check(
    (config) => config.defaultInstallDir !== undefined,
    'defaultInstallDir is required',
  ),
  check(
    (config) => config.defaultTempDir !== undefined,
    'defaultTempDir is required',
  ),
  check(
    (config) => config.tools !== undefined,
    'tools is required',
  ),
  check(
    (config) => config.defaultInstallDir !== config.defaultTempDir,
    'defaultInstallDir and defaultTempDir must be different directories',
  ),
);

// 下位互換性のためのエイリアス
export { ToolEntrySchema as ToolsEntrySchema };
export { ToolsConfigSchema as ConfigSchema };
