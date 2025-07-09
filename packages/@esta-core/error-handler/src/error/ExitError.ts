import type { TExitCode } from '@shared/constants/exitCode';

export class ExitError extends Error {
  readonly code: TExitCode;
  readonly fatal: boolean;

  constructor(code: TExitCode, message: string, fatal = false) {
    super(message);
    this.name = 'ExitError';
    this.code = code;
    this.fatal = fatal;
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExitError);
    }
  }

  isFatal(): boolean {
    return this.fatal;
  }
}
