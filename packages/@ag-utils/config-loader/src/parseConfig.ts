// src: ./parseConfig.ts
// 設定データ解析ルーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import {
  EstaExtensionToFileTypeMap,
  TEstaConfigFileType,
  type TEstaSupportedExtension,
} from '@shared/types/configFile.types';

// parser
import { parseJsonc } from './parser/parseJsonc';
import { parseScript } from './parser/parseScript';
import { parseYaml } from './parser/parseYaml';

/**
 * ファイル拡張子に基づいて設定データを適切なパーサーで解析します
 *
 * @template T 解析結果の型
 * @param extension ファイル拡張子（.json, .yaml, .ts など）
 * @param raw 解析対象の文字列データ
 * @returns 解析された設定オブジェクト
 *
 * @example
 * ```typescript
 * // JSON形式の解析
 * const jsonConfig = await parseConfig('.json', '{"name": "test"}');
 *
 * // YAML形式の解析
 * const yamlConfig = await parseConfig('.yaml', 'name: test');
 *
 * // TypeScript形式の解析
 * const tsConfig = await parseConfig('.ts', 'export default { name: "test" }');
 * ```
 */
export const parseConfig = async <T = object>(extension: string, raw: string | undefined): Promise<T> => {
  const normalizedExt = extension.replace(/^\./, '').toLowerCase() as TEstaSupportedExtension;
  const fileType = EstaExtensionToFileTypeMap[normalizedExt];

  switch (fileType) {
    case TEstaConfigFileType.JSON:
      return parseJsonc<T>(raw);
    case TEstaConfigFileType.YAML:
      return parseYaml<T>(raw);
    case TEstaConfigFileType.SCRIPT:
      return await parseScript<T>(raw);
    default:
      return {} as T;
  }
};

export default parseConfig;
