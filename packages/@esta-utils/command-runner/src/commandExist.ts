// src: packages/@esta-utils/command-utils/src/commandExist.ts
// @(#) : command existence checking utility
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { getPlatform, PLATFORM_TYPE } from '@esta-utils/get-platform';
import { ExitCode } from '@shared/constants';
import { runCommand } from './runCommand';

export const commandExist = async (command: string): Promise<boolean> => {
  const platform = getPlatform();
  const checkCommand = platform === PLATFORM_TYPE.WINDOWS ? 'where' : 'command';
  const checkArgs = platform === PLATFORM_TYPE.WINDOWS ? [command] : ['-v', command];

  const exitCode = await runCommand(checkCommand, checkArgs, platform);
  return exitCode === ExitCode.SUCCESS;
};

export default commandExist;
