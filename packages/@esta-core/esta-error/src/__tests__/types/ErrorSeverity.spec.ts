// src: src/__tests__/types/ErrorSeverity.spec.ts
// @(#) : Unit tests for ErrorSeverity enum and validation functions
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - Testing utilities and assertions
import { describe, expect, it } from 'vitest';

// Local modules - Application code and utilities from current package
import { ErrorSeverity, isValidErrorSeverity } from '../../../shared/types';

/**
 * ErrorSeverity Enum Value Tests
 *
 * @description ErrorSeverity enum の各メンバの値が正確に定義されていることを検証
 * atsushifx式BDD構造で列挙値の整合性と一貫性をテスト
 */
describe('given ErrorSeverity enum', () => {
  /**
   * Enum Member Access Tests
   *
   * @description 各 ErrorSeverity メンバへのアクセスと期待値の一致を確認
   * 文字列リテラル型として正確に定義されていることを検証
   */
  describe('when accessing enum members', () => {
    // FATAL severity レベルの文字列値確認
    it('then defines FATAL as "fatal"', () => {
      expect(ErrorSeverity.FATAL).toBe('fatal');
    });

    // ERROR severity レベルの文字列値確認
    it('then defines ERROR as "error"', () => {
      expect(ErrorSeverity.ERROR).toBe('error');
    });

    // WARNING severity レベルの文字列値確認
    it('then defines WARNING as "warning"', () => {
      expect(ErrorSeverity.WARNING).toBe('warning');
    });

    // INFO severity レベルの文字列値確認
    it('then defines INFO as "info"', () => {
      expect(ErrorSeverity.INFO).toBe('info');
    });
  });
});

/**
 * ErrorSeverity Validation Guard Tests
 *
 * @description isValidErrorSeverity 関数による型ガード機能の正確性を検証
 * atsushifx式BDD構造で有効・無効値の判定ロジックをテスト
 */
describe('given isValidErrorSeverity guard', () => {
  /**
   * Valid Input Validation Tests
   *
   * @description 有効な ErrorSeverity 値に対する正確な判定を確認
   * 全ての定義済み severity レベルが適切に認識されることを検証
   */
  describe('when input is valid', () => {
    (['fatal', 'error', 'warning', 'info'] as const).forEach((sev) => {
      // 各有効な severity 値で true を返すことを確認
      it(`then returns true for ${sev}`, () => {
        expect(isValidErrorSeverity(sev)).toBe(true);
      });
    });
  });

  /**
   * Invalid Input Validation Tests
   *
   * @description 無効な値に対する正確な false 判定を確認
   * 型安全性を保つための適切な境界値テストを実行
   */
  describe('when input is invalid', () => {
    // プリミティブ境界値テスト
    const primitives: unknown[] = [
      '',
      ' ',
      '\t',
      '\n', // 空文字列・スペース文字
      0,
      -1,
      NaN,
      Infinity,
      -Infinity, // 数値
      true,
      false, // 真偽値
      null,
      undefined, // null値
    ];

    // オブジェクト型テスト
    const objects: unknown[] = [
      [],
      ['fatal'],
      [null], // 配列
      {},
      { fatal: true },
      { toString: () => 'fatal' }, // オブジェクト
      function() {},
      () => 'fatal', // 関数
      new Date(), // 日付
    ];

    // 特殊値テスト
    const specialValues: unknown[] = [
      Symbol(),
      Symbol('fatal'), // Symbol
      BigInt(1),
      BigInt(0), // BigInt
    ];

    // 既存無効値テスト
    const legacy: unknown[] = ['invalid', 123];

    [...primitives, ...objects, ...specialValues, ...legacy].forEach((c) => {
      // 無効な値で false を返すことを確認
      it(`then returns false for ${String(c)}`, () => {
        expect(isValidErrorSeverity(c)).toBe(false);
      });
    });

    // プロトタイプ汚染耐性テスト
    it('then resists prototype pollution', () => {
      // @ts-expect-error プロトタイプ汚染テスト用
      Object.prototype.fatal = 'fatal';

      expect(isValidErrorSeverity({})).toBe(false);
      expect(isValidErrorSeverity(Object.create(null))).toBe(false);

      // @ts-expect-error クリーンアップ
      delete Object.prototype.fatal;
    });
  });
});
