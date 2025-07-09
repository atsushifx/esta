import { AgLogLevelCode, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';
import { ExitCode } from '@shared/constants/exitCode';
import type { TExitCode } from '@shared/constants/exitCode';
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

      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toContain(
        '[ERROR] Invalid command line arguments: Invalid argument provided',
      );

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

      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toContain(
        '[ERROR] Unknown error (exit code: 999): Unknown error scenario',
      );

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
      expect(errorMessages[0]).toContain('[ERROR] Invalid command line arguments: First error');
      expect(errorMessages[1]).toContain('[ERROR] General execution failure: Second error');
      expect(errorMessages[2]).toContain('[ERROR] File I/O operation failed: Third error');
    });

    it('空のメッセージでも正常に動作する', () => {
      const testCode = ExitCode.INVALID_ARGS;
      const testMessage = '';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toContain('[ERROR] Invalid command line arguments:');
    });

    it('長いメッセージでも正常に動作する', () => {
      const testCode = ExitCode.EXEC_FAILURE;
      const testMessage = 'A'.repeat(1000);

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toContain(
        `[ERROR] General execution failure: ${testMessage}`,
      );
    });
  });

  describe('agLoggerとの統合テスト', () => {
    it('getLoggerが正しく呼び出される', () => {
      const testCode = ExitCode.INVALID_ARGS;
      const testMessage = 'Test message';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toContain(
        '[ERROR] Invalid command line arguments: Test message',
      );
    });

    it('logger.errorが正しいフォーマットで呼び出される', () => {
      const testCode = ExitCode.FILE_IO_ERROR;
      const testMessage = 'config.json not found';

      expect(() => errorExit(testCode, testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toContain(
        '[ERROR] File I/O operation failed: config.json not found',
      );
    });
  });
});
