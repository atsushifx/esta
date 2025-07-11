// src: /shared/types/configFile.types.ts
// 拡張子から設定ファイル種別へのマッピング
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * 設定ファイルの種別
 */
export enum TEstaConfigFileType {
  JSON = 'json',
  YAML = 'yaml',
  SCRIPT = 'script',
}

/**
 * 拡張子から設定ファイル種別へのマッピング
 */
export const EstaExtensionToFileTypeMap = {
  '': TEstaConfigFileType.JSON,
  'json': TEstaConfigFileType.JSON,
  'jsonc': TEstaConfigFileType.JSON,
  'yml': TEstaConfigFileType.YAML,
  'yaml': TEstaConfigFileType.YAML,
  'js': TEstaConfigFileType.SCRIPT,
  'ts': TEstaConfigFileType.SCRIPT,
} as const;

/**
 * サポートされる拡張子のリスト
 */
export const EstaSupportedExtensions = Object.keys(EstaExtensionToFileTypeMap) as readonly string[];

/**
 * サポートされる拡張子の型
 */
export type TEstaSupportedExtension = keyof typeof EstaExtensionToFileTypeMap;
