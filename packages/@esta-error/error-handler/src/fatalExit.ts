// src: ./fatalExit.ts
// @(#): 致命的エラー終了関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { TExitCode } from '@shared/constants';
// classes
import { ExitError } from './error/ExitError';
// utils
import { getLogger } from '@agla-utils/ag-logger';
import { formatErrorMessage } from './utils/exitCodeUtils';

/**
 * 致命的エラーでアプリケーションを終了
 * エラーをログに記録して致命的ExitErrorをスロー
 * @param code 終了コード
 * @param message エラーメッセージ
 * @throws ExitError 常に致命的ExitErrorをスロー
 */
export const fatalExit = (
  code: TExitCode,
  message: string,
): never => {
  const formattedMessage = formatErrorMessage('FATAL', code, message);
  const logger = getLogger();
  logger.fatal(formattedMessage);
  throw new ExitError(code, message, true);
};
