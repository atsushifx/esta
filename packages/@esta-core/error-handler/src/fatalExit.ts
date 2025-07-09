import { ExitCode, type TExitCode } from '@shared/constants/exitCode';
import { ExitError } from './error/ExitError';

export const fatalExit = (
  message: string,
  code: TExitCode = ExitCode.EXEC_FAILURE,
): never => {
  throw new ExitError(code, message, true);
};
