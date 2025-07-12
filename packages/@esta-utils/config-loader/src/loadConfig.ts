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

/**
 * loadConfig関数のオプション設定
 */
export type LoadConfigOptions = {
  /** 設定ファイルのベース名（拡張子なし）または複数のベース名の配列 */
  baseNames: string | readonly string[];
  /** アプリケーション名（検索ディレクトリの構築に使用、デフォルト: process.cwd()） */
  appName?: string;
  /** 検索タイプ（PROJECT、USER、または SYSTEM、デフォルト: USER） */
  searchType?: TSearchConfigFileType;
};

// modules
import { parseConfig } from './parseConfig';
import { findConfigFile } from './search/findConfigFile';

/**
 * 設定ファイルを読み込み、解析して設定オブジェクトを返します
 *
 * @template T 設定オブジェクトの型
 * @param options 設定オプション
 * @returns 解析された設定オブジェクト
 * @throws 設定ファイルが見つからない場合にエラーをスロー
 *
 * @example
 * ```typescript
 * // オブジェクト形式（推奨）
 * const config1 = await loadConfig({
 *   baseNames: 'myapp',
 *   appName: 'myapp',
 *   searchType: TSearchConfigFileType.USER
 * });
 *
 * // 複数の設定ファイルから検索（優先順位順）
 * const config2 = await loadConfig({
 *   baseNames: ['estarc', 'esta.config'],
 *   appName: 'myapp'
 * });
 *
 * // 型安全な設定読み込み
 * interface AppConfig {
 *   name: string;
 *   version: string;
 * }
 * const typedConfig = await loadConfig<AppConfig>({
 *   baseNames: 'myapp',
 *   appName: 'myapp'
 * });
 *
 * ```
 */
export const loadConfig = async <T = object>(options: LoadConfigOptions): Promise<T> => {
  const actualOptions: Required<LoadConfigOptions> = {
    baseNames: options.baseNames,
    appName: options.appName ?? process.cwd(),
    searchType: options.searchType ?? TSearchConfigFileType.USER,
  };

  const baseNameArray = Array.isArray(actualOptions.baseNames) ? actualOptions.baseNames : [actualOptions.baseNames];
  const configFilePath = findConfigFile(baseNameArray, actualOptions.appName, actualOptions.searchType);
  const rawContent = fs.readFileSync(configFilePath, 'utf-8');
  const extension = extname(configFilePath);

  return await parseConfig<T>(extension, rawContent);
};

export default loadConfig;
