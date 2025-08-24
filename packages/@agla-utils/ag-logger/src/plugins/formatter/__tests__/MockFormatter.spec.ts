//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// types
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgFormatFunction, AgLogMessage } from '../../../../shared/types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';

// target
import { createMockFormatter, MockFormatter } from '../MockFormatter';

// test with AgLoggerConfig
import { AgLoggerConfig } from '../../../internal/AgLoggerConfig.class';

/**
 * MockFormatter Test Suite
 *
 * atsushifx式BDD厳格プロセスに従い、it/expect単位でテストケースを分割
 * Red-Green-Refactorサイクルを維持した実装
 */
describe('MockFormatter', () => {
  describe('createMockFormatter関数', () => {
    describe('基本動作の確認', () => {
      it('カスタムルーチンを渡すとクラス（コンストラクタ関数）を返す', () => {
        const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
        const FormatterClass = createMockFormatter(customRoutine);

        expect(typeof FormatterClass).toBe('function');
      });

      it('返されたクラスは __isMockConstructor マーカーを持つ', () => {
        const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
        const FormatterClass = createMockFormatter(customRoutine);

        expect(FormatterClass.__isMockConstructor).toBe(true);
      });

      it('インスタンス化時にカスタムルーチンがbindされる', () => {
        const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
        const FormatterClass = createMockFormatter(customRoutine);
        const instance = new FormatterClass(customRoutine);

        // インスタンスにexecuteメソッドが存在することを確認
        expect(instance.execute).toBeDefined();
        expect(typeof instance.execute).toBe('function');
      });

      it('executeメソッドがカスタムルーチンを呼び出す', () => {
        const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
        const FormatterClass = createMockFormatter(customRoutine);
        const instance = new FormatterClass(customRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        const result = instance.execute(testMessage);
        expect(result).toBe('custom: Test message');
      });

      it('getStatsとresetメソッドが継承される', () => {
        const customRoutine: AgFormatRoutine = (msg) => `custom: ${msg.message}`;
        const FormatterClass = createMockFormatter(customRoutine);
        const instance = new FormatterClass(customRoutine);

        // getStats と reset メソッドが存在することを確認
        expect(instance.getStats).toBeDefined();
        expect(typeof instance.getStats).toBe('function');
        expect(instance.reset).toBeDefined();
        expect(typeof instance.reset).toBe('function');

        // getStatsが適切な形式のオブジェクトを返すことを確認
        const stats = instance.getStats();
        expect(stats).toHaveProperty('callCount');
        expect(stats).toHaveProperty('lastMessage');
        expect(typeof stats.callCount).toBe('number');
      });
    });
  });

  describe('MockFormatter', () => {
    describe('withRoutine', () => {
      it('createMockFormatterと同じ動作をする', () => {
        const customRoutine: AgFormatRoutine = (msg) => `factory: ${msg.message}`;
        const FormatterClass = MockFormatter.withRoutine(customRoutine);

        // クラス（コンストラクタ関数）を返すことを確認
        expect(typeof FormatterClass).toBe('function');
        expect(FormatterClass.__isMockConstructor).toBe(true);

        // インスタンス化して動作確認
        const instance = new FormatterClass(customRoutine);
        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        const result = instance.execute(testMessage);
        expect(result).toBe('factory: Test message');
      });
    });

    describe('json プリセット', () => {
      it('JSONフォーマットでメッセージを出力する', () => {
        const FormatterClass = MockFormatter.json;
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        const result = instance.execute(testMessage);
        const parsed = JSON.parse(result as string);

        expect(parsed).toHaveProperty('timestamp');
        expect(parsed).toHaveProperty('logLevel', AG_LOGLEVEL.INFO);
        expect(parsed).toHaveProperty('message', 'Test message');
      });
    });

    describe('messageOnly プリセット', () => {
      it('メッセージ部分のみを出力する', () => {
        const FormatterClass = MockFormatter.messageOnly;
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        const result = instance.execute(testMessage);
        expect(result).toBe('Test message');
      });
    });

    describe('timestamped プリセット', () => {
      it('タイムスタンプ付きでメッセージを出力する', () => {
        const FormatterClass = MockFormatter.timestamped;
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        const result = instance.execute(testMessage);
        // タイムスタンプ付きフォーマットの確認（正確なタイムスタンプは動的なので、形式のみチェック）
        expect(typeof result).toBe('string');
        expect(result as string).toContain('Test message');
        expect(result as string).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      });
    });

    describe('prefixed ファクトリ', () => {
      it('指定したプレフィックス付きでメッセージを出力する', () => {
        const FormatterClass = MockFormatter.prefixed('DEBUG');
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        const result = instance.execute(testMessage);
        expect(result).toBe('DEBUG: Test message');
      });
    });

    describe('errorThrow 動的エラーメッセージフォーマッタ', () => {
      it('デフォルトエラーメッセージでErrorを投げる', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        // デフォルトエラーメッセージでErrorを投げることを確認
        expect(() => instance.execute(testMessage)).toThrow('Default mock error');
      });

      it('カスタムデフォルトエラーメッセージを設定できる', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const customDefaultMessage = 'Custom default error';
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine, customDefaultMessage);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        // カスタムデフォルトエラーメッセージでErrorを投げることを確認
        expect(() => instance.execute(testMessage)).toThrow(customDefaultMessage);
      });

      it('setErrorMessageで実行時にエラーメッセージを変更できる', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        // 初期メッセージで確認
        expect(() => instance.execute(testMessage)).toThrow('Default mock error');

        // エラーメッセージを変更
        const newErrorMessage = 'Updated error message';
        instance.setErrorMessage(newErrorMessage);

        // 変更後のメッセージで確認
        expect(() => instance.execute(testMessage)).toThrow(newErrorMessage);

        // さらに変更
        const anotherErrorMessage = 'Another error message';
        instance.setErrorMessage(anotherErrorMessage);

        // 再度変更後のメッセージで確認
        expect(() => instance.execute(testMessage)).toThrow(anotherErrorMessage);
      });

      it('getErrorMessageで現在のエラーメッセージを取得できる', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const customDefault = 'Initial error message';
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine, customDefault);

        // 初期メッセージの確認
        expect(instance.getErrorMessage()).toBe(customDefault);

        // メッセージ変更後の確認
        const newMessage = 'Changed error message';
        instance.setErrorMessage(newMessage);
        expect(instance.getErrorMessage()).toBe(newMessage);
      });

      it('errorThrowも統計機能を持つ', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const dummyRoutine: AgFormatRoutine = (msg) => msg;
        const instance = new FormatterClass(dummyRoutine);

        // 初期状態の統計を確認
        const initialStats = instance.getStats();
        expect(initialStats.callCount).toBe(0);
        expect(initialStats.lastMessage).toBeNull();

        const testMessage: AgLogMessage = {
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          logLevel: AG_LOGLEVEL.INFO,
          message: 'Test message',
          args: [],
        };

        // executeでエラーが投げられても統計は更新される
        expect(() => instance.execute(testMessage)).toThrow();

        const statsAfterExecution = instance.getStats();
        expect(statsAfterExecution.callCount).toBe(1);
        expect(statsAfterExecution.lastMessage).toEqual(testMessage);

        // エラーメッセージ変更後も統計は継続
        instance.setErrorMessage('New error');
        expect(() => instance.execute(testMessage)).toThrow('New error');

        const statsAfterChange = instance.getStats();
        expect(statsAfterChange.callCount).toBe(2);
        expect(statsAfterChange.lastMessage).toEqual(testMessage);

        // resetで統計をクリアできる
        instance.reset();
        const statsAfterReset = instance.getStats();
        expect(statsAfterReset.callCount).toBe(0);
        expect(statsAfterReset.lastMessage).toBeNull();
      });
    });
  });

  describe('AgLoggerConfig統合テスト', () => {
    it('AgLoggerConfigでcreateFormatterを自動インスタンス化できる', () => {
      const config = new AgLoggerConfig();
      const customRoutine: AgFormatRoutine = (msg) => `config-test: ${msg.message}`;
      const FormatterClass = createMockFormatter(customRoutine);

      // AgLoggerConfigに設定（FormatterClassはAgMockConstructorなので、anyでキャスト）
      const result = config.setLoggerConfig({
        formatter: FormatterClass as unknown as AgFormatFunction,
      });

      expect(result).toBe(true);

      // formatterが自動インスタンス化されて設定されることを確認
      const formatter = config.formatter;
      expect(typeof formatter).toBe('function');

      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'Integration test',
        args: [],
      };

      const formatted = formatter(testMessage);
      expect(formatted).toBe('config-test: Integration test');
    });

    it('MockFormatter.jsonもAgLoggerConfigで自動インスタンス化できる', () => {
      const config = new AgLoggerConfig();

      const result = config.setLoggerConfig({
        formatter: MockFormatter.json as unknown as AgFormatFunction,
      });

      expect(result).toBe(true);

      const formatter = config.formatter;
      const testMessage: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.INFO,
        message: 'JSON test',
        args: [],
      };

      const formatted = formatter(testMessage);
      const parsed = JSON.parse(formatted as string);
      expect(parsed).toHaveProperty('message', 'JSON test');
      expect(parsed).toHaveProperty('logLevel', AG_LOGLEVEL.INFO);
    });
  });
});
