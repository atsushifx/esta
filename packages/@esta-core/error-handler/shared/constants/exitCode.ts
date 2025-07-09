// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * POSIX準拠の終了コード定義
 * 詳細は docs/detailed-design/exit-codes.md を参照
 */
export const ExitCode = {
  // 標準終了コード (0-1)
  SUCCESS: 0,
  EXEC_FAILURE: 1,

  // @esta-core独自の終了コード (11-99)
  CONFIG_NOT_FOUND: 11,
  COMMAND_EXECUTION_ERROR: 12,
  INVALID_ARGS: 13,
  VALIDATION_FAILED: 14,
  FILE_IO_ERROR: 15,
  INTERNAL_LOGIC_ERROR: 16,
  UNKNOWN_ERROR: 99,
} as const;

export type TExitCode = typeof ExitCode[keyof typeof ExitCode];

/**
 * 終了コードに対応するエラーメッセージ定義
 */
export const ExitCodeErrorMessage = {
  // 標準終了コード (0-1)
  [ExitCode.SUCCESS]: 'Operation completed successfully',
  [ExitCode.EXEC_FAILURE]: 'General execution failure',

  // @esta-core独自の終了コード (11-99)
  [ExitCode.CONFIG_NOT_FOUND]: 'Configuration file not found',
  [ExitCode.COMMAND_EXECUTION_ERROR]: 'Command execution failed',
  [ExitCode.INVALID_ARGS]: 'Invalid command line arguments',
  [ExitCode.VALIDATION_FAILED]: 'Input validation failed',
  [ExitCode.FILE_IO_ERROR]: 'File I/O operation failed',
  [ExitCode.INTERNAL_LOGIC_ERROR]: 'Internal logic error occurred',
  [ExitCode.UNKNOWN_ERROR]: 'Unknown error (exit code: ##)',
} as const;
