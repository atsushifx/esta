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
} as const;

export type TExitCode = typeof ExitCode[keyof typeof ExitCode];
