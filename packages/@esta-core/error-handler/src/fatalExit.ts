import { ExitCode, type TExitCode } from '@shared/constants/exitCode';
import { ExitCodeErrorMessage } from '@shared/constants/exitCode';
import { ExitError } from './error/ExitError';

export const fatalExit = (
  message: string,
  code: TExitCode = ExitCode.EXEC_FAILURE,
): never => {
  const defaultMessage = ExitCodeErrorMessage[code] || `Unknown error (exit code: ${code})`;
  console.error(`Fatal Error: ${defaultMessage}`);
  console.error(`Message: ${message}`);
  throw new ExitError(code, message, true);
};
