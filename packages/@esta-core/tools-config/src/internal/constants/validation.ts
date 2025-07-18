// src/internal/constants/validation.ts
// @(#) : 検証関連の内部定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { ValidOption } from '@/internal/types/validation';

/**
 * サポートされるインストーラータイプ
 */
export const SUPPORTED_INSTALLER_TYPES: string[] = [
  'eget',
] as const;

/**
 * eget用オプションのショートフォーム → ロングフォーム変換テーブル
 */
export const VALID_EGET_OPTIONS: ValidOption[] = [
  { short: '/a', long: '/asset:', requireValue: true },
  { short: '/q', long: '/quiet', requireValue: false },
] as const;

/**
 * 検証エラーメッセージ
 * 種別・インストーラー別に整理されたエラーメッセージ定数
 */
export const VALIDATION_ERROR_MESSAGES = {
  // === Configuration File Errors ===
  CONFIG_FILE_LOAD_FAILED: 'Configuration file could not be loaded',
  CONFIG_FILE_NOT_FOUND: 'Configuration file not found',
  CONFIG_VALIDATION_FAILED: 'Configuration validation failed',

  // === Directory Validation Errors ===
  DEFAULT_INSTALL_DIR_INVALID_PATH:
    'defaultInstallDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
  DEFAULT_INSTALL_DIR_REQUIRED: 'defaultInstallDir is required',
  DEFAULT_TEMP_DIR_INVALID_PATH:
    'defaultTempDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
  DEFAULT_TEMP_DIR_REQUIRED: 'defaultTempDir is required',
  DIRECTORIES_MUST_BE_DIFFERENT: 'defaultInstallDir and defaultTempDir must be different directories',

  // === Field Requirement Errors ===
  ID_REQUIRED: 'ID field is required',
  INSTALLER_REQUIRED: 'Installer field is required',
  REPOSITORY_REQUIRED: 'Repository field is required',
  TOOLS_REQUIRED: 'tools is required',

  // === Format Validation Errors ===
  INVALID_INSTALLER: 'Invalid installer type',
  INVALID_OPTIONS: 'Invalid options',
  INVALID_PATH_FORMAT: 'Invalid path format',
  INVALID_REPOSITORY_FORMAT: 'Repository must be in "owner/repo" format',
  INVALID_VERSION_FORMAT: 'Version must be "latest", "v##.##.##", or "##.##.##" format',
  PATH_MUST_BE_ABSOLUTE_OR_RELATIVE: 'Path must be absolute or relative',

  // === Options Validation Errors ===
  DUPLICATED_OPTIONS: 'duplicated options',
  OPTION_HAS_NO_VALUE: 'option has no value',
  OPTION_HAS_UNEXPECTED_VALUE: 'option has unexpected value',

  // === Installer-Specific Errors: eget ===
  EGET_INSTALLER_REQUIRED: 'Installer must be "eget"',
  INVALID_EGET_TOOL_ENTRY_FORMAT: 'Invalid eget tool entry format',

  // === Installer-Specific Errors: General ===
  UNSUPPORTED_INSTALLER: 'Unsupported installer type',
} as const;
