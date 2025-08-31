// src: src/__tests__/AglaErrorContext.validation.spec.ts
// @(#) : AglaErrorContext型バリデーション機能のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaErrorContext } from '../../types/AglaError.types.js';
import { guardAglaErrorContext, isValidAglaErrorContext } from '../../types/AglaError.types.js';

/**
 * AglaErrorContext Type Validation and Guard Tests
 * Red-Green-Refactor: RED phase - テスト先行実装
 */
describe('Given AglaErrorContext validation function', () => {
  describe('When validating valid context objects', () => {
    it('Then should return true for valid AglaErrorContext', () => {
      // Arrange
      const validContext: AglaErrorContext = { user: 'test', id: 123 };

      // Act & Assert - この関数はまだ実装されていないため失敗する
      expect(isValidAglaErrorContext(validContext)).toBe(true);
    });

    it('Then should return true for empty object', () => {
      // Arrange
      const emptyContext: AglaErrorContext = {};

      // Act & Assert
      expect(isValidAglaErrorContext(emptyContext)).toBe(true);
    });
  });

  describe('When validating invalid context objects', () => {
    it('Then should return false for null', () => {
      // Arrange
      const nullContext = null;

      // Act & Assert
      expect(isValidAglaErrorContext(nullContext)).toBe(false);
    });

    it('Then should return false for undefined', () => {
      // Arrange
      const undefinedContext = undefined;

      // Act & Assert
      expect(isValidAglaErrorContext(undefinedContext)).toBe(false);
    });

    it('Then should return false for primitive values', () => {
      // Arrange
      const stringValue = 'not an object';
      const numberValue = 42;
      const booleanValue = true;

      // Act & Assert
      expect(isValidAglaErrorContext(stringValue)).toBe(false);
      expect(isValidAglaErrorContext(numberValue)).toBe(false);
      expect(isValidAglaErrorContext(booleanValue)).toBe(false);
    });
  });
});

describe('Given AglaErrorContext type guard function', () => {
  describe('When using type guard for valid context objects', () => {
    it('Then should return typed context object', () => {
      // Arrange
      const validContext: unknown = { user: 'test', id: 123 };

      // Act & Assert - この関数はまだ実装されていないため失敗する
      const guardedContext = guardAglaErrorContext(validContext);
      expect(typeof guardedContext).toBe('object');
      expect(guardedContext).toEqual({ user: 'test', id: 123 });
    });

    it('Then should handle empty object', () => {
      // Arrange
      const emptyContext: unknown = {};

      // Act & Assert
      const guardedContext = guardAglaErrorContext(emptyContext);
      expect(typeof guardedContext).toBe('object');
      expect(guardedContext).toEqual({});
    });
  });

  describe('When using type guard for invalid context objects', () => {
    it('Then should throw error for null', () => {
      // Arrange
      const nullContext: unknown = null;

      // Act & Assert
      expect(() => guardAglaErrorContext(nullContext)).toThrow();
    });

    it('Then should throw error for undefined', () => {
      // Arrange
      const undefinedContext: unknown = undefined;

      // Act & Assert
      expect(() => guardAglaErrorContext(undefinedContext)).toThrow();
    });

    it('Then should throw error for primitive values', () => {
      // Arrange
      const stringValue: unknown = 'not an object';

      // Act & Assert
      expect(() => guardAglaErrorContext(stringValue)).toThrow();
    });
  });
});
