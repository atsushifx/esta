// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// 基本機能のエクスポート
export { ExitCode } from '@shared/constants/exitCode';
export type { TExitCode } from '@shared/constants/exitCode';
export { ExitError } from './error/ExitError';
export { errorExit } from './errorExit';
export { fatalExit } from './fatalExit';
export { handleExitError } from './handleExitError';
