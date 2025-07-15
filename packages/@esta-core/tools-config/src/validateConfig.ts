// src/validateConfig.ts
// @(#) : tools設定検証機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// valibot
import { safeParse, type SafeParseResult } from 'valibot';
// schemas
import { ToolsConfigSchema } from '../shared/schemas';
// types
import type { ToolEntry } from '../shared/types';
// validators
import { isEgetToolEntry, validateEgetToolEntry } from './validator/egetValidator';

/**
 * ツール設定の検証結果
 */
export type ValidateResult = SafeParseResult<typeof ToolsConfigSchema>;

/**
 * ツール設定が正しいかチェックする
 * パス形式の検証を含む詳細なチェックを実行
 * - defaultInstallDir: 有効なパス形式であること
 * - defaultTempDir: 有効なパス形式であること
 * - tools: ToolEntry配列であること
 * @param config 検証するツール設定
 * @returns 検証結果
 */
export const validateConfig = (config: unknown): ValidateResult => {
  return safeParse(ToolsConfigSchema, config);
};

/**
 * ツールエントリーリストの検証結果
 */
export type ValidateToolsResult = {
  success: boolean;
  validEntries: ToolEntry[];
  errors: Array<{
    index: number;
    entry: unknown;
    error: string;
  }>;
};

/**
 * 複数のToolEntryを検証する（混合リスト対応）
 * @param tools 検証するツールエントリーの配列
 * @returns 検証結果
 */
export const validateTools = (tools: unknown[]): ValidateToolsResult => {
  const validEntries: ToolEntry[] = [];
  const errors: Array<{
    index: number;
    entry: unknown;
    error: string;
  }> = [];

  tools.forEach((tool, index) => {
    try {
      // まず基本的なToolEntryの形式チェック
      if (!tool || typeof tool !== 'object') {
        throw new Error('Tool entry must be an object');
      }

      const entry = tool as Record<string, unknown>;
      if (!entry.installer || typeof entry.installer !== 'string') {
        throw new Error('Tool entry must have an installer field');
      }

      // installerタイプに応じた詳細検証
      switch (entry.installer) {
        case 'eget': {
          // ToolEntryとしてキャスト（基本フィールドのチェックは上で済んでいる）
          const toolEntry = entry as ToolEntry;
          if (isEgetToolEntry(toolEntry)) {
            const validatedEntry = validateEgetToolEntry(toolEntry);
            validEntries.push(validatedEntry);
          } else {
            throw new Error('Invalid eget tool entry format');
          }
          break;
        }
        default: {
          // 未対応のインストーラータイプ
          throw new Error(`Unsupported installer type: ${entry.installer}`);
        }
      }
    } catch (error) {
      errors.push({
        index,
        entry: tool,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return {
    success: errors.length === 0,
    validEntries,
    errors,
  };
};
