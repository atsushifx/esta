// src/utils/__tests__/agLogHelpers/utility.spec.ts
// @(#) : valueToString utility function BDD tests following atsushifx-style BDD

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { valueToString } from '../../AgLogHelpers';

describe('AgLogHelpers: Utility Functions', () => {
  describe('valueToString: Convert values to string representation', () => {
    describe('正常系: Valid value conversions', () => {
      describe('Null and undefined values', () => {
        it('should return string representation of null', () => {
          const result = valueToString(null);

          expect(result).toBe('null');
        });

        it('should return string representation of undefined', () => {
          const result = valueToString(undefined);

          expect(result).toBe('undefined');
        });
      });

      describe('Array values', () => {
        it('should return "array" for empty arrays', () => {
          const result = valueToString([]);

          expect(result).toBe('array');
        });

        it('should return bracketed string representation for non-empty arrays', () => {
          const result = valueToString([1, 2, 3]);

          expect(result).toBe('[1,2,3]');
        });

        it('should handle arrays with mixed types', () => {
          const result = valueToString(['a', 1, true]);

          expect(result).toBe('[a,1,true]');
        });

        it('should handle nested arrays', () => {
          const result = valueToString([[1, 2], [3, 4]]);

          expect(result).toBe('[1,2,3,4]');
        });

        it('should handle arrays with null and undefined', () => {
          const result = valueToString([null, undefined, 'test']);

          expect(result).toBe('[,,test]');
        });
      });

      describe('Function values', () => {
        it('should return "function" for anonymous functions', () => {
          const result = valueToString(() => {});

          expect(result).toBe('function');
        });

        it('should return "function name" for named functions', () => {
          const namedFn = function testFunction(): void {};
          const result = valueToString(namedFn);

          expect(result).toBe('function testFunction');
        });

        it('should handle arrow functions with names', () => {
          const arrowFn = (): string => 'arrow';
          const result = valueToString(arrowFn);

          expect(result).toBe('function arrowFn');
        });

        it('should handle built-in functions', () => {
          const result = valueToString(console.log);

          expect(result).toBe('function log');
        });

        it('should handle constructor functions', () => {
          const Constructor = function ConstructorTest(): void {};
          const result = valueToString(Constructor);

          expect(result).toBe('function ConstructorTest');
        });

        it('should handle class constructors', () => {
          class TestClass {}
          const result = valueToString(TestClass);

          expect(result).toBe('function TestClass');
        });

        it('should handle async functions', () => {
          const asyncFn = async function asyncTest(): Promise<void> {};
          const result = valueToString(asyncFn);

          expect(result).toBe('function asyncTest');
        });

        it('should handle generator functions', () => {
          const generatorTest = function* generatorTestFunc(): Generator<number, void, unknown> {
            yield 1;
          };
          const result = valueToString(generatorTest);

          expect(result).toBe('function generatorTestFunc');
        });
      });

      describe('Object values', () => {
        it('should return "object" for plain objects', () => {
          const result = valueToString({ key: 'value' });

          expect(result).toBe('object');
        });

        it('should return "object" for class instances', () => {
          class TestClass {}
          const result = valueToString(new TestClass());

          expect(result).toBe('object');
        });

        it('should return "object" for built-in objects', () => {
          const result = valueToString(new Date());

          expect(result).toBe('object');
        });

        it('should return "object" for RegExp objects', () => {
          const result = valueToString(/test/g);

          expect(result).toBe('object');
        });

        it('should return "object" for Error objects', () => {
          const result = valueToString(new Error('test'));

          expect(result).toBe('object');
        });

        it('should return "object" for Map objects', () => {
          const result = valueToString(new Map());

          expect(result).toBe('object');
        });

        it('should return "object" for Set objects', () => {
          const result = valueToString(new Set());

          expect(result).toBe('object');
        });
      });

      describe('String values', () => {
        it('should return quoted string for string inputs', () => {
          const result = valueToString('test string');

          expect(result).toBe('"test string"');
        });

        it('should return quoted empty string for empty string input', () => {
          const result = valueToString('');

          expect(result).toBe('""');
        });

        it('should handle strings with special characters', () => {
          const result = valueToString('test\nwith\ttabs');

          expect(result).toBe('"test\nwith\ttabs"');
        });

        it('should handle strings with quotes', () => {
          const result = valueToString('test "quoted" string');

          expect(result).toBe('"test "quoted" string"');
        });
      });

      describe('Primitive non-string values', () => {
        it('should return string representation for integers', () => {
          const result = valueToString(42);

          expect(result).toBe('42');
        });

        it('should return string representation for floating-point numbers', () => {
          const result = valueToString(3.14159);

          expect(result).toBe('3.14159');
        });

        it('should return string representation for negative numbers', () => {
          const result = valueToString(-42);

          expect(result).toBe('-42');
        });

        it('should return string representation for zero', () => {
          const result = valueToString(0);

          expect(result).toBe('0');
        });

        it('should return string representation for negative zero', () => {
          const result = valueToString(-0);

          expect(result).toBe('0');
        });

        it('should return string representation for booleans', () => {
          expect(valueToString(true)).toBe('true');
          expect(valueToString(false)).toBe('false');
        });

        it('should return string representation for symbols', () => {
          const sym = Symbol('test');
          const result = valueToString(sym);

          expect(result).toBe('Symbol(test)');
        });

        it('should handle symbols with undefined descriptions', () => {
          const sym = Symbol();
          const result = valueToString(sym);

          expect(result).toBe('Symbol()');
        });

        it('should handle global symbols', () => {
          const sym = Symbol.for('global');
          const result = valueToString(sym);

          expect(result).toBe('Symbol(global)');
        });
      });
    });

    describe('エッジケース: Edge cases and special values', () => {
      describe('Special numeric values', () => {
        it('should handle NaN correctly', () => {
          const result = valueToString(NaN);

          expect(result).toBe('NaN');
        });

        it('should handle Infinity values', () => {
          expect(valueToString(Infinity)).toBe('Infinity');
          expect(valueToString(-Infinity)).toBe('-Infinity');
        });

        it('should handle very large numbers', () => {
          const result = valueToString(Number.MAX_SAFE_INTEGER);

          expect(result).toBe('9007199254740991');
        });

        it('should handle very small numbers', () => {
          const result = valueToString(Number.MIN_VALUE);

          expect(result).toBe('5e-324');
        });
      });

      describe('BigInt values', () => {
        it('should handle BigInt values', () => {
          const result = valueToString(BigInt(123));

          expect(result).toBe('123');
        });
      });

      describe('Complex array scenarios', () => {
        it('should handle arrays with holes', () => {
          const sparseArray = [1, undefined, undefined, 4];
          delete sparseArray[1];
          delete sparseArray[2];
          const result = valueToString(sparseArray);

          expect(result).toBe('[1,,,4]');
        });
      });

      describe('Complex object scenarios', () => {
        it('should handle objects with toString methods', () => {
          const customObj = {
            toString: () => 'custom string representation',
          };
          const result = valueToString(customObj);

          expect(result).toBe('object');
        });

        it('should handle frozen objects', () => {
          const frozenObj = Object.freeze({ frozen: true });
          const result = valueToString(frozenObj);

          expect(result).toBe('object');
        });

        it('should handle sealed objects', () => {
          const sealedObj = Object.seal({ sealed: true });
          const result = valueToString(sealedObj);

          expect(result).toBe('object');
        });
      });

      describe('Typed arrays', () => {
        it('should handle Int8Array', () => {
          const result = valueToString(new Int8Array([1, 2, 3]));

          expect(result).toBe('object');
        });

        it('should handle Float32Array', () => {
          const result = valueToString(new Float32Array([1.1, 2.2, 3.3]));

          expect(result).toBe('object');
        });

        it('should handle Uint8Array', () => {
          const result = valueToString(new Uint8Array([255, 128, 0]));

          expect(result).toBe('object');
        });

        it('should handle ArrayBuffer', () => {
          const result = valueToString(new ArrayBuffer(16));

          expect(result).toBe('object');
        });
      });

      describe('Promise objects', () => {
        it('should handle resolved Promise', () => {
          const promise = Promise.resolve('test');
          const result = valueToString(promise);

          expect(result).toBe('object');
        });

        it('should handle rejected Promise', () => {
          const promise = Promise.reject(new Error('test'));
          promise.catch(() => {}); // Prevent unhandled rejection
          const result = valueToString(promise);

          expect(result).toBe('object');
        });

        it('should handle pending Promise', () => {
          const promise = new Promise(() => {});
          const result = valueToString(promise);

          expect(result).toBe('object');
        });
      });
    });

    describe('一貫性テスト: Consistency tests', () => {
      it('should return consistent results for identical inputs', () => {
        const testCases = [
          null,
          undefined,
          'test',
          123,
          true,
          [],
          [1, 2, 3],
          {},
          { key: 'value' },
          () => {},
          Symbol('test'),
        ];

        testCases.forEach((testCase) => {
          const firstResult = valueToString(testCase);
          for (let i = 0; i < 10; i++) {
            expect(valueToString(testCase)).toBe(firstResult);
          }
        });
      });

      it('should handle type coercion consistently', () => {
        // Test that similar but different types are handled differently
        expect(valueToString('123')).toBe('"123"');
        expect(valueToString(123)).toBe('123');
        expect(valueToString([123])).toBe('[123]');
        expect(valueToString({ 123: 'value' })).toBe('object');
      });
    });
  });
});
