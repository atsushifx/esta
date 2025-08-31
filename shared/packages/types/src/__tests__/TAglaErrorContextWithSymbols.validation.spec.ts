// src: src/__tests__/_TAglaErrorContextWithSymbols.validation.spec.ts
// @(#) : _TAglaErrorContextWithSymbols型テスト専用型のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { _TAglaErrorContextWithSymbols } from './helpers/test-types.types.js';

/**
 * _TAglaErrorContextWithSymbols Test Type Definition Tests
 * Tests type compatibility for _TAglaErrorContextWithSymbols type (R-003-02)
 */
describe('Given _TAglaErrorContextWithSymbols test type definition', () => {
  describe('When creating context with symbol properties', () => {
    it('Then should satisfy _TAglaErrorContextWithSymbols type compatibility', () => {
      // Arrange
      const testSymbol = Symbol.for('test');
      const symbolContext: _TAglaErrorContextWithSymbols = {
        user: 'testUser',
        id: 123,
        [testSymbol]: 'symbolValue',
      };

      // Act & Assert - Type compatibility test as per R-003-02
      expect(symbolContext).toSatisfy((ctx): ctx is _TAglaErrorContextWithSymbols => {
        return typeof ctx === 'object' && ctx !== null
          && Object.getOwnPropertySymbols(ctx).length > 0;
      });

      // Symbol key support validation as per todo.md requirement
      expect(symbolContext[Symbol.for('test')]).toBeDefined();
    });

    it('Then should handle multiple symbol properties', () => {
      // Arrange
      const symbol1 = Symbol('test1');
      const symbol2 = Symbol('test2');
      const multiSymbolContext: _TAglaErrorContextWithSymbols = {
        regularProp: 'value',
        [symbol1]: 'first symbol value',
        [symbol2]: { nested: 'object' },
      };

      // Act & Assert
      expect(multiSymbolContext).toSatisfy((ctx): ctx is _TAglaErrorContextWithSymbols => {
        return typeof ctx === 'object' && ctx !== null
          && Object.getOwnPropertySymbols(ctx).length >= 2;
      });
      expect(Object.getOwnPropertySymbols(multiSymbolContext)).toHaveLength(2);
    });

    it('Then should preserve regular AglaErrorContext properties', () => {
      // Arrange
      const testSymbol = Symbol('preserve-test');
      const mixedContext: _TAglaErrorContextWithSymbols = {
        user: 'testUser',
        sessionId: '12345',
        timestamp: new Date(),
        nested: { deep: { value: 'test' } },
        [testSymbol]: 'symbol data',
      };

      // Act & Assert - Should maintain both regular and symbol properties
      expect(mixedContext.user).toBe('testUser');
      expect(mixedContext.sessionId).toBe('12345');
      expect(mixedContext.timestamp).toBeInstanceOf(Date);
      expect((mixedContext.nested as { deep: { value: string } }).deep.value).toBe('test');
      expect(mixedContext[testSymbol]).toBe('symbol data');
    });

    it('Then should handle well-known symbols', () => {
      // Arrange
      const contextWithWellKnown: _TAglaErrorContextWithSymbols = {
        name: 'test-context',
        [Symbol.toStringTag]: 'CustomContext',
        [Symbol.iterator]: function*() {
          yield 'test';
        },
      };

      // Act & Assert
      expect(contextWithWellKnown[Symbol.toStringTag]).toBe('CustomContext');
      expect(typeof contextWithWellKnown[Symbol.iterator]).toBe('function');
    });
  });

  describe('When validating symbol context structure', () => {
    it('Then should enforce both string and symbol keys', () => {
      // Arrange - This verifies the intersection type works correctly
      const validContext: _TAglaErrorContextWithSymbols = {
        stringKey: 'string value',
        [Symbol('test')]: 'symbol value',
      };

      // Act & Assert - Verify both types of keys exist
      expect(Object.keys(validContext)).toHaveLength(1); // Only string keys
      expect(Object.getOwnPropertySymbols(validContext)).toHaveLength(1); // Symbol keys
    });

    it('Then should support symbol key enumeration', () => {
      // Arrange
      const sym1 = Symbol('first');
      const sym2 = Symbol('second');
      const enumerableContext: _TAglaErrorContextWithSymbols = {
        regular: 'value',
        [sym1]: 'first',
        [sym2]: 'second',
      };

      // Act
      const symbols = Object.getOwnPropertySymbols(enumerableContext);
      const stringKeys = Object.keys(enumerableContext);

      // Assert
      expect(symbols).toHaveLength(2);
      expect(stringKeys).toHaveLength(1);
      expect(stringKeys[0]).toBe('regular');
    });

    it('Then should handle empty symbol context', () => {
      // Arrange - Context with no symbol properties should still be valid
      const noSymbolContext: _TAglaErrorContextWithSymbols = {
        onlyString: 'value',
      };

      // Act & Assert - Should still satisfy the type even without symbols
      expect(noSymbolContext).toSatisfy((ctx): ctx is _TAglaErrorContextWithSymbols => {
        return typeof ctx === 'object' && ctx !== null;
      });
      expect(Object.getOwnPropertySymbols(noSymbolContext)).toHaveLength(0);
    });

    it('Then should support complex symbol values', () => {
      // Arrange
      const complexSymbol = Symbol('complex');
      const complexContext: _TAglaErrorContextWithSymbols = {
        metadata: 'basic',
        [complexSymbol]: {
          nested: {
            array: [1, 2, 3],
            func: () => 'test',
            date: new Date(),
          },
        },
      };

      // Act & Assert
      const symbolValue = complexContext[complexSymbol] as {
        nested: { array: number[]; func: () => string; date: Date };
      };
      expect(symbolValue.nested.array).toEqual([1, 2, 3]);
      expect(typeof symbolValue.nested.func).toBe('function');
      expect(symbolValue.nested.date).toBeInstanceOf(Date);
    });
  });
});
