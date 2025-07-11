// src/runCommand.ts
// @(#) : コマンド実行ユーティリティ
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { getPlatform } from '@esta-utils/get-platform';
import type { PLATFORM_TYPE } from '@esta-utils/get-platform';
import { spawn } from 'child_process';
import { ExitCode, PLATFORM_SHELL_MAP } from '../shared/constants';

/**
 * 引数を適切にエスケープしてコマンドラインを作成する
 * @param command - 実行するコマンド名
 * @param args - コマンドの引数配列
 * @returns エスケープされたコマンドライン文字列
 */
export const createCommandLine = (command: string, args: string[]): string => {
  const quotedArgs = args.map((arg) => `"${arg}"`);
  const commandLine = [command, ...quotedArgs].join(' ');

  // 安全のためコマンドライン全体をバッククォートで囲む
  return `\`${commandLine}\``;
};

/**
 * プラットフォームに応じてコマンドを実行する
 * @param command - 実行するコマンド名
 * @param args - コマンドの引数配列
 * @param platform - プラットフォーム（省略時は自動検出、主にテスト用）
 * @param timeoutMs - タイムアウト時間（ミリ秒）。デフォルト: 10000ms (10秒)
 * @returns コマンドの実行結果（成功時は0、失敗時は0以外）
 */
export const runCommand = (
  command: string,
  args: string[] = [],
  platform: PLATFORM_TYPE = getPlatform(),
  timeoutMs: number = 10_000, // デフォルト: 10秒
): Promise<number> =>
  new Promise((resolve) => {
    const shellConfig = PLATFORM_SHELL_MAP[platform];
    const commandWithArgs = createCommandLine(command, args);
    const cmd = spawn(shellConfig.shell, [shellConfig.option, commandWithArgs], { stdio: 'ignore' });
    let timeoutHandle: NodeJS.Timeout | null = null;
    let isResolved = false;

    const resolveOnce = (code: number): void => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        resolve(code);
      }
    };

    cmd.on('close', (code) => {
      resolveOnce(code ?? ExitCode.EXEC_FAILURE);
    });

    cmd.on('error', () => {
      resolveOnce(ExitCode.EXEC_FAILURE);
    });

    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        cmd.kill('SIGTERM');
        resolveOnce(ExitCode.TIMEOUT);
      }, timeoutMs);
    }
  });

export default runCommand;
