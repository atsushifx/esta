// src: ./src/installer/executor/EgetInitializer.ts
// @(#) : eGetをインストールするExecutor
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { exec } from 'child_process';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';
import path from 'path';
import { promisify } from 'util';

// internal libs
import { AgActions_DEFAULT_TEMP_DIR, AgDir_WINGET_INSTALL_DIR } from '@shared/constants';
import type { AgActionInstallerExecutor, AgActionInstallOptions } from '@shared/types';

import { commandExist } from '@esta-utils/command-utils';
import { getPlatform, PlatformType } from '@esta-utils/get-platform';
// constants

// internal libs
import { prepareInstallDirectory } from '../../utils/prepareInstallDirectory';

// routine
const run = promisify(exec);

export class EgetInitializer implements AgActionInstallerExecutor {
  public async execute(options: AgActionInstallOptions): Promise<boolean> {
    // already installed eget
    if (await commandExist('eget')) {
      return true;
    }

    // create install directory
    const installDir = await prepareInstallDirectory();
    console.debug('Install directory: ', installDir);

    if (!installDir) {
      return false;
    }

    try {
      const platform = getPlatform();
      if (platform === PlatformType.WINDOWS) {
        await this.installWindows(options, installDir);
      } else {
        await this.installLinux(options, installDir);
      }
      return true;
    } catch (err) {
      console.error('eget installation failed: ', err);
      return false;
    }
  }

  private async installWindows(options: AgActionInstallOptions, installDir: string): Promise<string> {
    // install eget to temp
    const tmpInstallDir = path.join(AgActions_DEFAULT_TEMP_DIR, 'eget');
    await mkdir(installDir, { recursive: true });

    const installCommand =
      `winget install --id=ZacharyYedidia.Eget --accept-package-agreements --accept-source-agreements --location ${tmpInstallDir} --force`;
    await run(installCommand);

    // copy eget form alias to install directory
    const alias = path.join(AgDir_WINGET_INSTALL_DIR, 'eget.exe');
    const targetPath = join(installDir, 'eget.exe');
    await copyFile(alias, targetPath);

    return targetPath;
  }

  private async installLinux(options: AgActionInstallOptions, installDir: string): Promise<string> {
    const targetPath = join(installDir, 'eget');

    const installCommand = `cd ${installDir} && curl -sSf https://zyedidia.github.io/eget.sh | bash`;
    await run(installCommand);
    return targetPath;
  }
}

export default EgetInitializer;
