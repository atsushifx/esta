// src: ./findConfigFile.ts
// @(#) : 設定ファイル探索ユーティリティ（prefix/extension 固定版）
//
// Copyright (c) 2025 atsushifx
// MIT License
// https://opensource.org/licenses/MIT

// libs
import * as fs from 'fs';
import { resolve } from 'path';

// types
import type { TEstaSearchConfigFileType } from '../shared/types/common.types';
import { EstaSupportedExtensions } from '../shared/types/configFile.types';

// modules
import { configSearchDirs } from './configSearchDirs';

// --- types

// types

/**
 * 固定化するプレフィックス
 */
const PREFIXES = ['', '.'] as const;

/**
 * 指定されたベース名の設定ファイルを階層的に検索します
 *
 * @param baseNames 検索する設定ファイルのベース名配列
 * @param dirName 検索開始ディレクトリ
 * @param searchType 検索タイプ（USER または SYSTEM）
 * @returns 最初に見つかった設定ファイルの絶対パス
 * @throws 設定ファイルが見つからない場合にエラーをスロー
 *
 * @description
 * 以下の優先順位で検索を行います：
 * 1. プレフィックスなし（例: `myapp.json`）
 * 2. ドットプレフィックス（例: `.myapp.json`）
 *
 * 対応する拡張子: `.json`, `.jsonc`, `.yml`, `.yaml`, `.js`, `.ts`
 *
 * @example
 * ```typescript
 * // 設定ファイルを検索
 * const configPath = findConfigFile(['myapp'], './config', TEstaSearchConfigFileType.USER);
 * // -> ./config/myapp.json (存在する場合)
 *
 * // 複数のベース名で検索
 * const configPath = findConfigFile(['vite', 'rollup'], process.cwd(), TEstaSearchConfigFileType.USER);
 * // -> vite.config.ts または rollup.config.js など
 * ```
 */
export const findConfigFile = (
  baseNames: readonly string[],
  dirName: string,
  searchType: TEstaSearchConfigFileType,
): string => {
  const searchDirs = configSearchDirs(dirName, searchType);
  const configFilesList = searchDirs.flatMap((dir) =>
    baseNames.flatMap((base) =>
      PREFIXES.flatMap((pref) => EstaSupportedExtensions.map((ext) => resolve(dir, `${pref}${base}.${ext}`)))
    )
  );
  const found = configFilesList.find((file) => fs.existsSync(file));

  if (!found) {
    throw new Error('Config file not found.');
  }

  return found;
};

export default findConfigFile;
