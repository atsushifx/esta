import { getLogger } from '@agla-utils/ag-logger';
import type { TExitCode } from '@shared/constants/exitCode';
import { ExitCode, ExitCodeErrorMessage } from '@shared/constants/exitCode';
import { ExitError } from './error/ExitError';

const getExitCodeMessage = (code: TExitCode): string => {
  return ExitCodeErrorMessage[code] || ExitCodeErrorMessage[ExitCode.UNKNOWN_ERROR].replace('##', code.toString());
};

export const errorExit = (
  code: TExitCode,
  message: string,
): never => {
  const logger = getLogger();
  const defaultMessage = getExitCodeMessage(code);
  logger.error(`${defaultMessage}: ${message}`);
  throw new ExitError(code, message);
};
