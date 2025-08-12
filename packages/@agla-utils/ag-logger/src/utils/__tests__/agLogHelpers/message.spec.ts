// src/utils/__tests__/agLogHelpers/message.spec.ts
// @(#) : extractMessage and argsToString message processing functions BDD tests following atsushifx-style BDD

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { argsToString, extractMessage } from '../../AgLogHelpers';

describe('AgLogHelpers: Message Processing Functions', () => {
  describe('extractMessage: Extract message from arguments', () => {
    describe('正常系: Valid argument processing', () => {
      describe('Empty arguments', () => {
        it('should return empty string when no arguments provided', () => {
          const result = extractMessage([]);

          expect(result).toBe('');
        });
      });

      describe('Primitive argument handling', () => {
        it('should extract and join string arguments with spaces', () => {
          const result = extractMessage(['hello', 'world']);

          expect(result).toBe('hello world');
        });

        it('should extract and convert number arguments to strings', () => {
          const result = extractMessage([42, 3.14]);

          expect(result).toBe('42 3.14');
        });

        it('should extract and convert boolean arguments to strings', () => {
          const result = extractMessage([true, false]);

          expect(result).toBe('true false');
        });

        it('should handle mixed primitive types correctly', () => {
          const result = extractMessage(['test', 123, true, 'end']);

          expect(result).toBe('test 123 true end');
        });
      });

      describe('Symbol handling', () => {
        it('should include symbol arguments in message', () => {
          const sym = Symbol('test');
          const result = extractMessage(['start', sym, 'end']);

          expect(result).toBe(`start ${sym.toString()} end`);
        });

        it('should handle multiple symbols correctly', () => {
          const sym1 = Symbol('first');
          const sym2 = Symbol.for('second');
          const result = extractMessage([sym1, sym2]);

          expect(result).toBe(`${sym1.toString()} ${sym2.toString()}`);
        });
      });
    });

    describe('異常系: Complex argument filtering', () => {
      describe('Object filtering', () => {
        it('should filter out object arguments from message', () => {
          const result = extractMessage(['hello', { key: 'value' }, 'world']);

          expect(result).toBe('hello world');
        });

        it('should filter out array arguments from message', () => {
          const result = extractMessage(['start', [1, 2, 3], 'end']);

          expect(result).toBe('start end');
        });

        it('should filter out nested objects', () => {
          const result = extractMessage(['begin', { nested: { deep: 'value' } }, 'finish']);

          expect(result).toBe('begin finish');
        });
      });

      describe('Function filtering', () => {
        it('should filter out function arguments from message', () => {
          const mockFn = (): string => 'test';
          const result = extractMessage(['begin', mockFn, 'finish']);

          expect(result).toBe('begin finish');
        });

        it('should filter out arrow functions', () => {
          const arrowFn = (): string => 'arrow';
          const result = extractMessage(['start', arrowFn, 'end']);

          expect(result).toBe('start end');
        });

        it('should filter out built-in functions', () => {
          const result = extractMessage(['before', console.log, 'after']);

          expect(result).toBe('before after');
        });
      });

      describe('Null and undefined handling', () => {
        it('should filter out null arguments', () => {
          const result = extractMessage(['hello', null, 'world']);

          expect(result).toBe('hello world');
        });

        it('should filter out undefined arguments', () => {
          const result = extractMessage(['start', undefined, 'end']);

          expect(result).toBe('start end');
        });
      });
    });

    describe('エッジケース: Edge cases and special scenarios', () => {
      describe('Whitespace handling', () => {
        it('should preserve internal spaces but trim final result', () => {
          const result = extractMessage(['  hello  ', '  world  ']);

          expect(result).toBe('hello     world');
        });

        it('should handle only whitespace strings', () => {
          const result = extractMessage(['   ', '\t\t', '\n\n']);

          expect(result).toBe('');
        });
      });

      describe('Mixed argument types', () => {
        it('should handle mixed valid and invalid arguments', () => {
          const result = extractMessage([
            'start',
            { object: true },
            123,
            [1, 2, 3],
            'middle',
            () => 'func',
            true,
            'end',
          ]);

          expect(result).toBe('start 123 middle true end');
        });

        it('should handle all filtered arguments', () => {
          const result = extractMessage([
            { only: 'objects' },
            [1, 2, 3],
            () => 'functions',
            null,
            undefined,
          ]);

          expect(result).toBe('');
        });
      });

      describe('Special number values', () => {
        it('should handle special numeric values', () => {
          const result = extractMessage([NaN, Infinity, -Infinity, 0, -0]);

          expect(result).toBe('NaN Infinity -Infinity 0 0');
        });
      });
    });
  });

  describe('argsToString: Convert arguments to string', () => {
    describe('正常系: Valid string conversion', () => {
      describe('Empty arguments', () => {
        it('should return empty string for empty array', () => {
          const result = argsToString([]);

          expect(result).toBe('');
        });
      });

      describe('JSON-stringifiable arguments', () => {
        it('should use JSON.stringify for simple objects', () => {
          const result = argsToString([{ key: 'value' }]);

          expect(result).toBe('{"key":"value"}');
        });

        it('should use JSON.stringify for arrays', () => {
          const result = argsToString([[1, 2, 3]]);

          expect(result).toBe('[1,2,3]');
        });

        it('should use JSON.stringify for primitives', () => {
          const result = argsToString(['test', 42, true]);

          expect(result).toBe('"test" 42 true');
        });

        it('should handle nested objects correctly', () => {
          const result = argsToString([{ outer: { inner: 'value' } }]);

          expect(result).toBe('{"outer":{"inner":"value"}}');
        });
      });

      describe('Multiple argument handling', () => {
        it('should join multiple arguments with spaces', () => {
          const result = argsToString(['hello', 123, { key: 'value' }]);

          expect(result).toBe('"hello" 123 {"key":"value"}');
        });

        it('should handle complex mixed arguments', () => {
          const result = argsToString([
            'string',
            42,
            true,
            null,
            { obj: 'value' },
            [1, 2, 3],
          ]);

          expect(result).toBe('"string" 42 true null {"obj":"value"} [1,2,3]');
        });
      });
    });

    describe('異常系: Non-JSON-stringifiable arguments', () => {
      describe('Function argument handling', () => {
        it('should fall back to valueToString for functions', () => {
          const result = argsToString([() => 'test']);

          expect(result).toBe('function');
        });

        it('should handle named functions correctly', () => {
          const namedFn = function testFunction(): void {};
          const result = argsToString([namedFn]);

          expect(result).toBe('function testFunction');
        });

        it('should handle built-in functions', () => {
          const result = argsToString([console.log]);

          expect(result).toBe('function log');
        });
      });

      describe('Undefined handling', () => {
        it('should fall back to valueToString for undefined', () => {
          const result = argsToString([undefined]);

          expect(result).toBe('undefined');
        });

        it('should handle undefined in mixed arguments', () => {
          const result = argsToString(['start', undefined, 'end']);

          expect(result).toBe('"start" undefined "end"');
        });
      });

      describe('Symbol handling', () => {
        it('should fall back to valueToString for symbols', () => {
          const sym = Symbol('test');
          const result = argsToString([sym]);

          expect(result).toBe(sym.toString());
        });
      });
    });

    describe('エッジケース: Edge cases and special scenarios', () => {
      describe('Mixed JSON and non-JSON arguments', () => {
        it('should handle mixed JSON-stringifiable and non-stringifiable values', () => {
          const fn = (): void => {};
          const result = argsToString(['hello', 42, fn, { key: 'value' }]);

          expect(result).toBe('"hello" 42 function fn {"key":"value"}');
        });

        it('should handle complex mixed scenarios', () => {
          const namedFn = function testFunc(): string {
            return 'test';
          };
          const result = argsToString([
            'string',
            123,
            namedFn,
            { obj: true },
            undefined,
            null,
            [1, 2, 3],
          ]);

          expect(result).toBe('"string" 123 function testFunc {"obj":true} undefined null [1,2,3]');
        });
      });

      describe('Whitespace handling', () => {
        it('should handle arguments with whitespace', () => {
          const result = argsToString(['  start  ', '  end  ']);

          expect(result).toBe('"  start  " "  end  "');
        });

        it('should trim final result but preserve argument formatting', () => {
          const result = argsToString([' test ', 123]);

          expect(result).toBe('" test " 123');
        });
      });

      describe('Special values', () => {
        it('should handle special numeric values correctly', () => {
          const result = argsToString([NaN, Infinity, -Infinity]);

          expect(result).toBe('null null null');
        });

        it('should handle Date objects', () => {
          const date = new Date('2025-01-01T00:00:00.000Z');
          const result = argsToString([date]);

          expect(result).toBe(JSON.stringify(date));
        });
      });
    });
  });
});
