import type { TExitCode } from '@shared/constants/exitCode';
import { ExitError } from './error/ExitError';

export const errorExit = (
  code: TExitCode,
  message: string,
): never => {
  throw new ExitError(code, message);
};
