// src/plugins/logger/__tests__/NullLogger.spec.ts
// @(#) : Unit tests for NullLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it, vi } from 'vitest';

// import test target
import { NullLogger } from '../../NullLogger';

/**
 * NullLoggerプラグインの包括的ユニットテストスイート
 *
 * @description NullLoggerの全機能を効率的に検証
 * 出力なし、戻り値、複数呼び出し時の動作を包括的にテスト
 *
 * @testType Unit Test
 * @testTarget NullLogger Plugin
 * @coverage
 * - 正常系: 基本動作（出力なし）
 * - エッジケース: 複数呼び出し、特殊入力
 */
describe('NullLogger', () => {
  /**
   * 正常系テスト: 基本機能
   *
   * @description NullLoggerの基本機能（何もしない）を検証
   */
  describe('正常系: Basic Functionality', () => {
    it('should perform no operations and return undefined', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      // 基本的な動作テスト
      const result1 = NullLogger('formatted message');
      const result2 = NullLogger('another message');
      const result3 = NullLogger('');

      // 何も出力しない
      expect(consoleSpy).not.toHaveBeenCalled();

      // undefinedを返す
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  /**
   * エッジケース: 境界値と特殊条件
   *
   * @description 特殊な入力での動作を検証
   */
  describe('エッジケース: Edge Cases', () => {
    it('should handle undefined and null messages silently', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const result1 = NullLogger(undefined as unknown as string);
      const result2 = NullLogger(null as unknown as string);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should handle multiple rapid calls efficiently', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      // 多数の呼び出しをテスト
      for (let i = 0; i < 1000; i++) {
        const result = NullLogger(`message ${i}`);
        expect(result).toBeUndefined();
      }

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle very long messages silently', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const longMessage = 'a'.repeat(100000);

      const result = NullLogger(longMessage);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });
});
