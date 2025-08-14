// tests/e2e/plugins/e2e-mock-logger/parallel.e2e.spec.ts
import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL, type AgFormattedLogMessage } from '../../../../shared/types';

describe('E2EMockLogger - 並列実行', () => {
  it('並列テストを干渉なく扱える', async () => {
    const results = await Promise.all([
      simulateParallelTest('t1', 'Message from test 1'),
      simulateParallelTest('t2', 'Message from test 2'),
      simulateParallelTest('t3', 'Message from test 3'),
    ]);
    results.forEach(({ messages }, idx) => {
      expect(messages).toEqual([`Message from test ${idx + 1}`]);
    });
  });
});

const simulateParallelTest = async (
  identifier: string,
  message: string,
): Promise<{ testId: string; messages: AgFormattedLogMessage[] }> => {
  const mock = new E2EMockLoggerWithTestId(identifier);
  const testId = `${identifier}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  try {
    mock.startTest(testId);
    mock.info(message);
    await new Promise((r) => setTimeout(r, Math.random() * 10));
    return { testId, messages: mock.getMessages(AG_LOGLEVEL.INFO) };
  } finally {
    mock.endTest();
  }
};
