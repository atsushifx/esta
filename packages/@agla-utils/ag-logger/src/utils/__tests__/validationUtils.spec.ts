import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types/LogLevel.types';
import { validateLogLevel } from '../validationUtils';

import type { AgLogLevel } from '../../../shared/types/LogLevel.types';

describe('validateLogLevel', () => {
  it('should accept valid log level OFF', () => {
    expect(() => validateLogLevel(AG_LOGLEVEL.OFF)).not.toThrow();
  });

  it('should accept valid log level TRACE', () => {
    expect(() => validateLogLevel(AG_LOGLEVEL.TRACE)).not.toThrow();
  });

  it('should accept valid log level FATAL', () => {
    expect(() => validateLogLevel(AG_LOGLEVEL.FATAL)).not.toThrow();
  });

  it('should throw error for string input', () => {
    // Red: This test should fail initially as string validation is not implemented yet
    expect(() => validateLogLevel('invalid' as unknown as AgLogLevel)).toThrow('Invalid log level specified');
  });
});
