// src/validator/validate.ts
// @(#) : ツール検証機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { ToolEntry, ValidateToolsResult } from '../types';
import { isEgetToolEntry, validateEgetToolEntry } from './egetValidator';

/**
 * ツールエントリーの基本検証
 * @param entry 検証するエントリー
 * @returns 基本的に有効なToolEntryかどうか
 */
const isValidToolEntryStructure = (entry: unknown): entry is ToolEntry => {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const obj = entry as Record<string, unknown>;
  return (
    typeof obj.installer === 'string'
    && typeof obj.id === 'string'
    && typeof obj.repository === 'string'
  );
};

/**
 * インストーラータイプに応じたツールエントリーの検証
 * @param entry 検証するツールエントリー
 * @returns 検証済みのツールエントリー
 * @throws 検証エラーの場合
 */
const validateToolEntryByInstaller = (entry: ToolEntry): ToolEntry => {
  switch (entry.installer) {
    case 'eget': {
      if (isEgetToolEntry(entry)) {
        return validateEgetToolEntry(entry);
      }
      throw new Error('Invalid eget tool entry format');
    }
    default: {
      // 未対応のインストーラータイプ
      throw new Error(`Unsupported installer type: ${entry.installer}`);
    }
  }
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
      if (!isValidToolEntryStructure(tool)) {
        throw new Error('Tool entry must be an object with installer, id, and repository fields');
      }

      // インストーラータイプに応じた詳細検証
      const validatedEntry = validateToolEntryByInstaller(tool);
      validEntries.push(validatedEntry);
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
