// src/internal/constants/config.ts
// @(#) : 設定関連の内部定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * デフォルト設定ファイル名
 */
export const DEFAULT_CONFIG_FILENAME = 'tools';

/**
 * サポートされるファイル拡張子
 */
export const SUPPORTED_CONFIG_EXTENSIONS = [
  '',
  'json',
  'jsonc',
  'yaml',
  'yml',
  'js',
  'ts',
] as const;

/**
 * デフォルト設定検索停止ディレクトリ
 */
export const DEFAULT_STOP_DIR = '/';

/**
 * デフォルトインストールディレクトリ
 */
export const DEFAULT_INSTALL_DIR = './.tools/bin';

/**
 * デフォルト一時ディレクトリ
 */
export const DEFAULT_TEMP_DIR = './.tools/tmp';
