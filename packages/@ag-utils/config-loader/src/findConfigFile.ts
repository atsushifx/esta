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
import type { TEstaSearchConfigFileType } from '@shared/types/common.types';
import { EstaSupportedExtensions } from '@shared/types/configFile.types';

// modules
import { configSearchDirs } from './configSearchDirs';

// --- types

// types

/**
 * 固定化するプレフィックス
 */
const PREFIXES = ['', '.'] as const;

/**
 * baseNames （拡張子なしのベース名）と searchDirs（絶対パスの配列）から、
 * 見つかった最初の設定ファイルのパスを返す。
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
