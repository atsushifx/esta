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
import { SearchConfigFileType } from '@shared/types/common.types';

// modules
import { findConfigFile } from './findConfigFile';
import { parseConfig } from './parser/parseConfig';

export const loadConfig = <T = object>(
  basename: string,
  dirName: string = process.cwd(),
  searchType: SearchConfigFileType = SearchConfigFileType.USER,
): T => {
  const configFilePath = findConfigFile([basename], dirName, searchType);
  const rawContent = fs.readFileSync(configFilePath, 'utf-8');
  const extension = extname(configFilePath);

  return parseConfig<T>(extension, rawContent);
};

export default loadConfig;
