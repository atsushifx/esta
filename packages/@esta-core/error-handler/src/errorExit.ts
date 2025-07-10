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
// constants
import { ExitCode, ExitCodeErrorMessage } from '@shared/constants/exitCode';
// classes
import { ExitError } from './error/ExitError';

/**
 * 終了コードに対応するエラーメッセージを取得
 * @param code 終了コード
 * @returns エラーメッセージ
 */
const getExitCodeMessage = (code: TExitCode): string => {
  return ExitCodeErrorMessage[code] || ExitCodeErrorMessage[ExitCode.UNKNOWN_ERROR].replace('##', code.toString());
};

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
  const defaultMessage = getExitCodeMessage(code);
  logger.error(`${defaultMessage}: ${message}`);
  throw new ExitError(code, message);
};
