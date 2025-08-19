// tests/integration/agManagerUtils/core/deletion.integration.spec.ts
// @(#) : AgManagerUtils Core Deletion Integration Tests - Manager disposal verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数/型: エラーメッセージ
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../../../shared/constants/agErrorMessages';

// テスト対象: AgManagerUtils（ユーティリティ）と依存（AgLoggerManager）
import { AgLoggerManager } from '@/AgLoggerManager.class';
import { AgManager, createManager, getLogger, setupManager } from '@/AgManagerUtils';

/**
 * テストユーティリティ: 各テスト終了時にシングルトンとモックを初期化
 */
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';

const setupTestContext = (_ctx?: TestContext): {
  mockLogger: AgMockBufferLogger;
  mockFormatter: typeof MockFormatter.passthrough;
} => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = MockFormatter.passthrough;

  // 初期設定
  AgLoggerManager.resetSingleton();

  // 終了設定
  _ctx?.onTestFinished(() => {
    AgLoggerManager.resetSingleton();
  });

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

/**
 * AgManagerUtils Core Deletion Integration Tests
 *
 * @description ユーティリティ経由のマネージャ破棄の統合確認
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgManagerUtils Core Deletion Integration', () => {
  /**
   * Given: AgManagerUtils でマネージャが生成されている
   * When: AgLoggerManager.resetSingleton() を呼び出した時
   * Then: AgManager が未定義に戻り、getLogger() は初期化エラーを投げる
   */
  describe('Given manager is created via AgManagerUtils', () => {
    describe('When resetting manager via AgLoggerManager.resetSingleton()', () => {
      // 目的: resetSingleton によりユーティリティの内部状態もクリアされることを確認
      it('Then should clear AgManager and getLogger() should throw initialization error', (ctx) => {
        setupTestContext(ctx);

        // Given: セットアップフックを有効化（reset時にAgManagerも同期クリア）
        setupManager();

        // Given: マネージャをユーティリティ経由で生成
        createManager();
        expect(AgManager).toBeDefined();

        // When: マネージャを破棄
        AgLoggerManager.resetSingleton();

        // Then: 内部状態がクリアされ、getLogger は初期化エラー
        expect(AgManager).toBeUndefined();
        expect(() => getLogger()).toThrowError(
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
        );
      });
    });
  });
});
