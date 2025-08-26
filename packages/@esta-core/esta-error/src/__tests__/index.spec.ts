// src: src/__tests__/index.spec.ts
// @(#) : Unit tests for package entry point exports
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - Testing utilities and assertions
import { describe, expect, it } from 'vitest';

/**
 * Package Entry Point Export Tests
 *
 * @description パッケージエントリーポイントからの正確なエクスポートを検証
 * atsushifx式BDD構造でモジュールエクスポートの整合性をテスト
 */
describe('given package entry point', () => {
  /**
   * Module Import Validation Tests
   *
   * @description モジュールインポート時の各エクスポート項目の可用性を検証
   * 動的インポートによる遅延読み込み時の正確性をテスト
   */
  describe('when importing module', () => {
    // ErrorSeverity enum の値の正確性を検証
    it('then exports ErrorSeverity enum', async () => {
      const { ErrorSeverity } = await import('../../src/index');
      expect(ErrorSeverity.FATAL).toBe('fatal');
      expect(ErrorSeverity.ERROR).toBe('error');
    });

    // EstaError class の基本動作確認
    it('then exports EstaError class', async () => {
      const { EstaError, ErrorSeverity } = await import('../../src/index');
      const error = new EstaError('TEST_ERROR', 'Test message', 'TEST_001', ErrorSeverity.ERROR);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_001');
    });

    // isValidErrorSeverity 関数の動作確認
    it('then exports isValidErrorSeverity function', async () => {
      const { isValidErrorSeverity } = await import('../../src/index');
      expect(isValidErrorSeverity('fatal')).toBe(true);
      expect(isValidErrorSeverity('invalid')).toBe(false);
    });
  });
});
