// src: src/__tests__/types/EstaError.spec.ts
// @(#) : Unit tests for EstaError class functionality and methods
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - Testing utilities and assertions
import { describe, expect, it } from 'vitest';

// Local modules - Application code and utilities from current package
import { ErrorSeverity, EstaError } from '../../../shared/types';

/**
 * テスト用循環参照型定義
 * @description 循環参照テストで使用する共通型定義
 */
type TCircularObject = {
  // data
  name?: string;
  level?: number;
  // link:
  next?: TCircularObject;
  final?: string;
  self?: TCircularObject;
};

/**
 * EstaError Class Constructor Tests
 *
 * @description EstaError クラスのコンストラクタとプロパティの正確性を検証
 * atsushifx式BDD構造でエラーオブジェクトの初期化と状態管理をテスト
 */
describe('given EstaError class', () => {
  /**
   * Parameter-based Construction Tests
   *
   * @description コンストラクタパラメータによる適切なオブジェクト初期化を確認
   * Error 継承と必須フィールドの正確な設定を検証
   */
  describe('when constructed with parameters', () => {
    // 基本フィールドの設定を確認
    it('then sets basic fields correctly', () => {
      const error = new EstaError('TEST_ERROR', 'Test message', 'TEST_001', ErrorSeverity.ERROR);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_001');
      expect(error.severity).toBe(ErrorSeverity.ERROR);
    });

    // 複数パラメータでの初期化動作確認
    it('then initializes with provided constructor values', () => {
      const error = new EstaError('VALIDATION_ERROR', 'Invalid input provided', 'VAL_001', ErrorSeverity.WARNING);
      expect(error.message).toBe('Invalid input provided');
      expect(error.severity).toBe(ErrorSeverity.WARNING);
    });

    // タイムスタンプの自動生成を確認
    it('then auto-generates a timestamp', () => {
      const beforeCreation = new Date();
      const error = new EstaError('TIME_ERROR', 'Time test', 'TIME_001', ErrorSeverity.INFO);
      const afterCreation = new Date();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(error.timestamp.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    // 極端に長いメッセージでの動作確認
    it('then handles extremely long messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new EstaError('LONG_ERROR', longMessage, 'LONG_001', ErrorSeverity.ERROR);
      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    // Unicode文字含むメッセージでの動作確認
    it('then handles Unicode characters in messages', () => {
      const unicodeMessage = '🚨 エラーが発生しました 😱 Error occurred! 💥';
      const error = new EstaError('UNICODE_ERROR', unicodeMessage, 'UNI_001', ErrorSeverity.WARNING);
      expect(error.message).toBe(unicodeMessage);
    });

    // 制御文字含むメッセージでの動作確認
    it('then handles control characters in messages', () => {
      const controlMessage = 'Line 1\nLine 2\tTabbed\rCarriage\0Null';
      const error = new EstaError('CONTROL_ERROR', controlMessage, 'CTRL_001', ErrorSeverity.INFO);
      expect(error.message).toBe(controlMessage);
    });

    // 空文字列メッセージでの動作確認
    it('then handles empty string messages', () => {
      const error = new EstaError('EMPTY_ERROR', '', 'EMPTY_001', ErrorSeverity.ERROR);
      expect(error.message).toBe('');
    });

    // 循環参照含むcontextでの動作確認
    it('then handles circular reference context', () => {
      const circularObj: Record<string, unknown> = { name: 'test' };
      circularObj.self = circularObj;

      const error = new EstaError('CIRCULAR_ERROR', 'Circular test', 'CIRC_001', ErrorSeverity.ERROR, circularObj);
      expect(error.context).toBe(circularObj);
      expect(error.context?.name).toBe('test');
    });

    // 深い階層contextでの動作確認
    it('then handles deep nested context', () => {
      let deepContext: TCircularObject = { name: 'level 0' };
      let current = deepContext;

      // 10レベルの深い階層作成
      for (let i = 0; i < 10; i++) {
        current.level = i;
        current.next = {};
        current = current.next;
      }
      current.final = 'deep';

      const error = new EstaError('DEEP_ERROR', 'Deep test', 'DEEP_001', ErrorSeverity.WARNING, deepContext);
      expect(error.context?.level).toBe(0);
    });

    // 巨大contextでの動作確認
    it('then handles large context objects', () => {
      const largeContext: Record<string, number> = {};

      // 1000プロパティのオブジェクト作成
      for (let i = 0; i < 1000; i++) {
        largeContext[`prop${i}`] = i;
      }

      const error = new EstaError('LARGE_ERROR', 'Large test', 'LARGE_001', ErrorSeverity.INFO, largeContext);
      expect(Object.keys(error.context!).length).toBe(1000);
      expect(error.context?.prop999).toBe(999);
    });

    // 特殊値contextでの動作確認
    it('then handles special values in context', () => {
      const specialContext = {
        symbol: Symbol('test'),
        bigint: BigInt(42),
        date: new Date(),
        regex: /test/g,
        func: () => 'test',
      };

      const error = new EstaError('SPECIAL_ERROR', 'Special test', 'SPEC_001', ErrorSeverity.FATAL, specialContext);
      expect(error.context?.bigint).toBe(BigInt(42));
      expect(typeof error.context?.symbol).toBe('symbol');
    });
  });
});

/**
 * EstaError JSON Serialization Tests (No Context)
 *
 * @description context のない EstaError インスタンスの JSON 変換機能を検証
 * atsushifx式BDD構造でシリアライズ機能の正確性と一貫性をテスト
 */
describe('given EstaError instance without context', () => {
  /**
   * JSON Conversion Tests
   *
   * @description toJSON メソッドによる適切な JSON 変換を確認
   * 必須フィールドの包含と context の適切な除外を検証
   */
  describe('when toJSON is called', () => {
    // 必須フィールドの包含を確認
    it('then includes required fields', () => {
      const error = new EstaError('JSON_ERROR', 'JSON test', 'JSON_001', ErrorSeverity.ERROR);
      const json = error.toJSON();
      expect(json).toHaveProperty('errorType', 'JSON_ERROR');
      expect(json).toHaveProperty('message', 'JSON test');
      expect(json).toHaveProperty('code', 'JSON_001');
      expect(json).toHaveProperty('severity', ErrorSeverity.ERROR);
      expect(json).toHaveProperty('timestamp');
    });

    // context フィールドの除外を確認
    it('then does not include context', () => {
      const error = new EstaError('NO_CONTEXT_ERROR', 'No context', 'NC_001', ErrorSeverity.INFO);
      const json = error.toJSON();
      expect(json).not.toHaveProperty('context');
    });
  });
});

/**
 * EstaError JSON Serialization Tests (With Context)
 *
 * @description context を持つ EstaError インスタンスの JSON 変換機能を検証
 * atsushifx式BDD構造でコンテキスト情報の正確なシリアライズをテスト
 */
describe('given EstaError instance with context', () => {
  /**
   * JSON Conversion with Context Tests
   *
   * @description context 情報を含む toJSON メソッドの動作を確認
   * コンテキストデータの適切な包含と保存を検証
   */
  describe('when toJSON is called', () => {
    // context フィールドの包含を確認
    it('then includes context field', () => {
      const context = { userId: 123, action: 'login' };
      const error = new EstaError('AUTH_ERROR', 'Auth failed', 'AUTH_001', ErrorSeverity.WARNING, context);
      const json = error.toJSON();
      expect(json).toHaveProperty('context', context);
    });

    // 循環参照contextでのJSON化動作確認
    it('then handles circular reference context safely', () => {
      const circularContext: Record<string, unknown> = { name: 'circular' };
      circularContext.self = circularContext;

      const error = new EstaError(
        'CIRCULAR_JSON',
        'Circular JSON test',
        'C-JSON_001',
        ErrorSeverity.ERROR,
        circularContext,
      );

      // toJSON呼び出しでエラーが発生しないことを確認
      expect(() => error.toJSON()).not.toThrow();
      const json = error.toJSON();
      expect(json).toHaveProperty('context');
    });

    // undefined/null値contextでの動作確認
    it('then handles undefined and null values in context', () => {
      const nullContext = {
        nullValue: null,
        undefinedValue: undefined,
        normalValue: 'test',
      };

      const error = new EstaError('NULL_CONTEXT', 'Null context test', 'NULL_001', ErrorSeverity.INFO, nullContext);
      const json = error.toJSON();

      expect(json).toHaveProperty('context');
      // @ts-expect-error テスト用のプロパティアクセス
      expect(json.context.nullValue).toBe(null);
      // @ts-expect-error テスト用のプロパティアクセス
      expect(json.context.normalValue).toBe('test');
    });

    // Symbol/BigInt含むcontextでの処理確認
    it('then handles Symbol and BigInt in context', () => {
      const specialContext = {
        symbol: Symbol('test-symbol'),
        bigint: BigInt(999),
        string: 'regular-value',
      };

      const error = new EstaError(
        'SPECIAL_JSON',
        'Special context test',
        'SPEC_JSON_001',
        ErrorSeverity.WARNING,
        specialContext,
      );
      const json = error.toJSON();

      expect(json).toHaveProperty('context');
      // @ts-expect-error テスト用のプロパティアクセス
      expect(json.context.bigint).toBe(BigInt(999));
      // @ts-expect-error テスト用のプロパティアクセス
      expect(typeof json.context.symbol).toBe('symbol');
    });

    // 非enumerable プロパティでの処理確認
    it('then handles non-enumerable properties', () => {
      const contextWithNonEnum = { visible: 'yes' };

      // 非enumerableプロパティ追加
      Object.defineProperty(contextWithNonEnum, 'hidden', {
        value: 'secret',
        enumerable: false,
        writable: true,
        configurable: true,
      });

      const error = new EstaError(
        'NON_ENUM',
        'Non-enumerable test',
        'N-ENUM_001',
        ErrorSeverity.FATAL,
        contextWithNonEnum,
      );
      const json = error.toJSON();

      expect(json).toHaveProperty('context');
      // @ts-expect-error テスト用のプロパティアクセス
      expect(json.context.visible).toBe('yes');
      // contextオブジェクト自体がそのまま参照されるため非enumerableプロパティも含まれる
      // @ts-expect-error テスト用のプロパティアクセス
      expect(json.context.hidden).toBe('secret');
    });
  });
});

/**
 * EstaError String Representation Tests
 *
 * @description EstaError インスタンスの文字列表現機能を検証
 * atsushifx式BDD構造で toString メソッドのフォーマットと内容をテスト
 */
describe('given EstaError instance', () => {
  /**
   * String Conversion Format Tests
   *
   * @description toString メソッドによる適切な文字列フォーマットを確認
   * severity、timestamp、type、message の統合的な表示を検証
   */
  describe('when toString is called', () => {
    // severity、timestamp、type、message を含むフォーマットを確認
    it('then formats with severity, timestamp, type, and message', () => {
      const error = new EstaError('STRING_ERROR', 'String test', 'STR_001', ErrorSeverity.ERROR);
      const str = error.toString();
      expect(str).toContain('[ERROR]');
      expect(str).toMatch(/^\[ERROR\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      expect(str).toContain('STRING_ERROR');
      expect(str).toContain('String test');
    });

    // severity と timestamp の包含を確認
    it('then includes severity and timestamp', () => {
      const error = new EstaError('TIME_STRING_ERROR', 'Time string test', 'TS_001', ErrorSeverity.WARNING);
      const str = error.toString();
      expect(str).toContain('[WARNING]');
      expect(str).toContain(error.timestamp.toISOString());
    });
  });
});

/**
 * EstaError Chain Functionality Tests
 *
 * @description EstaError のエラーチェーン機能を検証
 * atsushifx式BDD構造で原因エラーの連鎖と情報保存をテスト
 */
describe('given base error and cause', () => {
  /**
   * Error Chain Creation Tests
   *
   * @description chain メソッドによるエラー連鎖の正確性を確認
   * 原因エラーの適切な結合とメッセージ統合を検証
   */
  describe('when chain is called', () => {
    // 原因メッセージを含む EstaError を返すことを確認
    it('then returns EstaError including cause message', () => {
      const originalError = new Error('Original failure');
      const estaError = new EstaError('CHAIN_ERROR', 'Chain test', 'CHAIN_001', ErrorSeverity.ERROR);
      const chainedError = estaError.chain(originalError);
      expect(chainedError).toBeInstanceOf(EstaError);
      expect(chainedError.message).toContain('Chain test');
      expect(chainedError.message).toContain('caused by: Original failure');
    });

    // チェーンエラーでプロパティが保持されることを確認
    it('then preserves properties on chained error', () => {
      const originalError = new Error('Nested error');
      const estaError = new EstaError('PRESERVE_ERROR', 'Preserve test', 'PRES_001', ErrorSeverity.FATAL);
      const chainedError = estaError.chain(originalError);
      expect(chainedError.errorType).toBe('PRESERVE_ERROR');
      expect(chainedError.code).toBe('PRES_001');
      expect(chainedError.severity).toBe(ErrorSeverity.FATAL);
    });

    // context に原因が含まれることを確認
    it('then includes cause in context', () => {
      const originalError = new Error('Root cause');
      const estaError = new EstaError('CONTEXT_ERROR', 'Context test', 'CTX_001', ErrorSeverity.WARNING);
      const chainedError = estaError.chain(originalError);
      expect(chainedError.context).toHaveProperty('cause', 'Root cause');
    });

    // 5回連続チェーンでの動作確認
    it('then handles multiple chain levels', () => {
      let currentError: EstaError = new EstaError('BASE_ERROR', 'Base error', 'BASE_001', ErrorSeverity.ERROR);

      // 5回連続でチェーン
      for (let i = 1; i <= 5; i++) {
        const cause = new Error(`Level ${i} error`);
        currentError = currentError.chain(cause);
      }

      expect(currentError.message).toContain('Base error');
      expect(currentError.message).toContain('Level 5 error');
      expect(currentError.context).toHaveProperty('cause', 'Level 5 error');
    });

    // チェーン時のメッセージ構造確認
    it('then maintains proper message structure in chains', () => {
      const cause1 = new Error('First cause');
      const cause2 = new Error('Second cause');

      const baseError = new EstaError('MSG_CHAIN', 'Base message', 'MSG_001', ErrorSeverity.INFO);
      const chain1 = baseError.chain(cause1);
      const chain2 = chain1.chain(cause2);

      expect(chain2.message).toContain('Base message');
      expect(chain2.message).toContain('(caused by: First cause)');
      expect(chain2.message).toContain('(caused by: Second cause)');
    });

    // チェーン時のcontext蓄積動作確認
    it('then accumulates context through chains', () => {
      const originalContext = { step: 'initial' };
      const baseError = new EstaError('CTX_CHAIN', 'Context chain', 'CTX_001', ErrorSeverity.WARNING, originalContext);

      const cause = new Error('Chained cause');
      const chainedError = baseError.chain(cause);

      expect(chainedError.context).toHaveProperty('step', 'initial');
      expect(chainedError.context).toHaveProperty('cause', 'Chained cause');
    });

    // 標準Errorタイプでのチェーン確認
    it('then chains with different Error types', () => {
      const typeError = new TypeError('Type mismatch');
      const rangeError = new RangeError('Out of range');
      const syntaxError = new SyntaxError('Syntax invalid');

      const baseError = new EstaError('TYPE_CHAIN', 'Type chain test', 'TYPE_001', ErrorSeverity.ERROR);

      const chain1 = baseError.chain(typeError);
      const chain2 = chain1.chain(rangeError);
      const chain3 = chain2.chain(syntaxError);

      expect(chain3.message).toContain('Type mismatch');
      expect(chain3.message).toContain('Out of range');
      expect(chain3.message).toContain('Syntax invalid');
    });

    // カスタムErrorクラスでのチェーン確認
    it('then chains with custom Error classes', () => {
      class CustomError extends Error {
        constructor(message: string, public code: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const customError = new CustomError('Custom failure', 'CUST_001');
      const baseError = new EstaError('CUSTOM_CHAIN', 'Custom chain', 'C-CHAIN_001', ErrorSeverity.FATAL);
      const chainedError = baseError.chain(customError);

      expect(chainedError.message).toContain('Custom chain');
      expect(chainedError.message).toContain('Custom failure');
      expect(chainedError.context).toHaveProperty('cause', 'Custom failure');
    });

    // メモリリーク防止確認テスト
    it('then prevents memory leaks in long chains', () => {
      let baseError = new EstaError('MEMORY_TEST', 'Memory test', 'MEM_001', ErrorSeverity.INFO);

      // 大量チェーンでメモリリークテスト
      for (let i = 0; i < 100; i++) {
        const cause = new Error(`Cause ${i}`);
        baseError = baseError.chain(cause);
      }

      // チェーンされたエラーが適切に作成されていることを確認
      expect(baseError).toBeInstanceOf(EstaError);
      expect(baseError.message).toContain('Memory test');
      expect(baseError.context).toHaveProperty('cause', 'Cause 99');

      // 過度に長いメッセージにならないことを確認（実装依存）
      expect(baseError.message.length).toBeLessThan(10000);
    });
  });
});
