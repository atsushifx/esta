import { AgLogLevelCode, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';
import { EXIT_CODE } from '@shared/constants';
import type { TExitCode } from '@shared/constants';
import { describe, expect, it } from 'vitest';
import { ExitError } from '../../src/error/ExitError';
import { errorExit } from '../../src/errorExit';

type TestContext = {
  mockLogger: E2eMockLogger;
};

const setupMockLogger = (): E2eMockLogger => {
  const mockLogger = new E2eMockLogger();
  const logger = getLogger();
  logger.setLogLevel(AgLogLevelCode.ERROR);
  logger.setLogger({
    defaultLogger: mockLogger.error.bind(mockLogger),
    formatter: PlainFormat,
    loggerMap: {
      [AgLogLevelCode.FATAL]: mockLogger.fatal.bind(mockLogger),
      [AgLogLevelCode.ERROR]: mockLogger.error.bind(mockLogger),
      [AgLogLevelCode.WARN]: mockLogger.warn.bind(mockLogger),
      [AgLogLevelCode.INFO]: mockLogger.info.bind(mockLogger),
      [AgLogLevelCode.DEBUG]: mockLogger.debug.bind(mockLogger),
      [AgLogLevelCode.TRACE]: mockLogger.trace.bind(mockLogger),
    },
  });
  return mockLogger;
};

describe('errorExit E2E Tests', () => {
  describe('エラーログ出力とExitError例外の統合テスト', () => {
    it<TestContext>('正常なエラーコードでエラーログを出力し、ExitErrorを投げる', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCode = EXIT_CODE.INVALID_ARGS;
      const testMessage = 'Invalid argument provided';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = ctx.mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(13)] Invalid command line arguments: Invalid argument provided in');
      expect(logMessage).toMatch(/in \w+/);

      try {
        errorExit(testCode, testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(testCode);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(false);
      }
    });

    it<TestContext>('未定義のエラーコードでもエラーログを出力し、ExitErrorを投げる', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCode = 999 as TExitCode;
      const testMessage = 'Unknown error scenario';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = ctx.mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(999)] Unknown error: Unknown error scenario in');
      expect(logMessage).toMatch(/in \w+/);

      try {
        errorExit(testCode, testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(testCode);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(false);
      }
    });

    it<TestContext>('複数回呼び出しでも正常に動作する', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCases = [
        { code: EXIT_CODE.INVALID_ARGS, message: 'First error' },
        { code: EXIT_CODE.EXEC_FAILURE, message: 'Second error' },
        { code: EXIT_CODE.FILE_IO_ERROR, message: 'Third error' },
      ];

      testCases.forEach(({ code, message }) => {
        expect(() => errorExit(code, message)).toThrow(ExitError);
      });

      const errorMessages = ctx.mockLogger.getMessages(AgLogLevelCode.ERROR);
      expect(errorMessages.length).toBeGreaterThanOrEqual(3);

      const relevantMessages = errorMessages.filter((msg) =>
        msg.includes('First error') || msg.includes('Second error') || msg.includes('Third error')
      );
      expect(relevantMessages).toHaveLength(3);
      expect(relevantMessages[0]).toContain('[ERROR(13)] Invalid command line arguments: First error in');
      expect(relevantMessages[1]).toContain('[ERROR(1)] General execution failure: Second error in');
      expect(relevantMessages[2]).toContain('[ERROR(15)] File I/O operation failed: Third error in');
    });

    it<TestContext>('空のメッセージでも正常に動作する', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCode = EXIT_CODE.INVALID_ARGS;
      const testMessage = '';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = ctx.mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(13)] Invalid command line arguments:');
      expect(logMessage).toMatch(/in \w+/);
    });

    it<TestContext>('長いメッセージでも正常に動作する', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCode = EXIT_CODE.EXEC_FAILURE;
      const testMessage = 'A'.repeat(1000);

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = ctx.mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain(`[ERROR(1)] General execution failure: ${testMessage} in`);
      expect(logMessage).toMatch(/in \w+/);
    });
  });

  describe('agLoggerとの統合テスト', () => {
    it<TestContext>('getLoggerが正しく呼び出される', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCode = EXIT_CODE.INVALID_ARGS;
      const testMessage = 'Test message';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = ctx.mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(13)] Invalid command line arguments: Test message in');
      expect(logMessage).toMatch(/in \w+/);
    });

    it<TestContext>('logger.errorが正しいフォーマットで呼び出される', (ctx) => {
      ctx.mockLogger = setupMockLogger();

      const testCode = EXIT_CODE.FILE_IO_ERROR;
      const testMessage = 'config.json not found';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = ctx.mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(15)] File I/O operation failed: config.json not found in');
      expect(logMessage).toMatch(/in \w+/);
    });
  });
});
