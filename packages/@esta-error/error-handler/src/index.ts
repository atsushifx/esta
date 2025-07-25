// src: ./index.ts
// @(#): エラーハンドラパッケージのエントリポイント
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
export { EXIT_CODE } from '@shared/constants';
// types
export type { TExitCode } from '@shared/constants';
// classes
export { ExitError } from './error/ExitError';
// functions
export { errorExit } from './errorExit';
export { fatalExit } from './fatalExit';
