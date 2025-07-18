// src/internal/constants/validation.ts
// @(#) : 検証関連の内部定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * サポートされるインストーラータイプ
 */
export const SUPPORTED_INSTALLER_TYPES = ['eget'] as const;

/**
 * eget用オプションのショートフォーム → ロングフォーム変換テーブル
 */
export const EGET_SHORT_TO_LONG_FORM = {
  '/a': '/asset:',
  '/q': '/quiet',
} as const;

/**
 * eget用の有効なオプション一覧
 */
export const VALID_EGET_OPTIONS = [
  ...Object.keys(EGET_SHORT_TO_LONG_FORM), // ショートフォーム (/a, /q)
  ...Object.values(EGET_SHORT_TO_LONG_FORM), // ロングフォーム (/asset:, /quiet)
] as const;

/**
 * 検証エラーメッセージ
 */
export const VALIDATION_ERROR_MESSAGES = {
  INSTALLER_REQUIRED: 'Installer field is required',
  INVALID_INSTALLER: 'Invalid installer type',
  ID_REQUIRED: 'ID field is required',
  REPOSITORY_REQUIRED: 'Repository field is required',
  INVALID_REPOSITORY_FORMAT: 'Repository must be in "owner/repo" format',
  INVALID_VERSION_FORMAT: 'Version must be "latest", "v##.##.##", or "##.##.##" format',
  INVALID_EGET_OPTIONS: 'Invalid eget options',
  EGET_INSTALLER_REQUIRED: 'Installer must be "eget"',
  INVALID_PATH_FORMAT: 'Invalid path format',
  UNSUPPORTED_INSTALLER: 'Unsupported installer type',
  CONFIG_FILE_NOT_FOUND: 'Configuration file not found',
  CONFIG_FILE_LOAD_FAILED: 'Configuration file could not be loaded',
  CONFIG_VALIDATION_FAILED: 'Configuration validation failed',
} as const;
