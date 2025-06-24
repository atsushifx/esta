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
import type { SearchConfigFileType } from '@shared/types/common.types';
import { CONFIG_FILE_EXTENSIONS } from '@shared/types/common.types';

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
  SearchConfigFileType: SearchConfigFileType,
): string => {
  const searchDirs = configSearchDirs(dirName, SearchConfigFileType);
  const configFilesList = searchDirs.flatMap((dir) =>
    baseNames.flatMap((base) =>
      PREFIXES.flatMap((pref) =>
        Object.values(CONFIG_FILE_EXTENSIONS).map((ext) => resolve(dir, `${pref}${base}.${ext}`))
      )
    )
  );
  const found = configFilesList.find((file) => fs.existsSync(file));

  if (!found) {
    throw new Error('Config file not found.');
  }

  return found;
};

export default findConfigFile;
