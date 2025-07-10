import * as core from '@actions/core';
import { estaFeatures, TEstaExecutionMode } from '@esta-core/feature-flags';
import type { ExitError } from './error/ExitError';

export const handleExitError = (err: ExitError): void => {
  const prefix = err.isFatal() ? 'FATAL' : 'ERROR';
  const message = `[${prefix} ${err.code}] ${err.message}`;

  if (estaFeatures.executionMode === TEstaExecutionMode.GITHUB_ACTIONS) {
    core.setFailed(message);
  } else {
    process.exit(err.code);
  }
};
