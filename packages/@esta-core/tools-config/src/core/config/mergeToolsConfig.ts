// src/core/config/mergeToolsConfig.ts
// @(#) : ツール設定のマージ処理
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// valibot schema validation utilities
import { parse } from 'valibot';
// tools configuration types
import type { PartialToolsConfig, ToolsConfig } from '../../../shared/types/toolsConfig.types';
// validation schemas
import { CompleteToolsConfigSchema } from '../../internal/schemas';

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
): ToolsConfig => {
  if (Object.keys(loadConfig).length === 0) {
    return defaultConfig;
  }

  const partialConfig = loadConfig as PartialToolsConfig;

  // ツールIDベースでマージ（重複IDは新しい設定で上書き）
  const newTools = partialConfig.tools ?? [];
  const mergedTools = newTools.reduce(
    (tools, newTool) => {
      const existingIndex = tools.findIndex((tool) => tool.id === newTool.id);
      return existingIndex >= 0
        ? tools.map((tool, index) => index === existingIndex ? newTool : tool)
        : [...tools, newTool];
    },
    [...defaultConfig.tools],
  );

  const mergedConfig = {
    ...defaultConfig,
    ...partialConfig,
    tools: mergedTools,
  };

  // 結果を完全な設定として検証
  return parse(CompleteToolsConfigSchema, mergedConfig) as ToolsConfig;
};
