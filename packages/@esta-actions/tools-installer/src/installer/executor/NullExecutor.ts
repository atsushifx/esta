// src: ./src/installer/executor/NullExecutor.ts
// @(#) : null executor for unsupported installer types
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgActionInstallerExecutor, AgActionInstallOptions } from '@shared/types';

export class NullExecutor implements AgActionInstallerExecutor {
  public async execute(_options: AgActionInstallOptions): Promise<boolean> {
    console.warn('This installer type is not supported yet.');
    return false;
  }
}

// export
export default NullExecutor;
