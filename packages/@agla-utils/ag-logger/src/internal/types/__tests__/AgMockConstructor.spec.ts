// src/internal/types/__tests__/AgMockConstructor.spec.ts
// @(#) : BDD Tests for AgMockConstructor type definitions
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// Import types for testing
import type { AgFormattedLogMessage, AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type {
  AgFormatRoutine,
  AgFormatterInput,
  AgMockConstructor,
} from '../../../../shared/types/AgMockConstructor.class';

/**
 * BDD Tests for AgMockConstructor type system
 * Following atsushifx式BDD with Red-Green-Refactor cycles
 */
describe('Feature: AgMockConstructor type definitions', () => {
  /**
   * Feature: AgFormatRoutine type validation
   */
  describe('AgFormatRoutine: Format routine function type', () => {
    it('should accept AgLogMessage and return AgFormattedLogMessage', () => {
      // This test will fail initially (RED phase)
      const mockMessage: AgLogMessage = {
        logLevel: 4 as AgLogLevel, // AG_LOGLEVEL.INFO
        timestamp: new Date(),
        message: 'test message',
        args: [],
      };

      // AgFormatRoutine should be a function type
      const formatRoutine: AgFormatRoutine = (msg: AgLogMessage): AgFormattedLogMessage => {
        return msg.message;
      };

      const result = formatRoutine(mockMessage);
      expect(result).toBe('test message');
    });

    it('should accept AgLogMessage and throw error when specified', () => {
      const mockMessage: AgLogMessage = {
        logLevel: 2 as AgLogLevel, // AG_LOGLEVEL.ERROR
        timestamp: new Date(),
        message: 'error message',
        args: [],
      };

      const errorRoutine: AgFormatRoutine = (_msg: AgLogMessage): never => {
        throw new Error('Test error');
      };

      expect(() => errorRoutine(mockMessage)).toThrow('Test error');
    });
  });

  /**
   * Feature: AgMockConstructor interface validation
   */
  describe('AgMockConstructor: Mock constructor interface', () => {
    it('should have __isMockConstructor property as true', () => {
      // Mock implementation for testing
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;

        constructor(_routine?: AgFormatRoutine) {}

        execute = (_msg: AgLogMessage): AgFormattedLogMessage => 'test';
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({ callCount: 0, lastMessage: null });
        reset = (): void => {};
      }

      // Type check - should be assignable to AgMockConstructor
      const mockConstructor: AgMockConstructor = TestMockConstructor;
      expect(mockConstructor.__isMockConstructor).toBe(true);
    });

    it('should accept required AgFormatRoutine in constructor', () => {
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;
        private routine: AgFormatRoutine;

        constructor(_routine?: AgFormatRoutine) {
          this.routine = _routine!;
        }

        execute = (msg: AgLogMessage): AgFormattedLogMessage => {
          return this.routine(msg);
        };
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({ callCount: 0, lastMessage: null });
        reset = (): void => {};
      }

      // Type check
      const mockConstructor: AgMockConstructor = TestMockConstructor;

      const customRoutine: AgFormatRoutine = (msg) => `CUSTOM: ${msg.message}`;
      const instance = new mockConstructor(customRoutine);

      const mockMessage: AgLogMessage = {
        logLevel: 4,
        timestamp: new Date(),
        message: 'test',
        args: [],
      };

      expect(instance.execute(mockMessage)).toBe('CUSTOM: test');
    });

    it('should have execute method returning AgFormattedLogMessage', () => {
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;

        constructor(_routine?: AgFormatRoutine) {}

        execute = (msg: AgLogMessage): AgFormattedLogMessage => {
          return `[${msg.logLevel}] ${msg.message}`;
        };
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({ callCount: 0, lastMessage: null });
        reset = (): void => {};
      }

      // Type check
      const mockConstructor: AgMockConstructor = TestMockConstructor;
      const dummyRoutine: AgFormatRoutine = (msg) => msg.message;
      const instance = new mockConstructor(dummyRoutine);

      const mockMessage: AgLogMessage = {
        logLevel: 3, // AG_LOGLEVEL.WARN
        timestamp: new Date(),
        message: 'warning',
        args: [],
      };

      const result = instance.execute(mockMessage);
      expect(result).toBe('[3] warning');
    });

    it('should have getStats method returning statistics object', () => {
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;

        constructor(_routine?: AgFormatRoutine) {}

        execute = (_msg: AgLogMessage): AgFormattedLogMessage => 'test';
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
          callCount: 5,
          lastMessage: { logLevel: 4 as AgLogLevel, timestamp: new Date(), message: 'last', args: [] },
        });
        reset = (): void => {};
      }

      // Type check
      const mockConstructor: AgMockConstructor = TestMockConstructor;
      const dummyRoutine: AgFormatRoutine = (msg) => msg.message;
      const instance = new mockConstructor(dummyRoutine);
      const stats = instance.getStats();

      expect(stats).toHaveProperty('callCount');
      expect(stats).toHaveProperty('lastMessage');
      expect(stats.callCount).toBe(5);
    });

    it('should have reset method for clearing statistics', () => {
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;

        constructor(_routine?: AgFormatRoutine) {}

        execute = (_msg: AgLogMessage): AgFormattedLogMessage => 'test';
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({ callCount: 0, lastMessage: null });
        reset = (): void => {/* reset implementation */};
      }

      // Type check
      const mockConstructor: AgMockConstructor = TestMockConstructor;
      const dummyRoutine: AgFormatRoutine = (msg) => msg.message;
      const instance = new mockConstructor(dummyRoutine);

      // Should have reset method without error
      expect(() => instance.reset()).not.toThrow();
    });
  });

  /**
   * Feature: AgFormatterInput union type validation
   */
  describe('AgFormatterInput: Formatter input union type', () => {
    it('should accept AgFormatFunction as valid input', () => {
      const formatFunction: AgFormatterInput = (msg: AgLogMessage): AgFormattedLogMessage => {
        return msg.message;
      };

      const mockMessage: AgLogMessage = {
        logLevel: 4,
        timestamp: new Date(),
        message: 'test function',
        args: [],
      };

      // AgFormatterInput should work as function
      if (typeof formatFunction === 'function') {
        const result = formatFunction(mockMessage);
        expect(result).toBe('test function');
      }
    });

    it('should accept AgMockConstructor as valid input', () => {
      class TestMockConstructor {
        static readonly __isMockConstructor = true as const;

        constructor(_routine?: AgFormatRoutine) {}

        execute = (msg: AgLogMessage): AgFormattedLogMessage => msg.message;
        getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({ callCount: 0, lastMessage: null });
        reset = (): void => {};
      }

      // AgFormatterInput should accept AgMockConstructor
      const formatterInput: AgFormatterInput = TestMockConstructor;

      // Type guard to check if it's a mock constructor
      if ('__isMockConstructor' in formatterInput) {
        expect(formatterInput.__isMockConstructor).toBe(true);
      }
    });
  });

  /**
   * Feature: Type compatibility validation
   */
  describe('Type compatibility: Integration with existing types', () => {
    it('should work with existing AgLogMessage type', () => {
      const mockMessage: AgLogMessage = {
        logLevel: 4,
        timestamp: new Date(),
        message: 'compatibility test',
        args: [{ key: 'value' }],
      };

      const routine: AgFormatRoutine = (msg: AgLogMessage): string => {
        return `${msg.message} - args: ${msg.args.length}`;
      };

      const result = routine(mockMessage);
      expect(result).toBe('compatibility test - args: 1');
    });

    it('should work with existing AgFormattedLogMessage type', () => {
      // Test string return
      const stringRoutine: AgFormatRoutine = (_msg: AgLogMessage): string => 'string result';

      // Test AgLogMessage return
      const objectRoutine: AgFormatRoutine = (msg: AgLogMessage): AgLogMessage => msg;

      const mockMessage: AgLogMessage = {
        logLevel: 4,
        timestamp: new Date(),
        message: 'test',
        args: [],
      };

      expect(stringRoutine(mockMessage)).toBe('string result');
      expect(objectRoutine(mockMessage)).toEqual(mockMessage);
    });
  });
});
