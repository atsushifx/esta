// src/runCommand.ts
// @(#) : コマンド実行ユーチE��リチE��
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { getPlatform } from '@esta-utils/get-platform';
import type { PLATFORM_TYPE } from '@esta-utils/get-platform';
import { EXIT_CODE } from '@shared/constants';
import { spawn } from 'child_process';
import { PLATFORM_SHELL_MAP } from '../shared/constants/shell';

/**
 * 引数を適刁E��エスケープしてコマンドラインを作�Eする
 * @param command - 実行するコマンド名
 * @param args - コマンド�E引数配�E
 * @returns エスケープされたコマンドライン斁E���E
 */
export const createCommandLine = (command: string, args: string[]): string => {
  const quotedArgs = args.map((arg) => `"${arg}"`);
  const commandLine = [command, ...quotedArgs].join(' ');

  // 安�Eのためコマンドライン全体をバッククォートで囲む
  return `\`${commandLine}\``;
};

/**
 * プラチE��フォームに応じてコマンドを実行すめE * @param command - 実行するコマンド名
 * @param args - コマンド�E引数配�E
 * @param platform - プラチE��フォーム�E�省略時�E自動検�E、主にチE��ト用�E�E * @param timeoutMs - タイムアウト時間（ミリ秒）。デフォルチE 10000ms (10私E
 * @returns コマンド�E実行結果�E��E功時は0、失敗時は0以外！E */
export const runCommand = (
  command: string,
  args: string[] = [],
  platform: PLATFORM_TYPE = getPlatform(),
  timeoutMs: number = 10_000, // デフォルトタイムアウト: 10秒 (10000ミリ秒)
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
      resolveOnce(code ?? EXIT_CODE.EXEC_FAILURE);
    });

    cmd.on('error', () => {
      resolveOnce(EXIT_CODE.EXEC_FAILURE);
    });

    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        cmd.kill('SIGTERM');
        resolveOnce(EXIT_CODE.TIMEOUT);
      }, timeoutMs);
    }
  });

export default runCommand;
