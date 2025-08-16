//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// types
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgLogMessage } from '@/shared/types';
import type { AgFormatRoutine } from '../../../../../shared/types/AgMockConstructor.class';

// target
import { MockFormatter } from '@/plugins/formatter/MockFormatter';

// integration test
import { AgLoggerConfig } from '@/internal/AgLoggerConfig.class';

/**
 * MockFormatter.errorThrow 統合テストスイート
 *
 * AgLoggerConfigとの連携テストと実際のロガー使用シナリオをテスト
 * atsushifx式BDD厳格プロセスに従い、統合レベルでの動作を確認
 */
describe('MockFormatter.errorThrow - 統合テスト', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  describe('AgLoggerConfig連携', () => {
    it('AgLoggerConfigでErrorThrowFormatterを自動インスタンス化できる', () => {
      // Arrange
      const config = new AgLoggerConfig();
      const FormatterClass = new MockFormatter.errorThrow();
      FormatterClass.setErrorMessage('Default mock error');

      // Act - AgLoggerConfigにerrorThrowフォーマッタを設定
      const result = config.setLoggerConfig({
        formatter: FormatterClass.execute,
      });

      // Assert - 設定が成功
      expect(result).toBe(true);

      // Assert - フォーマッタが関数として設定される
      const formatter = config.formatter;
      expect(typeof formatter).toBe('function');

      // Act & Assert - フォーマッタがエラーを投げる
      const testMessage = createTestMessage();
      expect(() => formatter(testMessage)).toThrow('Default mock error');
    });

    it('AgLoggerConfig経由でもsetErrorMessageが動作する', () => {
      // Arrange
      const config = new AgLoggerConfig();
      const errorThrowFormatter = new MockFormatter.errorThrow();

      // インスタンスを直接作成してAgLoggerConfigに設定
      errorThrowFormatter.setErrorMessage('Config integration test');
      config.setLoggerConfig({
        formatter: errorThrowFormatter.execute,
      });

      const testMessage = createTestMessage();

      // Act & Assert - 初期メッセージでエラーを投げる
      expect(
        () => config.formatter(testMessage),
      ).toThrow('Config integration test');

      // Act - エラーメッセージを変更
      errorThrowFormatter.setErrorMessage('Runtime changed via config');

      // Assert - 変更されたメッセージでエラーを投げる
      expect(() => config.formatter(testMessage)).toThrow('Runtime changed via config');
    });

    it('AgLoggerConfigの自動インスタンス化でもデフォルトメッセージが設定される', () => {
      // Arrange
      const config = new AgLoggerConfig();

      // デフォルトメッセージ付きのクラスを作成
      class CustomErrorThrow extends MockFormatter.errorThrow {
        static readonly __isMockConstructor = true as const;

        constructor(routine?: AgFormatRoutine) {
          super(routine, 'Custom config default message');
        }
      }

      // Act - カスタムクラスをAgLoggerConfigに設定
      const result = config.setLoggerConfig({
        formatter: CustomErrorThrow,
      });

      // Assert - 設定が成功
      expect(result).toBe(true);

      // Act & Assert - カスタムデフォルトメッセージでエラーを投げる
      const testMessage = createTestMessage();
      expect(() => config.formatter(testMessage)).toThrow('Custom config default message');
    });

    it('複数のAgLoggerConfigインスタンスで独立したerrorThrow設定', () => {
      // Arrange
      const config1 = new AgLoggerConfig();
      const config2 = new AgLoggerConfig();
      const FormatterClass = MockFormatter.errorThrow;

      const instance1 = new FormatterClass(dummyRoutine, 'Config 1 error');
      const instance2 = new FormatterClass(dummyRoutine, 'Config 2 error');

      // Act - 異なる設定を各configに適用
      config1.setLoggerConfig({ formatter: instance1.execute });
      config2.setLoggerConfig({ formatter: instance2.execute });

      const testMessage = createTestMessage();

      // Assert - それぞれ独立したエラーメッセージを持つ
      expect(() => config1.formatter(testMessage)).toThrow('Config 1 error');
      expect(() => config2.formatter(testMessage)).toThrow('Config 2 error');

      // Act - 一方のメッセージを変更
      instance1.setErrorMessage('Config 1 changed');

      // Assert - 変更は独立している
      expect(() => config1.formatter(testMessage)).toThrow('Config 1 changed');
      expect(() => config2.formatter(testMessage)).toThrow('Config 2 error');
    });
  });

  describe('実際のロガー統合', () => {
    it('AgLoggerでerrorThrowを使用してログ処理をテストできる', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage('Logger integration test');

      // 統計の初期状態を確認
      expect(instance.getStats().callCount).toBe(0);

      // Act & Assert - executeでエラーが投げられる
      expect(() => instance.execute(testMessage)).toThrow('Default mock error');

      // Assert - 統計が更新されている
      expect(instance.getStats().callCount).toBe(1);
      expect(instance.getStats().lastMessage).toEqual(testMessage);
    });

    it('複数のログレベルでerrorThrowの動作を確認', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);

      const fatalMessage: AgLogMessage = {
        ...createTestMessage('FATAL error'),
        logLevel: AG_LOGLEVEL.FATAL,
      };

      const infoMessage: AgLogMessage = {
        ...createTestMessage('INFO message'),
        logLevel: AG_LOGLEVEL.INFO,
      };

      // Act & Assert - 異なるログレベルでも同じエラーが投げられる
      expect(() => instance.execute(fatalMessage)).toThrow('Default mock error');
      expect(() => instance.execute(infoMessage)).toThrow('Default mock error');

      // Assert - 両方のメッセージが統計に反映される
      expect(instance.getStats().callCount).toBe(2);
      expect(instance.getStats().lastMessage).toEqual(infoMessage);
    });

    it('引数付きログメッセージでもerrorThrowが正常動作する', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);

      const messageWithArgs: AgLogMessage = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        logLevel: AG_LOGLEVEL.ERROR,
        message: 'Error with args: %s %d',
        args: ['test', 42],
      };

      // Act & Assert - 引数付きメッセージでもエラーが投げられる
      expect(() => instance.execute(messageWithArgs)).toThrow('Default mock error');

      // Assert - 引数付きメッセージが統計に保存される
      expect(instance.getStats().lastMessage).toEqual(messageWithArgs);
      expect(instance.getStats().lastMessage?.args).toEqual(['test', 42]);
    });

    it('長時間実行時の統計精度を確認', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - 多数回実行
      for (let i = 0; i < 100; i++) {
        expect(() => instance.execute(testMessage)).toThrow('Default mock error');
      }

      // Assert - 統計が正確に記録される
      expect(instance.getStats().callCount).toBe(100);
      expect(instance.getStats().lastMessage).toEqual(testMessage);

      // Act - リセット後の確認
      instance.reset();
      expect(instance.getStats().callCount).toBe(0);
      expect(instance.getStats().lastMessage).toBeNull();
    });

    it('同時実行時の動作確認（統計の整合性）', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);

      const messages = [
        createTestMessage('Message 1'),
        createTestMessage('Message 2'),
        createTestMessage('Message 3'),
      ];

      // Act - 複数メッセージを順次実行
      messages.forEach((msg, index) => {
        expect(() => instance.execute(msg)).toThrow('Default mock error');

        // Assert - 各実行後の統計確認
        expect(instance.getStats().callCount).toBe(index + 1);
        expect(instance.getStats().lastMessage).toEqual(msg);
      });

      // Assert - 最終統計確認
      expect(instance.getStats().callCount).toBe(3);
      expect(instance.getStats().lastMessage).toEqual(messages[2]);
    });
  });

  describe('エラーハンドリング統合', () => {
    it('errorThrowのエラーを外部でキャッチして処理できる', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, 'Integration error test');
      const testMessage = createTestMessage();

      let caughtError: Error | null = null;

      // Act - エラーをキャッチ
      try {
        instance.execute(testMessage);
      } catch (error) {
        caughtError = error as Error;
      }

      // Assert - エラーが正しくキャッチされる
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe('Integration error test');

      // Assert - 統計も正しく更新される
      expect(instance.getStats().callCount).toBe(1);
      expect(instance.getStats().lastMessage).toEqual(testMessage);
    });

    it('エラーメッセージ変更後のエラーハンドリング', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - 初回エラー
      let firstError: Error | null = null;
      try {
        instance.execute(testMessage);
      } catch (error) {
        firstError = error as Error;
      }

      // Act - メッセージ変更後のエラー
      instance.setErrorMessage('Changed error for integration');
      let secondError: Error | null = null;
      try {
        instance.execute(testMessage);
      } catch (error) {
        secondError = error as Error;
      }

      // Assert - 異なるエラーメッセージがキャッチされる
      expect(firstError?.message).toBe('Default mock error');
      expect(secondError?.message).toBe('Changed error for integration');

      // Assert - 統計は累積される
      expect(instance.getStats().callCount).toBe(2);
    });
  });
});
