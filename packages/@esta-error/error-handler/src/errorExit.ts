// src: ./errorExit.ts
// @(#): 非致命的エラー終了関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { TExitCode } from '@shared/constants';
// constants
import { EXIT_CODE } from '@shared/constants';
// classes
import { ExitError } from './error/ExitError';
// utils
import { getLogger } from '@agla-utils/ag-logger';
import { formatErrorMessage } from './utils/exitCodeUtils';

/**
 * 非致命的エラーでアプリケーションを終了
 * エラーをログに記録してExitErrorをスロー
 */
export const errorExit = ((
  codeOrMessage: TExitCode | string,
  message?: string,
): never => {
  let code: TExitCode;
  let errorMessage: string;

  if (typeof codeOrMessage === 'string') {
    code = EXIT_CODE.EXEC_FAILURE;
    errorMessage = codeOrMessage;
  } else {
    code = codeOrMessage;
    errorMessage = message!;
  }

  const formattedMessage = formatErrorMessage('ERROR', code, errorMessage);
  const logger = getLogger();
  logger.error(formattedMessage);
  throw new ExitError(code, errorMessage);
}) as {
  (code: TExitCode, message: string): never;
  (message: string): never;
};
