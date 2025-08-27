// src: shared/packages/constants/base/exitCode.ts
// @(#) : POSIX準拠の終了コード定義
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * POSIX準拠の終了コード定義
 * 詳細は docs/detailed-design/exit-codes.md を参照
 */
export const EXIT_CODE = {
  // 標準終了コード (0-1)
  SUCCESS: 0,
  EXEC_FAILURE: 1,

  // @esta-core独自の終了コード (11-99)
  CONFIG_ERROR: 11,
  COMMAND_EXECUTION_ERROR: 12,
  INVALID_ARGS: 13,
  VALIDATION_FAILED: 14,
  FILE_IO_ERROR: 15,
  INTERNAL_LOGIC_ERROR: 16,
  UNKNOWN_ERROR: 99,

  // システム終了コード (124)
  TIMEOUT: 124,
} as const;

export type TExitCode = typeof EXIT_CODE[keyof typeof EXIT_CODE];

/**
 * 終了コードに対応するエラーメッセージ定義
 */
export const EXIT_CODE_ERROR_MESSAGE = {
  // 標準終了コード (0-1)
  [EXIT_CODE.SUCCESS]: 'Operation completed successfully',
  [EXIT_CODE.EXEC_FAILURE]: 'General execution failure',

  // @esta-core独自の終了コード (11-99)
  [EXIT_CODE.CONFIG_ERROR]: 'Configuration Error',
  [EXIT_CODE.COMMAND_EXECUTION_ERROR]: 'Command execution failed',
  [EXIT_CODE.INVALID_ARGS]: 'Invalid command line arguments',
  [EXIT_CODE.VALIDATION_FAILED]: 'Input validation failed',
  [EXIT_CODE.FILE_IO_ERROR]: 'File I/O operation failed',
  [EXIT_CODE.INTERNAL_LOGIC_ERROR]: 'Internal logic error occurred',
  [EXIT_CODE.UNKNOWN_ERROR]: 'Unknown error',

  // システム終了コード (124)
  [EXIT_CODE.TIMEOUT]: 'Command execution timed out',
} as const;
