import { errorExit, ExitCode } from '@esta-core/error-handler';
import { object, optional, pipe, record, safeParse, string, transform } from 'valibot';
import { VALID_EGET_OPTIONS, VALIDATION_ERROR_MESSAGES } from '../../internal/constants';
import type { ToolEntry } from '../../internal/types';

/**
 * eget用オプションの検証
 * @param options オプション文字列のRecord
 * @returns 検証結果
 */
const validateEgetOptions = (options: Record<string, string>): boolean => {
  for (const [key, value] of Object.entries(options)) {
    // キーが有効なオプションかチェック
    if (!VALID_EGET_OPTIONS.includes(key as (typeof VALID_EGET_OPTIONS)[number])) {
      return false;
    }

    // /a や /asset: の場合、値（アセット文字列）が必要
    if ((key === '/a' || key === '/asset:') && (!value || value.trim() === '')) {
      return false;
    }

    // /q や /quiet の場合、値は空でも良い
    if ((key === '/q' || key === '/quiet') && value !== '') {
      return false;
    }
  }

  return true;
};

/**
 * eget用ツールエントリー型
 */
export type EgetToolEntry = ToolEntry & {
  installer: 'eget';
};

/**
 * repositoryフィールドがGitHub形式（owner/repo）であることを検証
 */
const validateRepositoryFormat = (repository: string): boolean => {
  const githubRepoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
  return githubRepoPattern.test(repository);
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
      if (!validateRepositoryFormat(value)) {
        throw new Error(VALIDATION_ERROR_MESSAGES.INVALID_REPOSITORY_FORMAT);
      }
      return value;
    }),
  ),
  version: optional(string()),
  options: optional(
    pipe(
      record(string(), string()),
      transform((options) => {
        // eget用オプションの検証
        if (!validateEgetOptions(options)) {
          throw new Error(VALIDATION_ERROR_MESSAGES.INVALID_EGET_OPTIONS);
        }

        return options;
      }),
    ),
  ),
});

/**
 * 単一のeget用ツールエントリーの検証
 */
export const validateEgetToolEntry = (entry: ToolEntry): EgetToolEntry => {
  const result = safeParse(EgetToolEntrySchema, entry);

  if (!result.success) {
    const errorMessages = result.issues.map((issue) => issue.message).join(', ');
    errorExit(ExitCode.VALIDATION_FAILED, `Invalid eget tool entry: ${errorMessages}`);
  }

  return result.output as EgetToolEntry;
};

/**
 * ToolEntryがeget用エントリーかどうかを判定
 */
export const isEgetToolEntry = (entry: ToolEntry): entry is EgetToolEntry => {
  return entry.installer === 'eget';
};
