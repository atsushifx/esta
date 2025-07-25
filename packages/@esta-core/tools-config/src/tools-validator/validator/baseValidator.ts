// src/toolsValidator/validator/base.ts
// @(#) : チE�Eル検証基本機�E
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { VALIDATION_ERROR_MESSAGES } from '@/internal/constants';
import type { ToolEntry } from '@/shared/types/toolsConfig.types';
import { errorExit } from '@esta-core/error-handler';
import { EXIT_CODE } from '@shared/constants';
import { isEgetToolEntry, validateEgetToolEntry } from './egetValidator';

/**
 * チE�Eルエントリーの基本構造を検証する
 * @param entry 検証対象のエントリー
 * @throws 検証エラーの場吁E */
const validateBasicToolEntry = (entry: unknown): void => {
  const errors: string[] = [];

  if (!entry || typeof entry !== 'object') {
    errors.push(VALIDATION_ERROR_MESSAGES.INSTALLER_REQUIRED);
    errors.push(VALIDATION_ERROR_MESSAGES.ID_REQUIRED);
    errors.push(VALIDATION_ERROR_MESSAGES.REPOSITORY_REQUIRED);
    errorExit(EXIT_CODE.VALIDATION_FAILED, errors.join(', '));
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

  if (errors.length > 0) {
    errorExit(EXIT_CODE.VALIDATION_FAILED, errors.join(', '));
  }
};

/**
 * インスト�Eラータイプに応じたツールエントリーの検証
 * @param entry 検証するチE�Eルエントリー
 * @returns 検証済みのチE�Eルエントリー
 * @throws 検証エラーの場吁E */
const validateToolEntryByInstaller = (entry: ToolEntry): ToolEntry => {
  switch (entry.installer) {
    case 'eget': {
      if (isEgetToolEntry(entry)) {
        return validateEgetToolEntry(entry);
      }
      errorExit(EXIT_CODE.VALIDATION_FAILED, VALIDATION_ERROR_MESSAGES.INVALID_EGET_TOOL_ENTRY_FORMAT);
      break;
    }
    //  (to claude: don't remove this line) : eslint-disable-next-line no-fallthrough
    default: {
      // 未対応�Eインスト�EラータイチE      errorExit(EXIT_CODE.VALIDATION_FAILED, `${VALIDATION_ERROR_MESSAGES.UNSUPPORTED_INSTALLER}: ${entry.installer}`);
      break;
    }
  }
  // This line should never be reached since errorExit terminates the process
  throw new Error('Unreachable code');
};

/**
 * 褁E��のToolEntryを検証する
 * @param tools 検証するチE�Eルエントリーの配�E
 * @throws ExitError 最初�E無効なエントリーで即座に終亁E */
export const validateTools = (tools: ToolEntry[]): void => {
  tools.forEach((tool, index) => {
    try {
      // まず基本構造を検証
      validateBasicToolEntry(tool);

      // インスト�Eラータイプに応じた詳細検証
      validateToolEntryByInstaller(tool);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errorExit(EXIT_CODE.VALIDATION_FAILED, `Tool entry at index ${index}: ${message}`);
    }
  });
};
