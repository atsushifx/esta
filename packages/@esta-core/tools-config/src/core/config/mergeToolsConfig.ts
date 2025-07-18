// src/core/config/mergeToolsConfig.ts
// @(#) : ツール設定のマージ処理
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { PartialToolsConfig, ToolsConfig } from '../../../shared/types/toolsConfig.types';

/**
 * デフォルト設定と読み込み設定をマージしてツール設定を生成
 *
 * @param defaultConfig デフォルトのツール設定
 * @param loadConfig 読み込まれた部分的なツール設定または空オブジェクト
 * @returns マージされたツール設定または空オブジェクト
 */
export const mergeToolsConfig = (
  defaultConfig: ToolsConfig,
  loadConfig: PartialToolsConfig | object,
): ToolsConfig | object => {
  if (Object.keys(loadConfig).length === 0) {
    return loadConfig as ToolsConfig;
  }

  const partialConfig = loadConfig as PartialToolsConfig;

  return {
    ...defaultConfig,
    ...partialConfig,
    tools: [
      ...defaultConfig.tools,
      ...(partialConfig.tools ?? []),
    ],
  } as ToolsConfig;
};
