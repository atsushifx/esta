import { AgLogLevelCode, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';
import { ExitCode } from '@shared/constants/exitCode';
import type { TExitCode } from '@shared/constants/exitCode';
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

      expect(() => fatalExit(testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        '[FATAL] General execution failure: Critical system failure',
      );

      try {
        fatalExit(testMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(ExitCode.EXEC_FAILURE);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('指定されたエラーコードで致命的エラーログを出力し、ExitErrorを投げる', () => {
      const testCode = ExitCode.INVALID_ARGS;
      const testMessage = 'Invalid configuration file';

      expect(() => fatalExit(testMessage, testCode)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        '[FATAL] Invalid command line arguments: Invalid configuration file',
      );

      try {
        fatalExit(testMessage, testCode);
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

      expect(() => fatalExit(testMessage, testCode)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        '[FATAL] Unknown error (exit code: 999): Unknown critical error',
      );

      try {
        fatalExit(testMessage, testCode);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect((error as ExitError).code).toBe(testCode);
        expect((error as ExitError).message).toBe(testMessage);
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('複数回呼び出しでも正常に動作する', () => {
      const testCases = [
        { code: ExitCode.INVALID_ARGS, message: 'First fatal error' },
        { code: ExitCode.EXEC_FAILURE, message: 'Second fatal error' },
        { code: ExitCode.FILE_IO_ERROR, message: 'Third fatal error' },
      ];

      testCases.forEach(({ code, message }) => {
        expect(() => fatalExit(message, code)).toThrow(ExitError);
      });

      const fatalMessages = mockLogger.getMessages(AgLogLevelCode.FATAL);
      expect(fatalMessages).toHaveLength(3);
      expect(fatalMessages[0]).toContain('[FATAL] Invalid command line arguments: First fatal error');
      expect(fatalMessages[1]).toContain('[FATAL] General execution failure: Second fatal error');
      expect(fatalMessages[2]).toContain('[FATAL] File I/O operation failed: Third fatal error');
    });

    it('空のメッセージでも正常に動作する', () => {
      const testMessage = '';

      expect(() => fatalExit(testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain('[FATAL] General execution failure:');
    });

    it('長いメッセージでも正常に動作する', () => {
      const testCode = ExitCode.EXEC_FAILURE;
      const testMessage = 'B'.repeat(1000);

      expect(() => fatalExit(testMessage, testCode)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        `[FATAL] General execution failure: ${testMessage}`,
      );
    });
  });

  describe('agLoggerとの統合テスト', () => {
    it('getLoggerが正しく呼び出される', () => {
      const testMessage = 'Test fatal message';

      expect(() => fatalExit(testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        '[FATAL] General execution failure: Test fatal message',
      );
    });

    it('logger.fatalが正しいフォーマットで呼び出される', () => {
      const testMessage = 'critical-config.json not found';

      expect(() => fatalExit(testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        '[FATAL] General execution failure: critical-config.json not found',
      );
    });
  });

  describe('errorExitとの違いの確認', () => {
    it('fatalExitで生成されるExitErrorのisFatalはtrueである', () => {
      const testMessage = 'Test fatal message';

      try {
        fatalExit(testMessage);
      } catch (error) {
        expect((error as ExitError).isFatal()).toBe(true);
      }
    });

    it('logger.fatalメソッドが使用される（logger.errorではない）', () => {
      const testMessage = 'Test fatal message';

      expect(() => fatalExit(testMessage)).toThrow(ExitError);

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toContain(
        '[FATAL] General execution failure: Test fatal message',
      );
    });
  });
});
