// src/utils/__tests__/AgLogLevelForceOutput.spec.ts
// @(#) : FORCE_OUTPUT log level constant test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// Import constants
import {
  AG_LABEL_TO_LOGLEVEL_MAP,
  AG_LOGLEVEL,
  AG_LOGLEVEL_TO_LABEL_MAP,
} from '../../../shared/types/AgLogLevel.types';

describe('AG_LOGLEVEL FORCE_OUTPUT constant', () => {
  it('should have FORCE_OUTPUT constant with value -98', () => {
    expect(AG_LOGLEVEL.FORCE_OUTPUT).toBe(-98);
  });

  it('should include FORCE_OUTPUT in AG_LABEL_TO_LOGLEVEL_MAP', () => {
    expect(AG_LABEL_TO_LOGLEVEL_MAP['FORCE_OUTPUT']).toBe(-98);
  });

  it('should include -98 in AG_LOGLEVEL_TO_LABEL_MAP mapping to FORCE_OUTPUT', () => {
    expect(AG_LOGLEVEL_TO_LABEL_MAP[-98]).toBe('FORCE_OUTPUT');
  });
});
