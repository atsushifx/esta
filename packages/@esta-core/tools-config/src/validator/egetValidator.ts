import { boolean, object, optional, pipe, safeParse, string, transform } from 'valibot';
import type { ToolEntry } from '../../shared/types';

/**
 * eget用ツールエントリーのオプション型
 * 実際に使用可能なオプションのみを定義
 */
export type EgetToolEntryOptions = {
  /** バージョン指定（/tag:xxxとして使用） */
  version?: string;
  /** インストールディレクトリ（/to:xxxとして使用） */
  installDir?: string;
  /** 静粛モード（/quietとして使用） */
  quiet?: boolean;
  /** アセット指定（/asset:xxxとして使用） */
  asset?: string;
};

/**
 * eget用ツールエントリー型
 */
export type EgetToolEntry = Omit<ToolEntry, 'options'> & {
  installer: 'eget';
  options?: EgetToolEntryOptions;
};

/**
 * repositoryフィールドがGitHub形式（owner/repo）であることを検証
 */
const validateRepositoryFormat = (repository: string): boolean => {
  const githubRepoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
  return githubRepoPattern.test(repository);
};

/**
 * eget用のオプションスキーマ
 */
export const EgetOptionsSchema = object({
  version: optional(string()),
  installDir: optional(string()),
  quiet: optional(boolean()),
  asset: optional(string()),
});

/**
 * eget用ツールエントリーのスキーマ
 */
export const EgetToolEntrySchema = object({
  installer: pipe(
    string(),
    transform((value) => {
      if (value !== 'eget') {
        throw new Error('installer must be "eget"');
      }
      return value as 'eget';
    }),
  ),
  id: string(),
  repository: pipe(
    string(),
    transform((value) => {
      if (!validateRepositoryFormat(value)) {
        throw new Error('repository must be in "owner/repo" format');
      }
      return value;
    }),
  ),
  options: optional(EgetOptionsSchema),
});

/**
 * 単一のeget用ツールエントリーの検証
 */
export const validateEgetToolEntry = (entry: ToolEntry): EgetToolEntry => {
  const result = safeParse(EgetToolEntrySchema, entry);

  if (!result.success) {
    const errorMessages = result.issues.map((issue) => issue.message).join(', ');
    throw new Error(`Invalid eget tool entry: ${errorMessages}`);
  }

  return result.output as EgetToolEntry;
};

/**
 * ToolEntryがeget用エントリーかどうかを判定
 */
export const isEgetToolEntry = (entry: ToolEntry): entry is EgetToolEntry => {
  return entry.installer === 'eget';
};
