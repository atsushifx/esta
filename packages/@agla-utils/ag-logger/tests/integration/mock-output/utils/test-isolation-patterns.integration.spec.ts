// tests/integration/mock-output/utils/e2e-test-isolation.integration.spec.ts
// @(#) : E2E Test Isolation Integration Tests - Test isolation, lifecycle, and concurrent access patterns
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// constants
import { AG_LOGLEVEL } from '@/index';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（ロガー）: E2E実装
import { MockFormatter } from '@/index';
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

// Test Utilities
const testSetup = (_ctx: TestContext): { mockLogger: E2eMockLogger } => {
  const _mockLogger = new E2eMockLogger(_ctx.task.id);
  // 初期設定
  vi.clearAllMocks();
  AgLogger.resetSingleton();
  vi.clearAllMocks();
  // テスト開始時にロガーを初期化

  // 終了設定
  _ctx.onTestFinished(() => {
    _mockLogger.endTest();
    AgLogger.resetSingleton();
    vi.clearAllMocks();
  });

  return { mockLogger: _mockLogger };
};

/**
 * E2E Test Isolation Integration Tests
 *
 * @description E2Eテスト分離とライフサイクル管理、並行アクセスパターンの統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('E2E Test Isolation Integration', () => {
  /**
   * Given: テストID分離シナリオが存在する場合
   * When: 複数ケースでテストIDによる分離が適用された時
   * Then: 複数ケースにわたってテストIDでメッセージを正しく分離する
   *
   * @description テストID分離での統合テスト
   * 複数テストケースでのID分離によるメッセージ管理を検証
   */
  describe('Given test ID isolation scenarios exist', () => {
    describe('When test ID-based isolation is applied across multiple cases', () => {
      it('Then should isolate messages correctly by test ID across multiple cases', (_ctx) => {
        const { mockLogger } = testSetup(_ctx);

        const logger = AgLogger.createLogger({
          // E2eMockLoggerのレベル別ロガーを使う（AgLogger側のレベルで正しく振り分け）
          loggerMap: mockLogger.createLoggerMap(),
          // メッセージ本文のみを格納（期待値の生文字列に整合）
          formatter: MockFormatter.messageOnly,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // test-1: INFO/ERROR を記録
        mockLogger.startTest('test-1');
        logger.info('message from test 1');
        logger.error('error from test 1');
        expect(mockLogger.getMessages(4)).toEqual(['message from test 1']);
        expect(mockLogger.getMessages(2)).toEqual(['error from test 1']);
        mockLogger.endTest('test-1');

        // test-2: INFO/WARN を記録（ERRORは0件）
        mockLogger.startTest('test-2');
        logger.info('message from test 2');
        logger.warn('warning from test 2');
        expect(mockLogger.getMessages(4)).toEqual(['message from test 2']);
        expect(mockLogger.getMessages(3)).toEqual(['warning from test 2']);
        expect(mockLogger.getMessages(2)).toHaveLength(0);

        mockLogger.endTest('test-2');
      });
    });
  });

  /**
   * Given: インスタンス分離シナリオが存在する場合
   * When: 異なるロガーインスタンス間で分離が適用された時
   * Then: 異なるロガーインスタンス間でメッセージを分離する
   *
   * @description インスタンス分離での統合テスト
   * 複数ロガーインスタンス間でのメッセージ分離機能を検証
   */
  describe('Given instance isolation scenarios exist', () => {
    describe('When isolation is applied between different logger instances', () => {
      it('Then should isolate messages between different logger instances', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const mockLogger1 = new E2eMockLogger('instance-1');
        const mockLogger2 = new E2eMockLogger('instance-2');
        mockLogger1.startTest(`${ctx.task.id}-1`);
        mockLogger2.startTest(`${ctx.task.id}-2`);

        const logger = AgLogger.createLogger({
          loggerMap: mockLogger1.createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        // インスタンス1へ出力
        logger.info('message from instance 1');
        // 宛先をインスタンス2へ切替
        logger.setLoggerConfig({ loggerMap: mockLogger2.createLoggerMap() });
        logger.info('message from instance 2');

        expect(mockLogger1.getMessages(4)).toEqual(['message from instance 1']);
        expect(mockLogger2.getMessages(4)).toEqual(['message from instance 2']);

        mockLogger1.endTest(`${ctx.task.id}-1`);
        mockLogger2.endTest(`${ctx.task.id}-2`);
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });

  /**
   * Given: 複数インスタンス管理シナリオが存在する場合
   * When: 複数インスタンスが同時に管理される時
   * Then: メッセージ混在なしで複数インスタンスを管理する
   *
   * @description 複数インスタンス管理での統合テスト
   * 同時実行される複数インスタンスでのメッセージ管理を検証
   */
  describe('Given multiple instance management scenarios exist', () => {
    describe('When managing multiple instances concurrently', () => {
      it('Then should manage multiple instances without message mixing', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const count = 6;
        const mocks = Array.from({ length: count }, (_, i) => new E2eMockLogger(`mgr-${i}`));
        const testIds = mocks.map((m, i) => `${ctx.task.id}-${i}`);
        testIds.forEach((id, i) => mocks[i].startTest(id));

        const logger = AgLogger.createLogger({
          loggerMap: mocks[0].createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        // 各インスタンスに固有メッセージを書き込む
        for (let i = 0; i < count; i++) {
          logger.setLoggerConfig({ loggerMap: mocks[i].createLoggerMap() });
          logger.info(`message from logger ${i}`);
          logger.warn(`warning from logger ${i}`);
        }

        // 混在せず各インスタンスに格納されていることを確認
        for (let i = 0; i < count; i++) {
          expect(mocks[i].getMessages(4)).toEqual([`message from logger ${i}`]);
          expect(mocks[i].getMessages(3)).toEqual([`warning from logger ${i}`]);
        }

        testIds.forEach((id, i) => mocks[i].endTest(id));
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });

  /**
   * Given: テストライフサイクル管理シナリオが存在する場合
   * When: ライフサイクル管理が適用された時
   * Then: 包括的なエラーハンドリングで適切なテストライフサイクルを強制する
   *
   * @description テストライフサイクル管理での統合テスト
   * テストライフサイクル全体でのエラーハンドリングと制御を検証
   */
  describe('Given test lifecycle management scenarios exist', () => {
    describe('When lifecycle management is applied', () => {
      it('Then should enforce proper test lifecycle with comprehensive error handling', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const mockLogger = new E2eMockLogger('lifecycle');
        const logger = AgLogger.createLogger({
          loggerMap: mockLogger.createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        // start前は例外
        expect(() => logger.info('before start')).toThrow(/No active test\./);

        // start後は記録できる
        mockLogger.startTest(`${ctx.task.id}-life-1`);
        logger.info('after start');
        expect(mockLogger.getMessages(4)).toEqual(['after start']);

        // end後は再び例外
        mockLogger.endTest(`${ctx.task.id}-life-1`);
        expect(() => logger.info('after end')).toThrow(/No active test\./);

        // 2回目のstart後も正常に記録できる
        mockLogger.startTest(`${ctx.task.id}-life-2`);
        logger.info('second test message');
        expect(mockLogger.getMessages(4)).toEqual(['second test message']);

        mockLogger.endTest(`${ctx.task.id}-life-2`);
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });

  /**
   * Given: 並行アクセスシナリオが存在する場合
   * When: 並行アクセスパターンが実行された時
   * Then: 並行アクセスパターンを安全かつ効率的に処理する
   *
   * @description 並行アクセスパターンでの統合テスト
   * 並行実行環境でのアクセスパターンと安全性を検証
   */
  describe('Given concurrent access scenarios exist', () => {
    describe('When concurrent access patterns are executed', () => {
      it('Then should handle concurrent access patterns safely and efficiently', (ctx) => {
        vi.clearAllMocks();
        AgLogger.resetSingleton();

        const mockLogger1 = new E2eMockLogger('concurrent-1');
        const mockLogger2 = new E2eMockLogger('concurrent-2');
        mockLogger1.startTest(`${ctx.task.id}-c1`);
        mockLogger2.startTest(`${ctx.task.id}-c2`);

        const logger = AgLogger.createLogger({
          loggerMap: mockLogger1.createLoggerMap(),
          formatter: (log) => String(log.message),
        });
        logger.logLevel = 4; // INFO

        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
          logger.setLoggerConfig({ loggerMap: mockLogger1.createLoggerMap() });
          logger.info(`concurrent message 1-${i}`);
          logger.setLoggerConfig({ loggerMap: mockLogger2.createLoggerMap() });
          logger.info(`concurrent message 2-${i}`);
        }

        const messages1 = mockLogger1.getMessages(4);
        const messages2 = mockLogger2.getMessages(4);
        expect(messages1).toHaveLength(iterations);
        expect(messages2).toHaveLength(iterations);
        messages1.forEach((message, index) => {
          expect(message).toBe(`concurrent message 1-${index}`);
        });
        messages2.forEach((message, index) => {
          expect(message).toBe(`concurrent message 2-${index}`);
        });

        mockLogger1.endTest(`${ctx.task.id}-c1`);
        mockLogger2.endTest(`${ctx.task.id}-c2`);
        AgLogger.resetSingleton();
        vi.clearAllMocks();
      });
    });
  });
});
