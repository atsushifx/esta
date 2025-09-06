// src: tests/e2e/ErrorReporting.e2e.spec.ts
// @(#) : エラーレポーティングE2E（整形・コード既定・多段連鎖）

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

const toActionFormat = (e: TestAglaError): string => {
  const code = e.toJSON().code ?? 'GA001';
  return `[${code}] ${e.errorType}: ${e.message}`;
};

describe('Error Reporting', () => {
  it('formats chained error with default code when absent', () => {
    const base = new TestAglaError('PIPELINE', 'Step failed');
    const chained = base.chain(new Error('Tool not found'));
    const line = toActionFormat(chained);
    expect(line).toContain('[GA001]');
    expect(line).toContain('PIPELINE');
    expect(line).toContain('Tool not found');
  });

  it('keeps explicit code and severity in JSON report', () => {
    const e = new TestAglaError('DEPLOY', 'Deploy error', { code: 'DEP_01', severity: ErrorSeverity.ERROR });
    const json = e.toJSON();
    expect(json).toHaveProperty('code', 'DEP_01');
    expect(json).toHaveProperty('severity', ErrorSeverity.ERROR);
  });
});
