import { AgLogger } from '@/AgLogger.class';
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';
import type { TestContext } from 'vitest';

/**
 * Setup E2E mock logger with automatic test lifecycle management and AgLogger reset
 * @param identifier - Test identifier for the mock logger
 * @param ctx - Vitest test context for cleanup registration
 * @returns Configured E2eMockLogger instance
 */
export const setupE2eMockLogger = (identifier: string, ctx: TestContext): E2eMockLogger => {
  const mockLogger = new E2eMockLogger(identifier);

  // startTest前にリセット - テスト開始前にクリーンな状態にする
  AgLogger.resetSingleton();
  mockLogger.startTest(ctx.task.id);

  ctx.onTestFinished(() => {
    mockLogger.endTest();
    // endTest後にリセット - テスト終了後にクリーンアップ
    AgLogger.resetSingleton();
  });

  return mockLogger;
};
