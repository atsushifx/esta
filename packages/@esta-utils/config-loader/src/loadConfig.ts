// src: ./loadConfig.ts
// @(#): 設定ファイル読み込みユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as fs from 'fs';
import { extname } from 'path';

// types
import { TSearchConfigFileType } from '../shared/types/searchFileType.types';

// modules
import { parseConfig } from './parseConfig';
import { findConfigFile } from './search/findConfigFile';

/**
 * 設定ファイルを読み込み、解析して設定オブジェクトを返します
 *
 * @template T 設定オブジェクトの型
 * @param baseNames 設定ファイルのベース名（拡張子なし）または複数のベース名の配列
 * @param dirName 検索開始ディレクトリ（デフォルト: process.cwd()）
 * @param searchType 検索タイプ（PROJECT、USER、または SYSTEM、デフォルト: USER）
 * @returns 解析された設定オブジェクト
 * @throws 設定ファイルが見つからない場合にエラーをスロー
 *
 * @example
 * ```typescript
 * // 単一の設定ファイルを読み込み
 * const config = await loadConfig('myapp'); // myapp.json を検索
 *
 * // 複数の設定ファイルから検索（優先順位順）
 * const config = await loadConfig(['estarc', 'esta.config']); // estarc.json → esta.config.json の順で検索
 *
 * // 型安全な設定読み込み
 * interface AppConfig {
 *   name: string;
 *   version: string;
 * }
 * const typedConfig = await loadConfig<AppConfig>('myapp');
 *
 * // TypeScript設定ファイルを読み込み
 * const tsConfig = await loadConfig('vite'); // vite.config.ts を検索
 * ```
 */
export const loadConfig = async <T = object>(
  baseNames: string | readonly string[],
  dirName: string = process.cwd(),
  searchType: TSearchConfigFileType = TSearchConfigFileType.USER,
): Promise<T> => {
  const baseNameArray = Array.isArray(baseNames) ? baseNames : [baseNames];
  const configFilePath = findConfigFile(baseNameArray, dirName, searchType);
  const rawContent = fs.readFileSync(configFilePath, 'utf-8');
  const extension = extname(configFilePath);

  return await parseConfig<T>(extension, rawContent);
};

export default loadConfig;
