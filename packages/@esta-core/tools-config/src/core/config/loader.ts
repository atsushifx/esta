// src/core/config/loader.ts
// @(#) : 設定ファイル読み込み機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { errorExit, ExitCode } from '@esta-core/error-handler';
import { loadConfig as loadConfigFile, TSearchConfigFileType } from '@esta-utils/config-loader';
import { existsSync } from 'node:fs';
import { basename, dirname, extname } from 'node:path';
import { parse } from 'valibot';
import { VALIDATION_ERROR_MESSAGES } from '../../internal/constants';
import { CompleteToolsConfigSchema, ToolsConfigSchema } from '../../internal/schemas';
import type { PartialToolsConfig, ToolsConfig } from '../../internal/types';

/**
 * 設定ファイルを読み込む（validated済み）
 * @param configPath 設定ファイルのパス
 * @returns 検証済み読み込み結果
 */
export const loadConfig = async (configPath: string): Promise<PartialToolsConfig> => {
  // 指定されたファイルが存在するかチェック
  if (!existsSync(configPath)) {
    errorExit(ExitCode.CONFIG_ERROR, `${VALIDATION_ERROR_MESSAGES.CONFIG_FILE_NOT_FOUND}: ${configPath}`);
  }

  try {
    // 設定ファイルを読み込み
    const configBaseName = basename(configPath, extname(configPath));
    const configDirPath = dirname(configPath);

    const fileConfig = await loadConfigFile<PartialToolsConfig>({
      baseNames: configBaseName,
      appName: 'tools-config',
      searchType: TSearchConfigFileType.PROJECT,
      baseDirectory: configDirPath,
    });

    // 設定ファイルが見つからない場合はnull
    if (fileConfig === null) {
      errorExit(ExitCode.CONFIG_ERROR, `${VALIDATION_ERROR_MESSAGES.CONFIG_FILE_LOAD_FAILED}: ${configPath}`);
    }

    // 設定を正規化（部分設定でも全て正規化される）
    const normalizedConfig = parse(ToolsConfigSchema, fileConfig);
    return normalizedConfig;
  } catch (error) {
    errorExit(
      ExitCode.VALIDATION_FAILED,
      `${VALIDATION_ERROR_MESSAGES.CONFIG_VALIDATION_FAILED}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

/**
 * 完全な設定かどうかをチェック
 * @param config 設定
 * @returns 完全な設定の場合はtrue
 */
export const isCompleteConfig = (config: PartialToolsConfig): config is ToolsConfig => {
  try {
    parse(CompleteToolsConfigSchema, config);
    return true;
  } catch {
    return false;
  }
};

/**
 * 部分設定を完全な設定として検証
 * @param config 部分設定
 * @returns 完全な設定として検証済みの設定
 */
export const validateCompleteConfig = (config: PartialToolsConfig): ToolsConfig => {
  try {
    return parse(CompleteToolsConfigSchema, config) as ToolsConfig;
  } catch (error) {
    errorExit(
      ExitCode.VALIDATION_FAILED,
      `${VALIDATION_ERROR_MESSAGES.CONFIG_VALIDATION_FAILED}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};
