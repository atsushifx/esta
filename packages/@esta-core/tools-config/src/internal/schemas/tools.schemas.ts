// src/internal/schemas/tools.schemas.ts
// @(#) : ツール関連スキーマ定義（正規化機能付き）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { array, check, object, optional, pipe, record, string, transform } from 'valibot';
import { normalizePathForSchema, validateAndNormalizePath } from '../../utils';
// validation error messages
import { VALIDATION_ERROR_MESSAGES } from '../constants/validation';

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
      VALIDATION_ERROR_MESSAGES.DEFAULT_INSTALL_DIR_INVALID_PATH,
    ),
    transform(normalizePathForSchema),
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
      VALIDATION_ERROR_MESSAGES.DEFAULT_TEMP_DIR_INVALID_PATH,
    ),
    transform(normalizePathForSchema),
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
    VALIDATION_ERROR_MESSAGES.DEFAULT_INSTALL_DIR_REQUIRED,
  ),
  check(
    (config) => config.defaultTempDir !== undefined,
    VALIDATION_ERROR_MESSAGES.DEFAULT_TEMP_DIR_REQUIRED,
  ),
  check(
    (config) => config.tools !== undefined,
    VALIDATION_ERROR_MESSAGES.TOOLS_REQUIRED,
  ),
  check(
    (config) => config.defaultInstallDir !== config.defaultTempDir,
    VALIDATION_ERROR_MESSAGES.DIRECTORIES_MUST_BE_DIFFERENT,
  ),
);
