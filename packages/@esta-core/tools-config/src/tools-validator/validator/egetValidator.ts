// src/tools-validator/validator/egetValidator.ts
// @(#) : eget installer用ツールエントリーの検証機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// error handling utilities
import { errorExit, ExitCode } from '@esta-core/error-handler';
// valibot schema validation utilities
import { object, optional, pipe, record, safeParse, string, transform } from 'valibot';
// validation constants and error messages
import { VALID_EGET_OPTIONS, VALIDATION_ERROR_MESSAGES } from '../../internal/constants/validation';
// tool entry types
import type { ToolEntry } from '@/shared/types/toolsConfig.types';
// validation utility functions
import { chkValidOptions, isValidGitHubRepoFormat, isValidSemverOrLatest } from '../utils/validatorUtils';

/**
 * eget用ツールエントリー型
 */
export type EgetToolEntry = ToolEntry & {
  installer: 'eget';
};

/**
 * eget用ツールエントリーのスキーマ
 */
export const EgetToolEntrySchema = object({
  installer: pipe(
    string(),
    transform((value) => {
      if (value !== 'eget') {
        throw new Error(VALIDATION_ERROR_MESSAGES.EGET_INSTALLER_REQUIRED);
      }
      return value as 'eget';
    }),
  ),
  id: string(),
  repository: pipe(
    string(),
    transform((value) => {
      if (!isValidGitHubRepoFormat(value)) {
        throw new Error(VALIDATION_ERROR_MESSAGES.INVALID_REPOSITORY_FORMAT);
      }
      return value;
    }),
  ),
  version: optional(
    pipe(
      string(),
      transform((value) => {
        if (!isValidSemverOrLatest(value)) {
          throw new Error(VALIDATION_ERROR_MESSAGES.INVALID_VERSION_FORMAT);
        }
        return value;
      }),
    ),
  ),
  options: optional(
    pipe(
      record(string(), string()),
      transform((options) => {
        // eget用オプションの検証
        const errorMessage = chkValidOptions(options, VALID_EGET_OPTIONS);
        if (errorMessage) {
          errorExit(ExitCode.VALIDATION_FAILED, VALIDATION_ERROR_MESSAGES.INVALID_OPTIONS + ': ' + errorMessage);
        }
        return options;
      }),
    ),
  ),
});

/**
 * 単一のeget用ツールエントリーの検証
 * @param entry 検証するツールエントリー
 * @returns 検証済みのeget用ツールエントリー
 * @throws 検証に失敗した場合はプロセスを終了
 */
export const validateEgetToolEntry = (entry: ToolEntry): EgetToolEntry => {
  const result = safeParse(EgetToolEntrySchema, entry);
  if (!result.success) {
    const errorMessages = result.issues.map((issue) => issue.message).join(', ');
    errorExit(ExitCode.VALIDATION_FAILED, `Invalid tool entry: ${errorMessages}`);
  }
  return result.output as EgetToolEntry;
};

/**
 * ToolEntryがeget用エントリーかどうかを判定
 *
 * @param entry 判定対象のツールエントリー
 * @returns eget用エントリーかどうか
 */
export const isEgetToolEntry = (entry: ToolEntry): entry is EgetToolEntry => {
  return entry.installer === 'eget';
};
