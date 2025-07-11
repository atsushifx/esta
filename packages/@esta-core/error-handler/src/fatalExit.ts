// src: ./fatalExit.ts
// @(#): 致命的エラー終了関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { getLogger } from '@agla-utils/ag-logger';
// constants
import { ExitCode } from '@shared/constants';
// types
import type { TExitCode } from '@shared/constants';
// classes
import { ExitError } from './error/ExitError';
// utils
import { formatErrorMessage } from './utils/exitCodeUtils';

/**
 * 致命的エラーでアプリケーションを終了
 * エラーをログに記録して致命的ExitErrorをスロー
 * @param message エラーメッセージ
 * @param code 終了コード（デフォルト: ExitCode.EXEC_FAILURE）
 * @throws ExitError 常に致命的ExitErrorをスロー
 */
export const fatalExit = (
  message: string,
  code: TExitCode = ExitCode.EXEC_FAILURE,
): never => {
  const logger = getLogger();
  const formattedMessage = formatErrorMessage('FATAL', code, message);
  logger.fatal(formattedMessage);
  throw new ExitError(code, message, true);
};
