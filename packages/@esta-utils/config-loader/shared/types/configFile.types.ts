// src: /shared/types/configFile.types.ts
// 拡張子から設定ファイル種別へのマッピング
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * 設定ファイルの種別を定義します
 *
 * @description
 * 設定ファイルの形式を種類別に分類し、適切なパーサーを選択するために使用します。
 */
export enum TEstaConfigFileType {
  JSON = 'json',
  YAML = 'yaml',
  SCRIPT = 'script',
}

/**
 * ファイル拡張子から設定ファイル種別へのマッピングテーブル
 *
 * @description
 * ファイル拡張子を基に適切なパーサーを決定するためのマッピングテーブルです。
 * - JSON/JSONC: JSONパーサーを使用
 * - YML/YAML: YAMLパーサーを使用
 * - JS/TS: JavaScript/TypeScriptスクリプトパーサーを使用
 * - 空文字列: 拡張子なしのファイルはJSONとして処理
 *
 * @example
 * ```typescript
 * const fileType = EstaExtensionToFileTypeMap['json']; // TEstaConfigFileType.JSON
 * const yamlType = EstaExtensionToFileTypeMap['yaml']; // TEstaConfigFileType.YAML
 * ```
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
 * サポートされるファイル拡張子の一覧
 *
 * @description
 * 設定ファイルとして読み込み可能なすべてのファイル拡張子のリストです。
 * ファイル検索時にこのリストを使用して候補ファイルを生成します。
 *
 * @readonly
 */
export const EstaSupportedExtensions = Object.keys(EstaExtensionToFileTypeMap) as readonly string[];

/**
 * サポートされるファイル拡張子の型定義
 *
 * @description
 * EstaExtensionToFileTypeMapのキーを基にしたユニオン型で、
 * 有効なファイル拡張子のみを受け入れます。
 *
 * @example
 * ```typescript
 * const validExt: TEstaSupportedExtension = 'json'; // OK
 * const invalidExt: TEstaSupportedExtension = 'txt'; // Type Error
 * ```
 */
export type TEstaSupportedExtension = keyof typeof EstaExtensionToFileTypeMap;
