import { AgLogLevelCode, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';
import { EXIT_CODE } from '@shared/constants';
import type { TExitCode } from '@shared/constants';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExitError } from '../../src/error/ExitError';
import { fatalExit } from '../../src/fatalExit';

describe('fatalExit E2E Tests', () => {
  let mockLogger: E2eMockLogger;

  beforeEach(() => {
    mockLogger = new E2eMockLogger();
    const logger = getLogger();
    logger.setLogLevel(AgLogLevelCode.FATAL);
    logger.setLogger({
      defaultLogger: mockLogger.fatal.bind(mockLogger),
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

  describe('致命的エラーログ出力とExitError例外の統合テスト', () => {
    it('デフォルトのエラーコードで致命的エラーログを出力し、ExitErrorを投げる', () => {
      const testMessage = 'Critical system failure';

      expect(() => fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(1)] General execution failure: Critical system failure in');
      expect(logMessage).toMatch(/in \w+/);

      try {
        fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(EXIT_CODE.EXEC_FAILURE);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('指定されたエラーコードで致命的エラーログを出力し、ExitErrorを投げる', () => {
      const testCode = EXIT_CODE.INVALID_ARGS;
      const testMessage = 'Invalid configuration file';

      expect(() => fatalExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(13)] Invalid command line arguments: Invalid configuration file in');
      expect(logMessage).toMatch(/in \w+/);

      try {
        fatalExit(testCode, testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(testCode);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('未定義のエラーコードでも致命的エラーログを出力し、ExitErrorを投げる', () => {
      const testCode = 999 as TExitCode;
      const testMessage = 'Unknown critical error';

      expect(() => fatalExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(999)] Unknown error: Unknown critical error in');
      expect(logMessage).toMatch(/in \w+/);

      try {
        fatalExit(testCode, testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(testCode);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('複数回呼び出しでも正常に動作する', () => {
      const testCases = [
        { code: EXIT_CODE.INVALID_ARGS, message: 'First fatal error' },
        { code: EXIT_CODE.EXEC_FAILURE, message: 'Second fatal error' },
        { code: EXIT_CODE.FILE_IO_ERROR, message: 'Third fatal error' },
      ];

      testCases.forEach(({ code, message }) => {
        expect(() => fatalExit(code, message)).toThrow(ExitError);
      });

      const fatalMessages = mockLogger.getMessages(AgLogLevelCode.FATAL);
      expect(fatalMessages).toHaveLength(3);
      expect(fatalMessages[0]).toContain('[FATAL(13)] Invalid command line arguments: First fatal error in');
      expect(fatalMessages[1]).toContain('[FATAL(1)] General execution failure: Second fatal error in');
      expect(fatalMessages[2]).toContain('[FATAL(15)] File I/O operation failed: Third fatal error in');
    });

    it('空のメッセージでも正常に動作する', () => {
      const testMessage = '';

      expect(() => fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(1)] General execution failure:');
      expect(logMessage).toMatch(/in \w+/);
    });

    it('長いメッセージでも正常に動作する', () => {
      const testCode = EXIT_CODE.EXEC_FAILURE;
      const testMessage = 'B'.repeat(1000);

      expect(() => fatalExit(testCode, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain(`[FATAL(1)] General execution failure: ${testMessage} in`);
      expect(logMessage).toMatch(/in \w+/);
    });
  });

  describe('agLoggerとの統合テスト', () => {
    it('getLoggerが正しく呼び出される', () => {
      const testMessage = 'Test fatal message';

      expect(() => fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(1)] General execution failure: Test fatal message in');
      expect(logMessage).toMatch(/in \w+/);
    });

    it('logger.fatalが正しいフォーマットで呼び出される', () => {
      const testMessage = 'critical-config.json not found';

      expect(() => fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(1)] General execution failure: critical-config.json not found in');
      expect(logMessage).toMatch(/in \w+/);
    });
  });

  describe('errorExitとの違いの確認', () => {
    it('fatalExitで生成されるExitErrorのisFatalはtrueである', () => {
      const testMessage = 'Test fatal message';

      try {
        fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage);
      } catch (error) {
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('logger.fatalメソッドが使用される（logger.errorではない）', () => {
      const testMessage = 'Test fatal message';

      expect(() => fatalExit(EXIT_CODE.EXEC_FAILURE, testMessage)).toThrow(ExitError);

      const logMessage = mockLogger.getLastMessage(AgLogLevelCode.FATAL);
      expect(logMessage).toContain('[FATAL(1)] General execution failure: Test fatal message in');
      expect(logMessage).toMatch(/in \w+/);
    });
  });
});
