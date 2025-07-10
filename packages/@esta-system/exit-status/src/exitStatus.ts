// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ExitCode } from '@esta-core/error-handler';
// index.ts
export class ExitStatus {
  private static _status = 0;

  static set(status: number): void {
    if (status != ExitCode.SUCCESS && status > 0) {
      ExitStatus._status = status;
    }
  }

  static get(): number {
    return ExitStatus._status;
  }

  static reset(): void {
    ExitStatus._status = 0;
  }
}
