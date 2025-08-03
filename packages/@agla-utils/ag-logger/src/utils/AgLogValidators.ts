// src/utils/AgLogLevelValidators.ts
// @(#) : AgLogger validator functions

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LOGGER_ERROR_CATEGORIES } from 'shared/constants/agLoggerError.constants';
import { AgLoggerError } from 'shared/types/AgLoggerError.types';
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types';

export const isValidLogLevel = (logLevel: AgLogLevel): boolean => {
  return (
    typeof logLevel === 'number'
    && Object.values(AG_LOGLEVEL).includes(logLevel)
  );
};

/**
 * validate log level and throw error if invalid
 */
export const validateLogLevel = (logLevel: AgLogLevel): void => {
  if (!isValidLogLevel(logLevel)) {
    throw new AgLoggerError(AG_LOGGER_ERROR_CATEGORIES.INVALID_LOGGER, `invalid loglevel (${logLevel})`);
  }
};
