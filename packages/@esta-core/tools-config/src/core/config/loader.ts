// src/core/config/loader.ts
// @(#) : 設定ファイル読み込み機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { loadConfig as loadConfigFile, TSearchConfigFileType } from '@esta-utils/config-loader';
import { existsSync } from 'node:fs';
import { basename, dirname, extname } from 'node:path';
import type { LoadConfigResult, ToolsConfig } from '../../types';

/**
 * 設定ファイルを読み込む
 * @param configPath 設定ファイルのパス
 * @returns 読み込み結果
 */
export const loadConfig = async (configPath: string): Promise<LoadConfigResult> => {
  try {
    // 指定されたファイルが存在するかチェック
    if (!existsSync(configPath)) {
      return {
        success: false,
        error: `Configuration file not found: ${configPath}`,
      };
    }

    // 設定ファイルを読み込み
    const configBaseName = basename(configPath, extname(configPath));
    const configDirPath = dirname(configPath);

    const fileConfig = await loadConfigFile<Partial<ToolsConfig>>({
      baseNames: configBaseName,
      appName: 'tools-config',
      searchType: TSearchConfigFileType.PROJECT,
      baseDirectory: configDirPath,
    });

    // 設定ファイルが見つからない場合はnull
    if (fileConfig === null) {
      return {
        success: false,
        error: `Configuration file could not be loaded: ${configPath}`,
      };
    }

    return {
      success: true,
      config: fileConfig,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
