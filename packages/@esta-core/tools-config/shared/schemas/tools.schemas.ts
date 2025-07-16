import { any, array, check, object, optional, pipe, record, string, transform } from 'valibot';
import { validateAndNormalizePath } from '../../src/validator/utils';

/**
 * ツールエントリーのスキーマ
 * 基本的なToolEntry構造を検証し、正規化を実行
 */
export const ToolEntrySchema = object({
  /** インストーラータイプ */
  installer: string(),
  /** ツールID (正規化: 英小文字) */
  id: pipe(string(), transform((id) => id.toLowerCase())),
  /** GitHubリポジトリ (正規化: 英小文字) */
  repository: pipe(string(), transform((repo) => repo.toLowerCase())),
  /** オプション（任意、args配列は正規化: 英小文字） */
  options: optional(
    pipe(
      record(string(), any()),
      transform((options) => {
        if (Array.isArray(options.args)) {
          return {
            ...options,
            args: options.args.map((arg: string) => typeof arg === 'string' ? arg.toLowerCase() : arg),
          };
        }
        return options;
      }),
    ),
  ),
});

/**
 * パス正規化関数
 * パスを "/" + 英小文字の形式に正規化
 */
const normalizePath = (path: string): string => {
  const normalized = validateAndNormalizePath(path);
  // Windows形式のパスを Unix形式に変換し、小文字にする
  return normalized.replace(/\\/g, '/').toLowerCase();
};

/**
 * ツール設定全体のスキーマ
 * パス検証と正規化、ディレクトリ重複チェックを含む
 */
export const ToolsConfigSchema = pipe(
  object({
    defaultInstallDir: pipe(
      string(),
      check(
        (path) => {
          try {
            validateAndNormalizePath(path);
            return true;
          } catch {
            return false;
          }
        },
        'defaultInstallDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
      ),
      transform(normalizePath),
    ),
    defaultTempDir: pipe(
      string(),
      check(
        (path) => {
          try {
            validateAndNormalizePath(path);
            return true;
          } catch {
            return false;
          }
        },
        'defaultTempDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
      ),
      transform(normalizePath),
    ),
    tools: array(ToolEntrySchema),
  }),
  check(
    (config) => config.defaultInstallDir !== config.defaultTempDir,
    'defaultInstallDir and defaultTempDir must be different directories',
  ),
);
