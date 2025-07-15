// src/loadConfig.ts
// @(#) : 設定ファイル読み込み機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// config-loader
import { loadConfig as loadConfigFile, TSearchConfigFileType } from '@esta-utils/config-loader';
// types
import type { ToolsConfig } from '../shared/types';
// path
import { existsSync } from 'node:fs';
import { basename, dirname, extname } from 'node:path';

export type LoadConfigResult = {
  success: boolean;
  config?: Partial<ToolsConfig>;
  error?: string;
};

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
      appName: 'tools-config', // アプリケーション名として固定値を使用
      searchType: TSearchConfigFileType.PROJECT, // PROJECT検索タイプを使用
      baseDirectory: configDirPath, // ベースディレクトリを明示的に指定
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
