// tests/integration/agLoggerManager/management/singleton.integration.spec.ts
// @(#) : AgLoggerManager Management Singleton Integration Tests - Manager singleton behavior
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework: execution, assertion, mocking
import { describe, expect, it, vi } from 'vitest';

// Shared types and constants: log levels and type definitions
import { AG_LOGLEVEL } from '@/shared/types';

// Test targets: main classes under test
import { AgLoggerManager } from '@/AgLoggerManager.class';

// Plugin implementations: formatters and loggers
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';

/**
 * AgLoggerManager Management Singleton Integration Tests
 *
 * @description マネージャーのシングルトン動作を保証する統合テスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Mock Output Singleton Management Integration', () => {
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
   * Given: AgLoggerManagerの複数アクセスパターンが存在する場合
   * When: 異なる方法でマネージャーにアクセスした時
   * Then: 同一のシングルトンインスタンスが返される
   */
  describe('Given multiple access points to manager', () => {
    describe('When accessing manager from different contexts', () => {
      // 目的: getManager呼び出し間でシングルトン性が維持される
      it('Then should return identical singleton instance consistently', () => {
        setupTestContext();

        // When: マネージャーを作成し、複数回取得
        const tempLoggerInstance = new MockLogger.buffer();
        const tempLogger = tempLoggerInstance.info.bind(tempLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: tempLogger, formatter: JsonFormatter });
        const manager1 = AgLoggerManager.getManager();
        const manager2 = AgLoggerManager.getManager();

        // Then: 同一インスタンス
        expect(manager1).toBe(manager2);
      });
    });

    describe('When accessing configuration from multiple instances', () => {
      // 目的: 複数回アクセス時に設定の一貫性が保たれる
      it('Then should maintain consistent configuration across access attempts', () => {
        setupTestContext();

        // Given: 設定済みマネージャー
        const mockLoggerInstance = new MockLogger.buffer();
        const mockLogger = mockLoggerInstance.info.bind(mockLoggerInstance);
        const mockFormatter = vi.fn().mockReturnValue('test output');

        AgLoggerManager.createManager({ defaultLogger: mockLogger, formatter: mockFormatter });

        // When: 複数のインスタンス参照を取得
        const manager1 = AgLoggerManager.getManager();
        const manager2 = AgLoggerManager.getManager();
        const logger1 = manager1.getLogger();
        const logger2 = manager2.getLogger();

        // Then: 両方から取得したロガーが同一の機能を提供
        expect(logger1.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(logger2.getLoggerFunction(AG_LOGLEVEL.INFO));
      });
    });
  });

  /**
   * Given: マネージャーの初期化競合シナリオが存在する場合
   * When: 複数回の初期化を試行した時
   * Then: 最初の初期化のみが有効となり、後続は適切にエラーとなる
   */
  describe('Given initialization conflicts', () => {
    describe('When encountering concurrent initialization attempts', () => {
      // 目的: 複数回の初期化パラメータ指定で設定が更新される挙動を確認
      it('Then should handle initialization conflicts gracefully', () => {
        setupTestContext();

        // Given: 異なる設定パラメータ
        const firstLoggerInstance = new MockLogger.buffer();
        const firstLogger = firstLoggerInstance.info.bind(firstLoggerInstance);
        const secondLoggerInstance = new MockLogger.buffer();
        const secondLogger = secondLoggerInstance.info.bind(secondLoggerInstance);
        const firstFormatter = vi.fn().mockReturnValue('first');

        // When: 最初の初期化
        AgLoggerManager.createManager({ defaultLogger: firstLogger, formatter: firstFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // Then: 二回目の初期化は失敗
        expect(() => AgLoggerManager.createManager({ defaultLogger: secondLogger }))
          .toThrow();

        // Then: 設定は最初の初期化のまま維持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(firstLogger);
      });
    });

    describe('When initialization occurs after singleton reset', () => {
      // 目的: リセット後の再初期化が正常動作することを確認
      it('Then should allow re-initialization after singleton reset', () => {
        setupTestContext();

        // Given: 初期のマネージャー設定
        const firstLoggerInstance = new MockLogger.buffer();
        const firstLogger = firstLoggerInstance.info.bind(firstLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: firstLogger, formatter: JsonFormatter });
        const firstManager = AgLoggerManager.getManager();

        // When: シングルトンリセット後の再初期化
        AgLoggerManager.resetSingleton();
        const secondLoggerInstance = new MockLogger.buffer();
        const secondLogger = secondLoggerInstance.info.bind(secondLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: secondLogger, formatter: JsonFormatter });
        const secondManager = AgLoggerManager.getManager();

        // Then: 新しいインスタンスが作成される
        expect(firstManager).not.toBe(secondManager);
        expect(secondManager.getLogger().getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(secondLogger);
      });
    });
  });

  /**
   * Given: マネージャー状態の一貫性が重要な環境が存在する場合
   * When: 状態変更と参照取得を並行して実行した時
   * Then: 状態の一貫性が維持される
   */
  describe('Given singleton state consistency requirements', () => {
    describe('When verifying state consistency across access points', () => {
      // 目的: 並行アクセス時のマネージャー状態一貫性
      it('Then should maintain consistent state regardless of access method', () => {
        setupTestContext();

        // Given: 初期マネージャー
        const initialLoggerInstance = new MockLogger.buffer();
        const initialLogger = initialLoggerInstance.info.bind(initialLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: initialLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 状態変更と参照取得を並行実行
        const updatedLoggerInstance = new MockLogger.buffer();
        const updatedLogger = updatedLoggerInstance.info.bind(updatedLoggerInstance);
        manager.setLoggerConfig({ defaultLogger: updatedLogger });

        // 複数の並行アクセス
        const logger1 = manager.getLogger();
        const logger2 = manager.getLogger();
        const logger3 = manager.getLogger();

        // Then: 全ての参照が同一の更新された状態を反映
        expect(logger1.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(updatedLogger);
        expect(logger2.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(updatedLogger);
        expect(logger3.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(updatedLogger);
        expect(logger1.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(logger2.getLoggerFunction(AG_LOGLEVEL.INFO));
      });
    });
  });
});
