// tests/integration/agManagerUtils/core/creation.integration.spec.ts
// @(#) : AgManagerUtils Core Creation Integration Tests - Manager creation verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

// テスト対象: AgManagerUtils（ユーティリティ）と依存（AgLogger, Manager）
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';
import { AgManager, createManager, getLogger } from '@/AgManagerUtils';

/**
 * テストユーティリティ: 各テスト終了時にシングルトンとモックを初期化
 */
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';

const setupTestContext = (_ctx?: TestContext): {
  mockLogger: InstanceType<typeof MockLogger.buffer>;
  mockFormatter: AgMockConstructor;
} => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = MockFormatter.passthrough;

  // 初期設定
  AgLoggerManager.resetSingleton();

  _ctx?.onTestFinished(() => {
    AgLoggerManager.resetSingleton();
  });

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

/**
 * AgManagerUtils Core Creation Integration Tests
 *
 * @description ユーティリティ経由のマネージャ生成の統合確認
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgManagerUtils Core Creation Integration', () => {
  /**
   * Given: マネージャが未生成の状態
   * When: AgManagerUtils.createManager() でマネージャを生成した時
   * Then: 内部状態(AgManager)が設定され getLogger() が AgLogger を返す
   */
  describe('Given manager is not yet created', () => {
    describe('When creating a manager via AgManagerUtils.createManager()', () => {
      // 目的: ユーティリティ経由の生成でAgManagerが設定されることを確認
      it('Then should set AgManager and getLogger() should return AgLogger', (_ctx) => {
        setupTestContext(_ctx);

        // Given: 初期状態の確認（未生成）
        expect(AgManager).toBeUndefined();

        // When: ユーティリティでマネージャ生成
        const manager = createManager();

        // Then: AgManager が設定されている
        expect(AgManager).toBeDefined();
        expect(manager).toBeInstanceOf(AgLoggerManager);

        // Then: getLogger() が AgLogger を返す
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });
    });
  });
});
