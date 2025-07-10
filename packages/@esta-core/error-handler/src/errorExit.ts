// src: ./errorExit.ts
// @(#): 非致命的エラー終了関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { getLogger } from '@agla-utils/ag-logger';
// types
import type { TExitCode } from '@shared/constants/exitCode';
// classes
import { ExitError } from './error/ExitError';
// utils
import { formatErrorMessage } from './utils/exitCodeUtils';

/**
 * 非致命的エラーでアプリケーションを終了
 * エラーをログに記録してExitErrorをスロー
 * @param code 終了コード
 * @param message エラーメッセージ
 * @throws ExitError 常にExitErrorをスロー
 */
export const errorExit = (
  code: TExitCode,
  message: string,
): never => {
  const logger = getLogger();
  const formattedMessage = formatErrorMessage('ERROR', code, message);
  logger.error(formattedMessage);
  throw new ExitError(code, message);
};
