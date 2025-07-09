import { getLogger } from '@agla-utils/ag-logger';
import { ExitCode, type TExitCode } from '@shared/constants/exitCode';
import { ExitCodeErrorMessage } from '@shared/constants/exitCode';
import { ExitError } from './error/ExitError';

const getExitCodeMessage = (code: TExitCode): string => {
  return ExitCodeErrorMessage[code] || ExitCodeErrorMessage[ExitCode.UNKNOWN_ERROR].replace('##', code.toString());
};

export const fatalExit = (
  message: string,
  code: TExitCode = ExitCode.EXEC_FAILURE,
): never => {
  const logger = getLogger();
  const defaultMessage = getExitCodeMessage(code);
  logger.fatal(`${defaultMessage}: ${message}`);
  throw new ExitError(code, message, true);
};
