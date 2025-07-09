import type { TExitCode } from '@shared/constants/exitCode';
import { ExitCodeErrorMessage } from '@shared/constants/exitCode';
import { ExitError } from './error/ExitError';

export const errorExit = (
  code: TExitCode,
  message: string,
): never => {
  const defaultMessage = ExitCodeErrorMessage[code] || `Unknown error (exit code: ${code})`;
  console.error(`Error: ${defaultMessage}`);
  console.error(`Message: ${message}`);
  throw new ExitError(code, message);
};
