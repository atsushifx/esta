// tests/integration/agManagerUtils/errorHandling/initialization.integration.spec.ts
// @(#) : AgManagerUtils Initialization Error Handling Integration Tests
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数: エラーメッセージ
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../../../shared/constants';

// 対象: ユーティリティ関数とマネージャ
import { AgLoggerManager } from '@/AgLoggerManager.class';
import { AgManager, createManager, getLogger, setupManager } from '@/AgManagerUtils';

// テストユーティリティ: テスト終了時クリーンアップ
const setupTestContext = (ctx: TestContext): void => {
  ctx.onTestFinished(() => {
    AgLoggerManager.resetSingleton();
    vi.clearAllMocks();
  });
};

/**
 * AgManagerUtils Initialization Error Handling Integration
 *
 * @description createManager 二重初期化と getLogger 未初期化時のエラー検証
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgManagerUtils Initialization Error Handling Integration', () => {
  /**
   * Given: すでに AgManagerUtils でマネージャが生成済み
   * When: 再度 createManager() を呼び出した時
   * Then: 二重初期化エラー（エラーメッセージを含む）が発生する
   */
  describe('Given manager is already created', () => {
    describe('When calling createManager() again', () => {
      it('Then should throw initialization error with proper message', (ctx) => {
        setupTestContext(ctx);

        // Given: 初回生成
        setupManager();
        createManager();
        expect(AgManager).toBeDefined();

        // When/Then: 二回目はエラー（メッセージも検証）
        expect(() => createManager()).toThrowError(
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_ALREADY_CREATED,
        );
      });
    });
  });

  /**
   * Given: マネージャ未初期化状態
   * When: getLogger() を呼び出した時
   * Then: 未初期化エラー（エラーメッセージを含む）が発生する
   */
  describe('Given manager is not initialized', () => {
    describe('When calling getLogger()', () => {
      it('Then should throw not-created error with proper message', (ctx) => {
        setupTestContext(ctx);

        // Given: 念のためリセットし AgManager 未定義であることを確認
        setupManager();
        AgLoggerManager.resetSingleton();
        expect(AgManager).toBeUndefined();

        // When/Then: getLogger は未初期化エラー（メッセージ検証）
        expect(() => getLogger()).toThrowError(
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
        );
      });
    });
  });
});
