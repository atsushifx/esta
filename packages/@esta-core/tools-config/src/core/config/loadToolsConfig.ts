// src/core/config/loadConfig.ts
// @(#) : 設定ファイル読み込み機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Node.js filesystem and path utilities
import { existsSync } from 'node:fs';
import { basename, dirname, extname } from 'node:path';
// valibot schema validation utilities
import { parse } from 'valibot';
// validation error messages
import { VALIDATION_ERROR_MESSAGES } from '@/internal/constants';
// error handling utilities
import { errorExit, ExitCode } from '@esta-core/error-handler';
// configuration file loading utilities
import { loadConfig as loadConfigFile, TSearchConfigFileType } from '@esta-utils/config-loader';
// validation schemas
import { CompleteToolsConfigSchema, ToolsConfigSchema } from '@/internal/schemas';
// tools configuration types
import type { PartialToolsConfig, ToolsConfig } from '@/shared/types/toolsConfig.types';

/**
 * 設定ファイルを読み込む（validated済み）
 * @param configPath 設定ファイルのパス
 * @returns 検証済み読み込み結果
 */
export const loadToolsConfig = async (configPath: string): Promise<PartialToolsConfig> => {
  // 指定されたファイルが存在しない場合は空オブジェクトを返す
  if (!existsSync(configPath)) {
    return {};
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

    // 設定ファイルが見つからない場合は空オブジェクトを返す
    if (fileConfig === null) {
      return {};
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
