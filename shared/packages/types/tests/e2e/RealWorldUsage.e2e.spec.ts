// src: tests/e2e/RealWorldUsage.e2e.spec.ts
// @(#) : 実世界利用シナリオ（作成→連鎖→シリアライズ→表示）E2E

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

describe('Real World Usage', () => {
  it('creates, chains, serializes, and prints error', () => {
    const base = new TestAglaError('USER_ACTION_ERROR', 'Failed to process action', {
      code: 'UA_001',
      severity: ErrorSeverity.ERROR,
      context: { user: 'alice', action: 'create-document' },
    });

    const chained = base.chain(new Error('DB unavailable'));
    const json = chained.toJSON();
    const str = chained.toString();

    expect(json).toHaveProperty('errorType', 'USER_ACTION_ERROR');
    expect(json).toHaveProperty('message');
    expect(json).toHaveProperty('code', 'UA_001');
    expect(json).toHaveProperty('severity', ErrorSeverity.ERROR);
    expect(json).toHaveProperty('context');
    expect(str).toContain('USER_ACTION_ERROR');
    expect(str).toContain('DB unavailable');
  });
});
