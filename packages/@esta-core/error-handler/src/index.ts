// src: ./index.ts
// @(#): エラーハンドラパッケージのエントリポイント
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
export { ExitCode } from '@shared/constants/exitCode';
// types
export type { TExitCode } from '@shared/constants/exitCode';
// classes
export { ExitError } from './error/ExitError';
// functions
export { errorExit } from './errorExit';
export { fatalExit } from './fatalExit';
export { handleExitError } from './handleExitError';
