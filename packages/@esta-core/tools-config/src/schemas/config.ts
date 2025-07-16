// src/schemas/config.ts
// @(#) : 設定関連スキーマ定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { array, check, object, pipe, string } from 'valibot';
import { arePathsEqual, validateAndNormalizePath } from '../validator/utils';
import { ToolEntrySchema } from './tools';

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
    ),
    tools: array(ToolEntrySchema),
  }),
  check(
    (config) => !arePathsEqual(config.defaultInstallDir, config.defaultTempDir),
    'defaultInstallDir and defaultTempDir must be different directories',
  ),
);
