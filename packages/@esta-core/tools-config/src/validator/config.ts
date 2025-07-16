// src/validator/config.ts
// @(#) : 設定検証機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { safeParse, type SafeParseResult } from 'valibot';
import { ToolsConfigSchema } from '../../shared/schemas';

/**
 * ツール設定の検証結果
 */
export type ValidateConfigResult = SafeParseResult<typeof ToolsConfigSchema>;

/**
 * ツール設定が正しいかチェックする
 *
 * @param config 検証するツール設定
 * @returns 検証結果
 */
export const validateConfig = (config: unknown): ValidateConfigResult => {
  return safeParse(ToolsConfigSchema, config);
};
