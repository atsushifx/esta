// src: /shared/types/common.types.ts :
// @(#) : common types definition
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Search Config File Type
export enum SearchConfigFileType {
  USER = 'user',
  SYSTEM = 'system',
}

/**
 * サポートされる設定ファイルの拡張子
 */
export const CONFIG_FILE_EXTENSIONS = {
  JSON: 'json',
  JSONC: 'jsonc',
  YML: 'yml',
  YAML: 'yaml',
  JS: 'js',
  TS: 'ts',
  MD: 'md',
  ERROR: 'error',
} as const;

export type ConfigFileExtension = typeof CONFIG_FILE_EXTENSIONS[keyof typeof CONFIG_FILE_EXTENSIONS];

/**
 * パーサーオプション
 */
export type ParseConfigOptions = {
  parseAs?: 'md' | 'plaintext';
};

// --  type / interface definition
