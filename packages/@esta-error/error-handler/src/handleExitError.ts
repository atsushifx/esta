// src: ./handleExitError.ts
// @(#): ExitErrorハンドラ関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as core from '@actions/core';
// modules
import { estaFeatures, TEstaExecutionMode } from '@esta-core/feature-flags';
// types
import type { ExitError } from './error/ExitError';

/**
 * ExitErrorを処理して適切な方法でアプリケーションを終了
 * GitHub Actions環境ではcore.setFailedを使用、それ以外ではprocess.exitを使用
 * @param err 処理するExitErrorインスタンス
 */
export const handleExitError = (err: ExitError): void => {
  const prefix = err.isFatal() ? 'FATAL' : 'ERROR';
  const message = `[${prefix} ${err.code}] ${err.message}`;

  if (estaFeatures.executionMode === TEstaExecutionMode.GITHUB_ACTIONS) {
    core.setFailed(message);
  } else {
    process.exit(err.code);
  }
};
