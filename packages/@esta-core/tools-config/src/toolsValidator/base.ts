// src/toolsValidator/base.ts
// @(#) : ツール検証基本機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { VALIDATION_ERROR_MESSAGES } from '../internal/constants';
import type { ToolEntry, ValidateToolsResult } from '../internal/types';
import { isEgetToolEntry, validateEgetToolEntry } from './egetValidator';

/**
 * ツールエントリーの基本構造を検証する
 * @param entry 検証対象のエントリー
 * @returns 検証結果
 */
const validateBasicToolEntry = (entry: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!entry || typeof entry !== 'object') {
    errors.push(VALIDATION_ERROR_MESSAGES.INSTALLER_REQUIRED);
    errors.push(VALIDATION_ERROR_MESSAGES.ID_REQUIRED);
    errors.push(VALIDATION_ERROR_MESSAGES.REPOSITORY_REQUIRED);
    return { valid: false, errors };
  }

  const entryObj = entry as Record<string, unknown>;

  if (!entryObj.installer || typeof entryObj.installer !== 'string') {
    errors.push(VALIDATION_ERROR_MESSAGES.INSTALLER_REQUIRED);
  }

  if (!entryObj.id || typeof entryObj.id !== 'string') {
    errors.push(VALIDATION_ERROR_MESSAGES.ID_REQUIRED);
  }

  if (!entryObj.repository || typeof entryObj.repository !== 'string') {
    errors.push(VALIDATION_ERROR_MESSAGES.REPOSITORY_REQUIRED);
  }

  return { valid: errors.length === 0, errors };
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
      throw new Error(`${VALIDATION_ERROR_MESSAGES.UNSUPPORTED_INSTALLER}: ${entry.installer}`);
    }
  }
};

/**
 * 複数のToolEntryを検証する
 * @param tools 検証するツールエントリーの配列
 * @returns 検証結果
 */
export const validateTools = (tools: ToolEntry[]): ValidateToolsResult => {
  const validEntries: ToolEntry[] = [];
  const errors: Array<{
    index: number;
    entry: ToolEntry;
    error: string;
  }> = [];

  tools.forEach((tool, index) => {
    try {
      // まず基本構造を検証
      const basicValidation = validateBasicToolEntry(tool);
      if (!basicValidation.valid) {
        throw new Error(basicValidation.errors.join(', '));
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
