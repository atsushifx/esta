// src: ./__tests__/errorSeverity.spec.ts
// @(#): ERROR_SEVERITYテーブルとTErrorSeverity型テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { ERROR_SEVERITY } from '../../../shared/constants/errorSeverity';
import type { TErrorSeverity } from '../../../shared/constants/errorSeverity';

describe('ERROR_SEVERITY', () => {
  it('should have all required severity levels', () => {
    expect(ERROR_SEVERITY.FATAL).toBe('fatal');
    expect(ERROR_SEVERITY.ERROR).toBe('error');
    expect(ERROR_SEVERITY.WARNING).toBe('warning');
    expect(ERROR_SEVERITY.INFO).toBe('info');
  });

  it('should derive TErrorSeverity type correctly', () => {
    const testSeverity: TErrorSeverity = 'error';

    expect(testSeverity).toBe('error');
    expect(['fatal', 'error', 'warning', 'info']).toContain(testSeverity);
  });
});
