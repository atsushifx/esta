// src/installer/executor/NotSupportExecutor.ts
// @(#) : 未対応のExecutor
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgActionInstallerExecutor, AgActionInstallOptions } from '@shared/types';

export class NullExecutor implements AgActionInstallerExecutor {
  public async execute(_options: AgActionInstallOptions): Promise<boolean> {
    console.warn('Thins installer type is not supported yet.');
    return false;
  }
}

// export
export default NullExecutor;
