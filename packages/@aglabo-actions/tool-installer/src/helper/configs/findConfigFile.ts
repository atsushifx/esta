// src/utils/helpers/findConfigFile.ts
// @(#) : 設定ファイル探索ユーティリティ（prefix/extension 固定版）
//
// Copyright (c) 2025 atsushifx
// MIT License
// https://opensource.org/licenses/MIT

// libs
import * as fs from 'fs';
import { resolve } from 'path';

// modules
import { configSearchDirs } from './configSearchDirs';

// --- types
import type { ConfigType } from '@shared/types';

// types

/**
 * 固定化するプレフィックス／拡張子
 */
const PREFIXES = ['', '.'] as const;
const EXTENSIONS = ['json', 'jsonc', 'yml', 'yaml', 'js', 'ts'] as const;

/**
 * baseNames （拡張子なしのベース名）と searchDirs（絶対パスの配列）から、
 * 見つかった最初の設定ファイルのパスを返す。
 */
export const findConfigFile = (
  baseNames: readonly string[],
  dirName: string,
  configType: ConfigType,
): string => {
  const searchDirs = configSearchDirs(dirName, configType);
  const configFilesList = searchDirs.flatMap((dir) =>
    baseNames.flatMap((base) =>
      PREFIXES.flatMap((pref) => EXTENSIONS.map((ext) => resolve(dir, `${pref}${base}.${ext}`)))
    )
  );
  const found = configFilesList.find((file) => fs.existsSync(file));

  if (!found) {
    throw new Error('Config file not found.');
  }

  return found;
};

export default findConfigFile;
