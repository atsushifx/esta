// src:// ./src/utils/commandExist.ts
// @(#) : コマンドの存在を確認するユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs

// main
import { spawn } from 'child_process';

import { getPlatform } from '@esta-utils/get-platform';

const existWhenWindows = (command: string): Promise<boolean> =>
  new Promise((resolve) => {
    const cmd = spawn('cmd', ['/c', `where ${command}`], { stdio: 'ignore' });

    cmd.on('close', (code) => {
      resolve(code === 0);
    });

    cmd.on('error', () => {
      resolve(false);
    });
  });

const existWhenLinux = (command: string): Promise<boolean> =>
  new Promise((resolve) => {
    const cmd = spawn('sh', ['-c', `command -v ${command}`], { stdio: 'ignore' });

    cmd.on('close', (code) => {
      resolve(code === 0);
    });

    cmd.on('error', () => {
      resolve(false);
    });
  });

export const commandExist = async (command: string): Promise<boolean> => {
  const platform = getPlatform();
  if (platform === 'windows') {
    return existWhenWindows(command);
  } else {
    return existWhenLinux(command);
  }
};

export default commandExist;
