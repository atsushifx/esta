// src: /src/plugins/logger/__tests__/ConsoleLogger.spec.ts
// @(#) : ConsoleLogger プラグインユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';

// test unit
import { ConsoleLoggerMap } from '../ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// test main
describe('ConsoleLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  describe('ConsoleLogger Map', () => {
    it('OFF レベルは NullLogger を返す', () => {
      expect(ConsoleLoggerMap[AgLogLevelCode.OFF]).toBeDefined();
      expect(typeof ConsoleLoggerMap[AgLogLevelCode.OFF]).toBe('function');
    });

    it('FATAL レベルでconsole.errorを呼び出す', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.FATAL];
      expect(logFunction).toBeDefined();

      logFunction!('test fatal message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('ERROR レベルでconsole.errorを呼び出す', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.ERROR];
      expect(logFunction).toBeDefined();

      logFunction!('test error message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('WARN レベルでconsole.warnを呼び出す', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.WARN];
      expect(logFunction).toBeDefined();

      logFunction!('test warn message');
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    it('INFO レベルでconsole.infoを呼び出す', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.INFO];
      expect(logFunction).toBeDefined();

      logFunction!('test info message');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('DEBUG レベルでconsole.debugを呼び出す', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.DEBUG];
      expect(logFunction).toBeDefined();

      logFunction!('test debug message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    it('TRACE レベルでconsole.debugを呼び出す', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.TRACE];
      expect(logFunction).toBeDefined();

      logFunction!('test trace message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('複数引数のテスト', () => {
    it('複数の引数を正しく処理する', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.INFO];
      logFunction!('message', 123, { data: 'test' });
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });
  });
});
