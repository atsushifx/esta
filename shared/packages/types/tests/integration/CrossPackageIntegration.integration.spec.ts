// src: tests/integration/CrossPackageIntegration.integration.spec.ts
// @(#) : AglaError クロスパッケージ統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// test type definitions
type _TCompatibilityInfo = {
  expectedVersion: string | null;
  actualVersion: string | undefined;
  packageName: string;
};

type _TNestedContext = {
  originalPackage: string;
  level1?: {
    level2?: {
      level3?: unknown;
    };
  };
};

// I-001 グループ: クロスパッケージエラー伝播
describe('Given AglaError for cross-package error propagation', () => {
  describe('When handling error chain across different packages', () => {
    it('Then 正常系：should maintain AglaError inheritance across packages', () => {
      // Arrange
      const packageAError = new TestAglaError('PACKAGE_A_ERROR', 'Error from package A');
      const packageBError = new TestAglaError('PACKAGE_B_ERROR', 'Error from package B');

      // Act: パッケージ境界を跨いだエラーチェーン
      const crossPackageError = packageBError.chain(packageAError);

      // Assert
      expect(crossPackageError).toBeInstanceOf(TestAglaError);
      expect(crossPackageError.errorType).toBe('PACKAGE_B_ERROR');
      expect(crossPackageError.message).toBe('Error from package B (caused by: Error from package A)');
    });

    it('Then 異常系：should handle null cause gracefully', () => {
      // Arrange
      const error = new TestAglaError('TEST_ERROR', 'Test message');
      const nullCause = null as unknown as Error;

      // Act & Assert
      expect(() => error.chain(nullCause)).toThrow();
    });

    it('Then エッジケース：should handle non-AglaError cause', () => {
      // Arrange
      const aglaError = new TestAglaError('AGLA_ERROR', 'AglaError instance');
      const standardError = new Error('Standard Error');

      // Act
      const chainedError = aglaError.chain(standardError);

      // Assert
      expect(chainedError).toBeInstanceOf(TestAglaError);
      expect(chainedError.message).toBe('AglaError instance (caused by: Standard Error)');
    });
  });

  describe('When preserving context across package boundaries', () => {
    it('Then 正常系：should preserve original package information in context', () => {
      // Arrange
      const originalPackage = '@shared/types';
      const context = { originalPackage, userId: 'test-123' };
      const error = new TestAglaError('CROSS_PACKAGE_ERROR', 'Cross package message', { context });

      // Act
      const propagatedError = error.chain(new Error('Propagation cause'));

      // Assert
      expect(propagatedError.context?.originalPackage).toBe('@shared/types');
      expect(propagatedError.context?.userId).toBe('test-123');
      expect(propagatedError.context?.cause).toBe('Propagation cause');
    });

    it('Then 異常系：should handle undefined context gracefully', () => {
      // Arrange
      const error = new TestAglaError('NO_CONTEXT_ERROR', 'No context message');
      const cause = new Error('Test cause');

      // Act
      const chainedError = error.chain(cause);

      // Assert
      expect(chainedError.context?.cause).toBe('Test cause');
      expect((chainedError.context as _TNestedContext | undefined)?.originalPackage).toBeUndefined();
    });

    it('Then エッジケース：should handle complex nested context', () => {
      // Arrange
      const nestedContext: _TNestedContext = {
        level1: { level2: { level3: 'deep-value' } },
        originalPackage: '@shared/types',
      };
      const error = new TestAglaError('NESTED_CONTEXT_ERROR', 'Nested context', { context: nestedContext });

      // Act
      const chainedError = error.chain(new Error('Chain cause'));

      // Assert
      expect((chainedError.context as _TNestedContext | undefined)?.level1?.level2?.level3).toBe('deep-value');
      expect((chainedError.context as _TNestedContext | undefined)?.originalPackage).toBe('@shared/types');
    });
  });

  describe('When handling package version compatibility errors', () => {
    it('Then 正常系：should include compatibility info for version mismatches', () => {
      // Arrange
      const compatibilityInfo: _TCompatibilityInfo = {
        expectedVersion: '1.0.0',
        actualVersion: '0.9.0',
        packageName: '@shared/types',
      };
      const versionError = new TestAglaError('VERSION_MISMATCH', 'Version compatibility error', {
        context: { compatibilityInfo },
      });

      // Act & Assert
      expect(versionError.context?.compatibilityInfo).toBeDefined();
      expect((versionError.context?.compatibilityInfo as _TCompatibilityInfo).expectedVersion).toBe('1.0.0');
      expect((versionError.context?.compatibilityInfo as _TCompatibilityInfo).actualVersion).toBe('0.9.0');
    });

    it('Then 異常系：should handle missing version info', () => {
      // Arrange & Act
      const error = new TestAglaError('VERSION_ERROR', 'Version error without info');

      // Assert
      expect(error.context?.compatibilityInfo).toBeUndefined();
      expect(error.errorType).toBe('VERSION_ERROR');
    });

    it('Then エッジケース：should handle malformed version info', () => {
      // Arrange
      const malformedInfo = {
        expectedVersion: null,
        actualVersion: undefined,
        packageName: '',
      };
      const error = new TestAglaError('MALFORMED_VERSION', 'Malformed version', {
        context: { compatibilityInfo: malformedInfo },
      });

      // Act & Assert
      expect((error.context?.compatibilityInfo as _TCompatibilityInfo).expectedVersion).toBeNull();
      expect((error.context?.compatibilityInfo as _TCompatibilityInfo).actualVersion).toBeUndefined();
      expect((error.context?.compatibilityInfo as _TCompatibilityInfo).packageName).toBe('');
    });
  });
});
