// src: ./src/installer/AgActionHandleInstaller.class.ts
// @(#) : installer handler class for managing different executor types
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgActionInstallerExecutor, AgActionInstallerType, AgActionInstallOptions } from '../../shared/types';

export class HandleInstaller {
  constructor(
    private readonly executors: Partial<Record<AgActionInstallerType, AgActionInstallerExecutor>>,
  ) {}

  async handle(type: AgActionInstallerType, options: AgActionInstallOptions): Promise<boolean> {
    const executor = this.executors[type];
    if (!executor) {
      console.warn(`Installer ${type} not supported`);
      return false;
    }
    return await executor.execute(options);
  }

  // optional: getter if needed
  getSupportedTypes(): AgActionInstallerType[] {
    return Object.keys(this.executors) as AgActionInstallerType[];
  }
}
