// tests/integration/agLoggerManager/management/loggerMap.integration.spec.ts
// @(#) : AgLoggerManager Management Logger Map Integration Tests - Logger map management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有型・定数: ログレベル定義と型
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgLoggerFunction, AgLogLevel } from '@/shared/types';
import type { AgLoggerMap } from '@/shared/types';

// テスト対象: マネージャ本体
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: 出力先実装とダミー
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { NullLogger } from '@/plugins/logger/NullLogger';

/**
 * AgLoggerManager Management Logger Map Integration Tests
 *
 * @description ロガーマップ管理機能の統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Mock Output Logger Map Management Integration', () => {
  const setupTestContext = (): { mockLogger: AgMockBufferLogger; mockFormatter: typeof MockFormatter.passthrough } => {
    vi.clearAllMocks();
    // Reset singleton instance for clean test state
    AgLoggerManager.resetSingleton();

    return {
      mockLogger: new MockLogger.buffer(),
      mockFormatter: MockFormatter.passthrough,
    };
  };

  /**
   * Given: 複雑なロガーマップ設定が存在する場合
   * When: 完全なロガーマップを上書き設定した時
   * Then: 各レベルで適切なロガーが使用される
   */
  describe('Given logger map configuration changes', () => {
    describe('When performing complete map override', () => {
      // 目的: ロガーマップ全面上書きの適用確認
      it('Then should replace entire configuration cleanly', () => {
        setupTestContext();

        // Given: レベル別の専用ロガー
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance) as AgLoggerFunction;
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance) as AgLoggerFunction;
        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance) as AgLoggerFunction;

        const loggerMap: Partial<AgLoggerMap> = {
          [AG_LOGLEVEL.OFF]: NullLogger,
          [AG_LOGLEVEL.FATAL]: errorLogger,
          [AG_LOGLEVEL.ERROR]: errorLogger,
          [AG_LOGLEVEL.WARN]: NullLogger, // return default logger
          [AG_LOGLEVEL.INFO]: NullLogger, // return default logger
          [AG_LOGLEVEL.DEBUG]: debugLogger,
          [AG_LOGLEVEL.TRACE]: debugLogger,
        };

        // When: 完全なロガーマップで設定
        const manager = AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: loggerMap,
        });
        const logger = manager.getLogger();

        // Then: 各レベルで適切なロガーが使用される
        expect(logger.getLoggerFunction(AG_LOGLEVEL.OFF)).toBe(NullLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.TRACE)).toBe(debugLogger);
      });
    });

    describe('When applying partial configuration updates', () => {
      // 目的: 部分的なロガーマップ適用時のフォールバック確認
      it('Then should merge new settings with existing configuration', () => {
        setupTestContext();

        // Given: 部分的なロガーマップ設定
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance);

        const partialLoggerMap = {
          [AG_LOGLEVEL.ERROR]: errorLogger,
          [AG_LOGLEVEL.DEBUG]: debugLogger,
        };

        // When: 部分的なマップで設定
        AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: partialLoggerMap,
        });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // Then: 指定されたレベルは専用ロガー使用
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);

        // Then: 未指定レベルはデフォルトロガー使用
        expect(logger.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.TRACE)).toBe(defaultLogger);
      });
    });
  });

  /**
   * Given: ロガーマップが未設定の環境が存在する場合
   * When: マップエントリーが存在しないレベルにアクセスした時
   * Then: デフォルトロガーへのフォールバックが発生する
   */
  describe('Given configuration edge cases', () => {
    describe('When handling missing configuration entries', () => {
      // 目的: マップ未設定レベルでのdefaultロガーへのフォールバック
      it('Then should provide appropriate fallback behavior', () => {
        setupTestContext();

        // Given: マップ未設定の環境
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: defaultLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 全レベルにアクセス（OFF以外）
        // Then: 全てデフォルトロガーを返す
        Object.values(AG_LOGLEVEL)
          .filter((level) => level !== AG_LOGLEVEL.OFF) // off: NullLogger
          .filter((level) => typeof level === 'number')
          .forEach((level) => {
            expect(logger.getLoggerFunction(level as AgLogLevel)).toBe(defaultLogger);
          });
      });
    });

    describe('When processing empty logger map configuration', () => {
      // 目的: 空のロガーマップ指定時の挙動確認
      it('Then should manage empty configurations without system failure', () => {
        setupTestContext();

        // Given: 空のロガーマップ設定
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: {},
        });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 全レベルにアクセス
        // Then: 全てデフォルトロガーを使用
        Object.values(AG_LOGLEVEL)
          .filter((level) => level !== AG_LOGLEVEL.OFF)
          .filter((level) => typeof level === 'number')
          .forEach((level) => {
            expect(logger.getLoggerFunction(level as AgLogLevel)).toBe(defaultLogger);
          });
      });
    });
  });

  /**
   * Given: undefined値を含むロガーマップが存在する場合
   * When: undefined値のマップエントリーにアクセスした時
   * Then: デフォルトロガーへの安全なフォールバックが発生する
   */
  describe('Given configuration edge cases', () => {
    describe('When processing undefined values', () => {
      // 目的: ロガーマップにundefinedを含む場合の安定性
      it('Then should handle undefined inputs gracefully', () => {
        setupTestContext();

        // Given: undefined値を含むマップ設定
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: undefined値を含むマップで設定更新
        manager.setLoggerConfig({
          defaultLogger,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: undefined,
          },
        });

        // Then: undefined値の場合はデフォルトロガーにフォールバック
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(defaultLogger);
      });
    });
  });

  /**
   * Given: ロガーマップの動的更新が必要な環境が存在する場合
   * When: 実行時にロガーマップを更新した時
   * Then: 既存のロガーインスタンスに変更が即座に反映される
   */
  describe('Given dynamic logger map updates are required', () => {
    describe('When updating logger map at runtime', () => {
      // 目的: 動的なロガーマップ更新の即時反映
      it('Then should immediately apply logger map updates to existing instances', () => {
        setupTestContext();

        // Given: 初期設定のマネージャー
        const initialDefaultLoggerInstance = new MockLogger.buffer();
        const initialDefaultLogger = initialDefaultLoggerInstance.info.bind(initialDefaultLoggerInstance);
        const manager = AgLoggerManager.createManager({
          defaultLogger: initialDefaultLogger,
          formatter: PlainFormatter,
        });
        const logger = manager.getLogger();

        // When: ロガーマップの動的更新
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
            [AG_LOGLEVEL.DEBUG]: debugLogger,
          },
        });

        // Then: 既存インスタンスに変更が即座に反映
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(initialDefaultLogger); // 未変更
      });
    });

    describe('When performing multiple sequential logger map updates', () => {
      // 目的: 連続的なマップ更新の累積効果
      it('Then should handle sequential map updates with cumulative effects', () => {
        setupTestContext();

        // Given: 基本設定のマネージャー
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        const manager = AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
        });
        const logger = manager.getLogger();

        // When: 段階的なマップ更新（各回で全マップを設定）
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: errorLogger },
        });

        const warnLoggerInstance = new MockLogger.buffer();
        const warnLogger = warnLoggerInstance.warn.bind(warnLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger, // 既存設定を保持
            [AG_LOGLEVEL.WARN]: warnLogger,
          },
        });

        const debugLoggerInstance = new MockLogger.buffer();
        const debugLogger = debugLoggerInstance.debug.bind(debugLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger, // 既存設定を保持
            [AG_LOGLEVEL.WARN]: warnLogger, // 既存設定を保持
            [AG_LOGLEVEL.DEBUG]: debugLogger,
          },
        });

        // Then: 最終的な設定が適用される
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(warnLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger); // 未変更
      });
    });
  });
});
