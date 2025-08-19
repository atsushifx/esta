// src/internal/__tests__/AgLoggerConfig.formatterStats.spec.ts
// @(#) : AgLoggerConfig FormatterStats機能のBDDテスト

import { describe, expect, it } from 'vitest';

// internal
import { AgLoggerConfig } from '../AgLoggerConfig.class';

// types
import type { AgLogMessage } from '../../../shared/types';
import type { AgFormatRoutine, AgFormatterInput } from '../../../shared/types/AgMockConstructor.class';

// plugins
import { AgMockFormatter } from '../../plugins/formatter/AgMockFormatter';
import { JsonFormatter } from '../../plugins/formatter/JsonFormatter';
import { MockFormatter } from '../../plugins/formatter/MockFormatter';

// constants
import { AG_LOGLEVEL } from '../../../shared/types';

/**
 * テスト用ヘルパー: 標準的なテストメッセージを作成
 */
const createTestMessage = (message = 'Test message'): AgLogMessage => ({
  timestamp: new Date('2025-01-01T00:00:00.000Z'),
  logLevel: AG_LOGLEVEL.INFO,
  message,
  args: [],
});

/**
 * AgLoggerConfig FormatterStats機能のatsushifx式BDDテスト
 *
 * @description フォーマッター統計機能の正常系・異常系・エッジケースを網羅したテストスイート
 * atsushifx式BDD: Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Feature: AgLoggerConfig FormatterStats機能', () => {
  /**
   * Feature: Mock Formatter Instance Storage
   * Given: AgMockConstructorを使用したフォーマッター設定
   * When: setLoggerConfigでMockFormatterを設定した時
   * Then: _formatterInstanceが正しく保存される
   */
  describe('Feature: Mock Formatter Instance Storage', () => {
    describe('Given AgMockConstructor-based formatter configuration', () => {
      describe('When setting MockFormatter via setLoggerConfig', () => {
        it('Then should store formatter instance for AgMockFormatter direct usage', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act: AgMockFormatterを直接使用
          const result = config.setLoggerConfig({
            formatter: AgMockFormatter as AgFormatterInput,
          });

          // Assert: 設定成功とインスタンス保存
          expect(result).toBe(true);
          expect(config.hasStatsFormatter()).toBe(true);
          expect(config.getFormatterStats()).not.toBeNull();
        });

        it('Then should store formatter instance for MockFormatter.messageOnly', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act: MockFormatter.messageOnlyを使用
          const result = config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });

          // Assert: 設定成功とインスタンス保存
          expect(result).toBe(true);
          expect(config.hasStatsFormatter()).toBe(true);
          expect(config.getFormatterStats()).not.toBeNull();
        });

        it('Then should store formatter instance for MockFormatter.json', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act: MockFormatter.jsonを使用
          const result = config.setLoggerConfig({
            formatter: MockFormatter.json as AgFormatterInput,
          });

          // Assert: 設定成功とインスタンス保存
          expect(result).toBe(true);
          expect(config.hasStatsFormatter()).toBe(true);
          expect(config.getFormatterStats()).not.toBeNull();
        });

        it('Then should store formatter instance for MockFormatter.errorThrow', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act: MockFormatter.errorThrowを使用
          const result = config.setLoggerConfig({
            formatter: MockFormatter.errorThrow as AgFormatterInput,
          });

          // Assert: 设定成功とインスタンス保存
          expect(result).toBe(true);
          expect(config.hasStatsFormatter()).toBe(true);
          expect(config.getFormatterStats()).not.toBeNull();
        });
      });

      describe('When setting non-MockFormatter via setLoggerConfig', () => {
        it('Then should clear formatter instance for standard formatters', () => {
          // Arrange: 最初にMockFormatterを設定
          const config = new AgLoggerConfig();
          config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });

          // Pre-condition: インスタンスが保存されている
          expect(config.hasStatsFormatter()).toBe(true);

          // Act: 通常のフォーマッターに変更
          const result = config.setLoggerConfig({
            formatter: JsonFormatter,
          });

          // Assert: 設定成功とインスタンスクリア
          expect(result).toBe(true);
          expect(config.hasStatsFormatter()).toBe(false);
          expect(config.getFormatterStats()).toBeNull();
        });
      });
    });
  });

  /**
   * Feature: Statistics Access
   * Given: MockFormatterインスタンスが保存されている状態
   * When: 統計情報にアクセスした時
   * Then: 正しい統計データが取得できる
   */
  describe('Feature: Statistics Access', () => {
    describe('Given MockFormatter instance is stored', () => {
      describe('When accessing formatter statistics', () => {
        it('Then should return initial statistics (callCount: 0, lastMessage: null)', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });

          // Act
          const stats = config.getFormatterStats();

          // Assert: 初期統計値
          expect(stats).not.toBeNull();
          expect(stats!.callCount).toBe(0);
          expect(stats!.lastMessage).toBeNull();
        });

        it('Then should track call count and last message after formatter usage', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });

          const testMessage = createTestMessage('First test message');

          // Act: フォーマッターを使用
          const formatter = config.formatter;
          const result1 = formatter(testMessage);

          // Assert: 統計が更新される
          const stats1 = config.getFormatterStats();
          expect(stats1!.callCount).toBe(1);
          expect(stats1!.lastMessage).toEqual(testMessage);
          expect(result1).toBe('First test message'); // messageOnlyの結果

          // Act: 再度使用
          const testMessage2 = createTestMessage('Second test message');
          const result2 = formatter(testMessage2);

          // Assert: 統計が正しく累積される
          const stats2 = config.getFormatterStats();
          expect(stats2!.callCount).toBe(2);
          expect(stats2!.lastMessage).toEqual(testMessage2);
          expect(result2).toBe('Second test message');
        });

        it('Then should return different stats for different config instances', () => {
          // Arrange: 2つの独立したconfig
          const config1 = new AgLoggerConfig();
          const config2 = new AgLoggerConfig();

          config1.setLoggerConfig({ formatter: MockFormatter.messageOnly as AgFormatterInput });
          config2.setLoggerConfig({ formatter: MockFormatter.messageOnly as AgFormatterInput });

          const testMessage1 = createTestMessage('Config1 message');
          const testMessage2 = createTestMessage('Config2 message');

          // Act: それぞれ異なる回数使用
          config1.formatter(testMessage1);

          config2.formatter(testMessage2);
          config2.formatter(testMessage2);

          // Assert: 独立した統計
          const stats1 = config1.getFormatterStats();
          const stats2 = config2.getFormatterStats();

          expect(stats1!.callCount).toBe(1);
          expect(stats1!.lastMessage).toEqual(testMessage1);

          expect(stats2!.callCount).toBe(2);
          expect(stats2!.lastMessage).toEqual(testMessage2);
        });
      });
    });

    describe('Given no MockFormatter instance is stored', () => {
      describe('When accessing formatter statistics', () => {
        it('Then should return null for uninitialized config', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act
          const stats = config.getFormatterStats();

          // Assert
          expect(stats).toBeNull();
          expect(config.hasStatsFormatter()).toBe(false);
        });

        it('Then should return null after setting standard formatter', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({ formatter: JsonFormatter });

          // Act
          const stats = config.getFormatterStats();

          // Assert
          expect(stats).toBeNull();
          expect(config.hasStatsFormatter()).toBe(false);
        });
      });
    });
  });

  /**
   * Feature: Statistics Reset
   * Given: MockFormatterが使用されて統計が蓄積された状態
   * When: resetFormatterStatsを実行した時
   * Then: 統計がリセットされる
   */
  describe('Feature: Statistics Reset', () => {
    describe('Given MockFormatter has accumulated statistics', () => {
      describe('When calling resetFormatterStats', () => {
        it('Then should reset callCount to 0 and lastMessage to null', () => {
          // Arrange: 統計を蓄積
          const config = new AgLoggerConfig();
          config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });

          const testMessage = createTestMessage('Accumulation test');
          config.formatter(testMessage);
          config.formatter(testMessage);
          config.formatter(testMessage);

          // Pre-condition: 統計が蓄積されている
          const statsBefore = config.getFormatterStats();
          expect(statsBefore!.callCount).toBe(3);
          expect(statsBefore!.lastMessage).toEqual(testMessage);

          // Act: リセット実行
          config.resetFormatterStats();

          // Assert: 統計がリセットされる
          const statsAfter = config.getFormatterStats();
          expect(statsAfter!.callCount).toBe(0);
          expect(statsAfter!.lastMessage).toBeNull();
        });

        it('Then should allow statistics accumulation after reset', () => {
          // Arrange: リセット後の状態
          const config = new AgLoggerConfig();
          config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });

          // 初期蓄積
          config.formatter(createTestMessage('Initial'));
          config.resetFormatterStats();

          // Act: リセット後に再度使用
          const testMessage = createTestMessage('After reset');
          config.formatter(testMessage);

          // Assert: 新しい統計が正しく開始される
          const stats = config.getFormatterStats();
          expect(stats!.callCount).toBe(1);
          expect(stats!.lastMessage).toEqual(testMessage);
        });
      });
    });

    describe('Given no MockFormatter instance is stored', () => {
      describe('When calling resetFormatterStats', () => {
        it('Then should do nothing for uninitialized config', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act: resetFormatterStats実行（何も起こらないはず）
          expect(() => config.resetFormatterStats()).not.toThrow();

          // Assert: 状態は変わらない
          expect(config.hasStatsFormatter()).toBe(false);
          expect(config.getFormatterStats()).toBeNull();
        });

        it('Then should do nothing for standard formatter config', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({ formatter: JsonFormatter });

          // Act: resetFormatterStats実行（何も起こらないはず）
          expect(() => config.resetFormatterStats()).not.toThrow();

          // Assert: 状態は変わらない
          expect(config.hasStatsFormatter()).toBe(false);
          expect(config.getFormatterStats()).toBeNull();
        });
      });
    });
  });

  /**
   * Feature: hasStatsFormatter Method
   * Given: 各種フォーマッター設定状態
   * When: hasStatsFormatterを呼び出した時
   * Then: 正しいブール値が返される
   */
  describe('Feature: hasStatsFormatter Method', () => {
    describe('Given various formatter configuration states', () => {
      describe('When calling hasStatsFormatter', () => {
        it('Then should return false for uninitialized config', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act & Assert
          expect(config.hasStatsFormatter()).toBe(false);
        });

        it('Then should return true for MockFormatter configurations', () => {
          // Arrange & Act & Assert: 各MockFormatterタイプをテスト
          const testCases = [
            MockFormatter.messageOnly,
            MockFormatter.json,
            MockFormatter.passthrough,
            MockFormatter.errorThrow,
            AgMockFormatter,
          ];

          testCases.forEach((FormatterClass, index) => {
            const config = new AgLoggerConfig();
            config.setLoggerConfig({
              formatter: FormatterClass as AgFormatterInput,
            });

            expect(config.hasStatsFormatter(), `Failed for formatter ${index}: ${FormatterClass.constructor.name}`)
              .toBe(true);
          });
        });

        it('Then should return false for standard formatters', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({ formatter: JsonFormatter });

          // Act & Assert
          expect(config.hasStatsFormatter()).toBe(false);
        });

        it('Then should transition correctly between formatter types', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act & Assert: MockFormatter -> Standard -> MockFormatter

          // 初期状態
          expect(config.hasStatsFormatter()).toBe(false);

          // MockFormatterに変更
          config.setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });
          expect(config.hasStatsFormatter()).toBe(true);

          // 標準フォーマッターに変更
          config.setLoggerConfig({ formatter: JsonFormatter });
          expect(config.hasStatsFormatter()).toBe(false);

          // 再度MockFormatterに変更
          config.setLoggerConfig({
            formatter: MockFormatter.json as AgFormatterInput,
          });
          expect(config.hasStatsFormatter()).toBe(true);
        });
      });
    });
  });

  /**
   * Feature: Error Handling and Edge Cases
   * Given: 異常な入力や境界条件
   * When: stats関連メソッドを呼び出した時
   * Then: 適切にエラーハンドリングされる
   */
  describe('Feature: Error Handling and Edge Cases', () => {
    describe('Given abnormal inputs and boundary conditions', () => {
      describe('When calling stats-related methods', () => {
        it('Then should handle null formatter gracefully', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({ formatter: null as unknown as AgFormatterInput });

          // Act & Assert: エラーなく動作する
          expect(() => config.hasStatsFormatter()).not.toThrow();
          expect(() => config.getFormatterStats()).not.toThrow();
          expect(() => config.resetFormatterStats()).not.toThrow();

          expect(config.hasStatsFormatter()).toBe(false);
          expect(config.getFormatterStats()).toBeNull();
        });

        it('Then should handle undefined formatter gracefully', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({ formatter: undefined as unknown as AgFormatterInput });

          // Act & Assert: エラーなく動作する
          expect(() => config.hasStatsFormatter()).not.toThrow();
          expect(() => config.getFormatterStats()).not.toThrow();
          expect(() => config.resetFormatterStats()).not.toThrow();

          expect(config.hasStatsFormatter()).toBe(false);
          expect(config.getFormatterStats()).toBeNull();
        });

        it('Then should handle invalid formatter configuration gracefully', () => {
          // Arrange
          const config = new AgLoggerConfig();
          const invalidFormatter = 'not a function' as unknown as AgFormatterInput;

          // Act: 無効なフォーマッター設定（失敗するはず）
          const result = config.setLoggerConfig({ formatter: invalidFormatter });

          // Assert: 設定失敗とinstance状態のクリア
          expect(result).toBe(false);
          expect(config.hasStatsFormatter()).toBe(false);
          expect(config.getFormatterStats()).toBeNull();
        });

        it('Then should handle multiple rapid configuration changes', () => {
          // Arrange
          const config = new AgLoggerConfig();

          // Act: 高速な設定変更連続実行
          const configurations = [
            MockFormatter.messageOnly,
            JsonFormatter,
            MockFormatter.json,
            JsonFormatter,
            MockFormatter.errorThrow,
          ];

          configurations.forEach((formatter, index) => {
            const result = config.setLoggerConfig({
              formatter: formatter as AgFormatterInput,
            });

            expect(result, `Configuration ${index} failed`).toBe(true);

            // MockFormatterかどうかで期待値を変える
            const isMockFormatter = formatter !== JsonFormatter;
            expect(config.hasStatsFormatter(), `Instance check failed for configuration ${index}`).toBe(
              isMockFormatter,
            );
          });

          // Assert: 最終状態はMockFormatter
          expect(config.hasStatsFormatter()).toBe(true);
          expect(config.getFormatterStats()).not.toBeNull();
        });

        it('Then should maintain independence between multiple config instances', () => {
          // Arrange: 複数のconfig並行操作
          const configs = Array.from({ length: 3 }, () => new AgLoggerConfig());

          // Act: 異なる設定を並行実行
          configs[0].setLoggerConfig({
            formatter: MockFormatter.messageOnly as AgFormatterInput,
          });
          configs[1].setLoggerConfig({ formatter: JsonFormatter });
          configs[2].setLoggerConfig({
            formatter: MockFormatter.errorThrow as AgFormatterInput,
          });

          // Assert: 各configが独立している
          expect(configs[0].hasStatsFormatter()).toBe(true);
          expect(configs[1].hasStatsFormatter()).toBe(false);
          expect(configs[2].hasStatsFormatter()).toBe(true);

          // 統計操作の独立性
          configs[0].formatter(createTestMessage('Config 0'));

          // configs[2]はerrorThrowなので例外をキャッチ
          expect(() => configs[2].formatter(createTestMessage('Config 2'))).toThrow();
          expect(() => configs[2].formatter(createTestMessage('Config 2 second'))).toThrow();

          expect(configs[0].getFormatterStats()!.callCount).toBe(1);
          expect(configs[1].getFormatterStats()).toBeNull();
          expect(configs[2].getFormatterStats()!.callCount).toBe(2);
        });

        it('Then should handle ErrorThrowFormatter statistics correctly', () => {
          // Arrange
          const config = new AgLoggerConfig();
          config.setLoggerConfig({
            formatter: MockFormatter.errorThrow as AgFormatterInput,
          });

          const testMessage = createTestMessage('Error test');

          // Act & Assert: エラーが投げられても統計は更新される
          expect(() => config.formatter(testMessage)).toThrow();

          const stats = config.getFormatterStats();
          expect(stats!.callCount).toBe(1);
          expect(stats!.lastMessage).toEqual(testMessage);

          // 複数回実行
          expect(() => config.formatter(testMessage)).toThrow();
          expect(() => config.formatter(testMessage)).toThrow();

          const finalStats = config.getFormatterStats();
          expect(finalStats!.callCount).toBe(3);
          expect(finalStats!.lastMessage).toEqual(testMessage);
        });

        it('Then should handle stats access during formatter execution', () => {
          // Arrange: カスタムルーチンで統計アクセスを試行
          const config = new AgLoggerConfig();
          let statsAccessResult: { callCount: number; lastMessage: AgLogMessage | null } | null = null;

          // カスタムルーチンを作成（実行中に統計にアクセス）
          const customRoutine: AgFormatRoutine = (msg) => {
            // フォーマッター実行中に統計アクセス（再帰的アクセス）
            statsAccessResult = config.getFormatterStats();
            return `Processed: ${msg.message}`;
          };

          const CustomFormatter = class extends AgMockFormatter {
            static readonly __isMockConstructor = true as const;
            constructor() {
              super(customRoutine);
            }
          };

          config.setLoggerConfig({
            formatter: CustomFormatter as AgFormatterInput,
          });

          // Act: フォーマッター実行
          const result = config.formatter(createTestMessage('Recursive test'));

          // Assert: 実行完了と統計の一貫性
          expect(result).toBe('Processed: Recursive test');
          expect(statsAccessResult).not.toBeNull();

          // 実行後の統計確認
          const finalStats = config.getFormatterStats();
          expect(finalStats!.callCount).toBe(1);
        });
      });
    });
  });
});
