// src/getToolsConfig.ts
// @(#) : メインエントリーポイント - 設定ファイル読み込み・マージ・検証
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// core
import { loadToolsConfig, mergeToolsConfig } from './core';
import { defaultToolsConfig } from './defaults';
// tools configuration types
import type { ToolsConfig } from '@/shared/types/toolsConfig.types';

/**
 * 設定ファイルを読み込み、デフォルト値とマージして完全な設定を取得
 * @param configPath 設定ファイルのパス
 * @returns 完全な設定オブジェクト
 */
export const getToolsConfig = async (configPath: string): Promise<ToolsConfig> => {
  // デフォルト値を取得
  const defaultConfig = defaultToolsConfig();

  // 設定ファイルを読み込み
  const fileConfig = await loadToolsConfig(configPath);

  // 設定をマージ（検証済み）
  const mergedConfig = mergeToolsConfig(defaultConfig, fileConfig);

  return mergedConfig;
};
