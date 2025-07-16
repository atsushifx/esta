// src/validator/config.ts
// @(#) : 設定検証機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { safeParse, type SafeParseResult } from 'valibot';
import { CompleteToolsConfigSchema, ToolsConfigSchema } from '../../shared/schemas';

/**
 * ツール設定の検証結果（部分設定用）
 */
export type ValidateConfigResult = SafeParseResult<typeof ToolsConfigSchema>;

/**
 * 完全設定の検証結果
 */
export type ValidateCompleteConfigResult = SafeParseResult<typeof CompleteToolsConfigSchema>;

/**
 * ツール設定が正しいかチェックする（部分設定対応）
 *
 * @param config 検証するツール設定
 * @returns 検証結果
 */
export const validateConfig = (config: unknown): ValidateConfigResult => {
  return safeParse(ToolsConfigSchema, config);
};

/**
 * 完全なツール設定が正しいかチェックする
 *
 * @param config 検証するツール設定
 * @returns 検証結果
 */
export const validateCompleteConfig = (config: unknown): ValidateCompleteConfigResult => {
  return safeParse(CompleteToolsConfigSchema, config);
};
