import { AgLogLevelCode, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';
import { ExitCode } from '@shared/constants';
import type { TExitCode } from '@shared/constants';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExitError } from '../../src/error/ExitError';
import { errorExit } from '../../src/errorExit';

describe('errorExit E2E Tests', () => {
  let mockLogger: E2eMockLogger;

  beforeEach(() => {
    mockLogger = new E2eMockLogger();
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
  });

  describe('エラーログ出力とExitError例外の統合テスト', () => {
    it('正常なエラーコードでエラーログを出力し、ExitErrorを投げる', () => {
      const testCode = ExitCode.INVALID_ARGS;
      const testMessage = 'Invalid argument provided';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(13)] Invalid command line arguments: Invalid argument provided in');
      // 実際の呼び出し元の関数名またはファイル名が含まれることを確認
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

    it('未定義のエラーコードでもエラーログを出力し、ExitErrorを投げる', () => {
      const testCode = 999 as TExitCode;
      const testMessage = 'Unknown error scenario';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.ERROR);
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

    it('複数回呼び出しでも正常に動作する', () => {
      const testCases = [
        { code: ExitCode.INVALID_ARGS, message: 'First error' },
        { code: ExitCode.EXEC_FAILURE, message: 'Second error' },
        { code: ExitCode.FILE_IO_ERROR, message: 'Third error' },
      ];

      testCases.forEach(({ code, message }) => {
        expect(() => errorExit(code, message)).toThrow(ExitError);
      });

      const errorMessages = mockLogger.getMessages(AgLogLevelCode.ERROR);
      expect(errorMessages).toHaveLength(3);
      expect(errorMessages[0]).toContain('[ERROR(13)] Invalid command line arguments: First error in');
      expect(errorMessages[1]).toContain('[ERROR(1)] General execution failure: Second error in');
      expect(errorMessages[2]).toContain('[ERROR(15)] File I/O operation failed: Third error in');
    });

    it('空のメッセージでも正常に動作する', () => {
      const testCode = ExitCode.INVALID_ARGS;
      const testMessage = '';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(13)] Invalid command line arguments:');
      expect(logMessage).toMatch(/in \w+/);
    });

    it('長いメッセージでも正常に動作する', () => {
      const testCode = ExitCode.EXEC_FAILURE;
      const testMessage = 'A'.repeat(1000);

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain(`[ERROR(1)] General execution failure: ${testMessage} in`);
      expect(logMessage).toMatch(/in \w+/);
    });
  });

  describe('agLoggerとの統合テスト', () => {
    it('getLoggerが正しく呼び出される', () => {
      const testCode = ExitCode.INVALID_ARGS;
      const testMessage = 'Test message';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(13)] Invalid command line arguments: Test message in');
      expect(logMessage).toMatch(/in \w+/);
    });

    it('logger.errorが正しいフォーマットで呼び出される', () => {
      const testCode = ExitCode.FILE_IO_ERROR;
      const testMessage = 'config.json not found';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.ERROR);
      expect(logMessage).toContain('[ERROR(15)] File I/O operation failed: config.json not found in');
      expect(logMessage).toMatch(/in \w+/);
    });
  });
});
