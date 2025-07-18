// src/toolsValidator/validator/base.ts
// @(#) : ツール検証基本機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { VALIDATION_ERROR_MESSAGES } from '@/internal/constants';
import type { ToolEntry } from '@/internal/types';
import { errorExit, ExitCode } from '@esta-core/error-handler';
import { isEgetToolEntry, validateEgetToolEntry } from './egetValidator';

/**
 * ツールエントリーの基本構造を検証する
 * @param entry 検証対象のエントリー
 * @throws 検証エラーの場合
 */
const validateBasicToolEntry = (entry: unknown): void => {
  const errors: string[] = [];

  if (!entry || typeof entry !== 'object') {
    errors.push(VALIDATION_ERROR_MESSAGES.INSTALLER_REQUIRED);
    errors.push(VALIDATION_ERROR_MESSAGES.ID_REQUIRED);
    errors.push(VALIDATION_ERROR_MESSAGES.REPOSITORY_REQUIRED);
    errorExit(ExitCode.VALIDATION_FAILED, errors.join(', '));
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
    errorExit(ExitCode.VALIDATION_FAILED, errors.join(', '));
  }
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
      errorExit(ExitCode.VALIDATION_FAILED, 'Invalid eget tool entry format');
    }
    // eslint-disable-next-line no-fallthrough
    default: {
      // 未対応のインストーラータイプ
      errorExit(ExitCode.VALIDATION_FAILED, `${VALIDATION_ERROR_MESSAGES.UNSUPPORTED_INSTALLER}: ${entry.installer}`);
    }
  }
};

/**
 * 複数のToolEntryを検証する
 * @param tools 検証するツールエントリーの配列
 * @throws ExitError 最初の無効なエントリーで即座に終了
 */
export const validateTools = (tools: ToolEntry[]): void => {
  tools.forEach((tool, index) => {
    try {
      // まず基本構造を検証
      validateBasicToolEntry(tool);

      // インストーラータイプに応じた詳細検証
      validateToolEntryByInstaller(tool);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errorExit(ExitCode.VALIDATION_FAILED, `Tool entry at index ${index}: ${message}`);
    }
  });
};
