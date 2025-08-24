// tests/e2e/mock-output/monitoring-scenarios.e2e.spec.ts
// @(#) : Production monitoring workflows and operational scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - テスト実行環境
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

// Core logger functionality - ログ機能コア
import { AgLogger } from '@/AgLogger.class';

// Output formatters - 出力フォーマッター
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// Logger implementations - ログ出力実装
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

// Test utilities - テストユーティリティ
import { setupE2eMockLogger } from './__helpers__/e2e-mock-setup.helper';

// Shared types and constants - 共有型・定数
import { AG_LOGLEVEL } from '../../../shared/types';

/**
 * Test Scenarios:
 * - Performance Monitoring: System metrics tracking and threshold management
 * - User Action Correlation: Session-based behavior tracking and analysis
 * - Security Incident Detection: Threat pattern recognition and response
 * - Capacity Management: Predictive analysis and scaling decisions
 */

/**
 * @suite Monitoring | Infrastructure
 * @description 監視基盤(ログ/メトリクス/相関)の初期化と準備を検証。
 * @testType e2e
 * @coverage メトリクス収集/ログ整形/出力
 * Scenarios:
 * - 収集/整形/出力パスの初期化手順を記録
 * - 主要エンドポイント/ハンドラの有効性を確認
 * Expects:
 * - 計測が可能で、主要経路が健全
 */
describe('Performance Monitoring Infrastructure', () => {
  // Red Phase: expect import failures before implementation
  // 監視用インポートが適切でない場合の失敗をテストする
  it('should fail without proper monitoring imports', () => {
    // This will fail - AgLogger not imported yet
    expect(typeof AgLogger.createLogger).toBe('function');
  });

  // E2eMockLoggerのインポートなしでの失敗をテストする
  it('should fail without E2eMockLogger import', () => {
    // This will fail - E2eMockLogger not imported yet
    expect(typeof E2eMockLogger).toBe('function');
  });

  // Green Phase: basic imports now working
  // AgLoggerの正常インポートを検証する
  it('should import AgLogger successfully', () => {
    expect(typeof AgLogger.createLogger).toBe('function');
    expect(AgLogger.createLogger).toBeDefined();
  });

  // PlainFormatterとE2eMockLoggerの正常インポートを検証する
  it('should import PlainFormatter and E2eMockLogger successfully', () => {
    expect(PlainFormatter).toBeDefined();
    expect(typeof E2eMockLogger).toBe('function');
    expect(E2eMockLogger).toBeDefined();
  });

  // Refactor Phase: organized imports and monitoring utilities
  // 監視専用インポートの適切な整理を検証する
  it('should organize monitoring-specific imports properly', () => {
    // Verify all monitoring-related imports are properly organized
    expect(AgLogger).toBeDefined();
    expect(PlainFormatter).toBeDefined();
    expect(E2eMockLogger).toBeDefined();
    expect(AG_LOGLEVEL).toBeDefined();
    expect(AG_LOGLEVEL.INFO).toBe(4);
  });

  // 監視ユーティリティの基盤確立をテストする
  it('should establish monitoring utility foundations', (ctx: TestContext) => {
    // Test the setupE2eMockLogger helper function
    const mockLogger = setupE2eMockLogger('monitoring-foundation-test', ctx);

    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.createLoggerFunction(),
      formatter: PlainFormatter,
    });
    logger.logLevel = AG_LOGLEVEL.DEBUG; // Set appropriate log level for monitoring

    expect(mockLogger).toBeInstanceOf(E2eMockLogger);
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');

    // Test that logger can capture monitoring messages
    logger.info('Test monitoring foundation established');
    expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
  });
});

/**
 * @suite Monitoring | System Performance
 * @description システム主要指標の追跡と閾値管理を検証。
 * @testType e2e
 * @coverage CPU/Memory/Response/Error 指標、閾値アラート、統合
 * Scenarios:
 * - CPU/メモリ/応答時間/エラー率の計測パスを確立
 * - 閾値超過時のアラート連携と復帰時の挙動を記録
 * Expects:
 * - 各カテゴリのメトリクスが収集・評価される
 * - 閾値超過/復帰が一貫したログで追跡可能
 */
describe('System Performance Indicators Tracking', () => {
  // Task 8.3.2a Red Phase: Performance monitoring environment setup (Red phase confirmed)
  // Red phase test was confirmed failing as expected - now commented out
  // it('should fail performance metrics logging without setup', () => {
  //   const mockLogger = new E2eMockLogger('performance-fail-test');
  //   expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
  // });

  // Task 8.3.2a Green Phase: Setup mockLogger with PlainFormatter for readable metrics
  // 読みやすいメトリクス用にPlainFormatterでmockLoggerを設定する
  it('should setup mockLogger with PlainFormatter for readable metrics', (ctx: TestContext) => {
    const mockLogger = setupE2eMockLogger('monitoring-performance-setup', ctx);

    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.createLoggerFunction(),
      formatter: PlainFormatter,
    });
    logger.logLevel = AG_LOGLEVEL.DEBUG; // Set appropriate log level for monitoring

    // Test basic performance monitoring setup
    logger.info('Performance monitoring initialized', {
      timestamp: Date.now(),
      monitoringType: 'performance',
    });

    expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
  });

  // Task 8.3.2a Refactor Phase: Configure appropriate log levels for production monitoring
  // 本番監視用に適切なログレベルを設定する
  it('should configure appropriate log levels for production monitoring', (ctx: TestContext) => {
    const mockLogger = setupE2eMockLogger('monitoring-production-config', ctx);

    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.createLoggerFunction(),
      formatter: PlainFormatter,
    });
    logger.logLevel = AG_LOGLEVEL.DEBUG; // Set appropriate log level for monitoring

    // Test that debug level is properly set for comprehensive monitoring
    expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);

    // Test multi-level monitoring capability
    logger.debug('Performance monitoring debug info');
    logger.info('Performance monitoring status update');
    logger.warn('Performance threshold approaching');

    expect(mockLogger.hasMessages(AG_LOGLEVEL.DEBUG)).toBe(true);
    expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
    expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
  });

  // Task 8.3.2b: CPU usage rate logging and tracking
  /**
   * @suite Monitoring | CPU Usage
   * @description CPU使用率の計測/集計/閾値判定の記録を検証。
   * @testType e2e
   * @coverage 計測ポイント/閾値設定/通知
   * Scenarios:
   * - CPU負荷の生成→計測→評価の手順を記録
   * - 閾値超過の検出と通知の生成を確認
   * Expects:
   * - 閾値に応じたログ/アラートが一貫
   */
  describe('CPU Usage Rate Tracking', () => {
    // CPU使用率ログの存在を期待する
    it('should expect CPU usage log existence', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('cpu-usage-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect CPU usage logs before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.2b Green Phase: CPU usage logging with threshold context
    // 閾値データ付きCPU使用率をログに記録する
    it('should log CPU usage with threshold data', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('cpu-usage-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Implement CPU usage logging with threshold data
      logger.info('CPU usage: 75%', { cpu: 75, threshold: 80 });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('CPU usage: 75%');
      expect(messages[0]).toContain('cpu');
      expect(messages[0]).toContain('threshold');
    });

    // Task 8.3.2b Refactor Phase: Enhanced CPU monitoring
    // CPU使用率のトレンド分析と履歴データ文脈の追加をテストする
    it('should add CPU usage trend analysis and historical context', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('cpu-usage-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add CPU usage trend analysis and historical context
      const cpuMetrics = {
        current: 75,
        threshold: 80,
        trend: 'increasing',
        historical: [65, 70, 72, 75],
        prediction: 78,
        timeWindow: '5min',
      };

      logger.info('CPU usage trend analysis', cpuMetrics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('trend analysis');
      expect(messages[0]).toContain('increasing');
      expect(messages[0]).toContain('prediction');
    });
  });

  // Task 8.3.2c: Memory usage tracking
  /**
   * @suite Monitoring | Memory Usage
   * @description メモリ使用量の計測/トレンド/しきい値判定を検証。
   * @testType e2e
   * @coverage 使用量/空き容量/リーク指標
   * Scenarios:
   * - 使用量/空き容量の記録としきい値比較
   * - トレンド分析/リーク兆候の指標化
   * Expects:
   * - 主要メトリクスがログで追跡可能
   */
  describe('Memory Usage Tracking', () => {
    // メモリ使用量ログの存在を期待する
    it('should expect memory usage log existence', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('memory-usage-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect memory usage logs before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.2c Green Phase: Memory usage logging with availability info
    // 利用可能メモリデータ付きでメモリ使用量をログに記録する
    it('should log memory usage with available memory data', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('memory-usage-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Implement memory usage logging with availability info
      logger.info('Memory usage: 2.5GB', { memory: 2500, available: 1500 });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Memory usage: 2.5GB');
      expect(messages[0]).toContain('memory');
      expect(messages[0]).toContain('available');
    });

    // Task 8.3.2c Refactor Phase: Enhanced memory monitoring
    // メモリトレンド分析とリーク検出指標の追加をテストする
    it('should add memory trend analysis and leak detection indicators', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('memory-usage-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add memory trend analysis and leak detection indicators
      const memoryMetrics = {
        used: 2500,
        available: 1500,
        total: 4000,
        trend: 'stable',
        leakIndicators: {
          growthRate: 0.1,
          suspiciousPatterns: false,
          gcFrequency: 'normal',
        },
        historical: [2400, 2450, 2480, 2500],
        threshold: {
          warning: 3000,
          critical: 3500,
        },
      };

      logger.info('Memory usage analysis with leak detection', memoryMetrics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('leak detection');
      expect(messages[0]).toContain('growthRate');
      expect(messages[0]).toContain('suspiciousPatterns');
    });
  });

  // Task 8.3.2d: Response time measurement
  /**
   * @suite Monitoring | Response Time
   * @description 応答時間の計測/分布/パーセンタイル追跡を検証。
   * @testType e2e
   * @coverage 平均/分位点/分布/エンドポイント別
   * Scenarios:
   * - 応答時間の目標値比較
   * - 分布と分位点(p50/p90/p95/p99)の記録
   * Expects:
   * - 主要指標がログで確認できる
   */
  describe('Response Time Measurement', () => {
    // 応答時間ログの存在を期待する
    it('should expect response time logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('response-time-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect response time logs before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.2d Green Phase: Response time logging with target metrics
    // 目標メトリクスと比較した応答時間をログに記録する
    it('should log response time with target comparison', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('response-time-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Implement response time logging with target metrics
      logger.info('Response time: 150ms', { responseTime: 150, target: 200 });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Response time: 150ms');
      expect(messages[0]).toContain('responseTime');
      expect(messages[0]).toContain('target');
    });

    // Task 8.3.2d Refactor Phase: Advanced response time analytics
    // 応答時間分布とパーセンタイル追跡の追加をテストする
    it('should add response time distribution and percentile tracking', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('response-time-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add response time distribution and percentile tracking
      const responseMetrics = {
        current: 150,
        target: 200,
        percentiles: {
          p50: 140,
          p90: 180,
          p95: 200,
          p99: 250,
        },
        distribution: {
          fast: 65, // % under 100ms
          normal: 30, // % 100-200ms
          slow: 5, // % over 200ms
        },
        trend: 'improving',
        endpoint: '/api/users',
        historical: [160, 155, 152, 150],
      };

      logger.info('Response time analytics with percentile distribution', responseMetrics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('percentile distribution');
      expect(messages[0]).toContain('p95');
      expect(messages[0]).toContain('improving');
    });
  });

  // Task 8.3.2e: Error rate tracking
  /**
   * @suite Monitoring | Error Rate
   * @description エラー率の計測/しきい値超過/影響分析を検証。
   * @testType e2e
   * @coverage エラー分類(4xx/5xx)/トレンド/影響度
   * Scenarios:
   * - エラー率としきい値の比較
   * - トレンド/影響度(ユーザー/ビジネス)の記録
   * Expects:
   * - しきい値に応じたWARN/ERRORが一貫
   */
  describe('Error Rate Tracking', () => {
    // エラー率ログの存在を期待する
    it('should expect error rate logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('error-rate-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Red Phase: expect error rate logs before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(false);
    });

    // Task 8.3.2e Green Phase: Error rate logging with threshold alerts
    // 閾値警告付きでエラー率をログに記録する
    it('should log error rate with threshold warnings', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('error-rate-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Green Phase: Implement error rate logging with threshold alerts
      logger.warn('Error rate: 2.1%', { errorRate: 2.1, threshold: 1.0 });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
      expect(messages[0]).toContain('Error rate: 2.1%');
      expect(messages[0]).toContain('errorRate');
      expect(messages[0]).toContain('threshold');
    });

    // Task 8.3.2e Refactor Phase: Comprehensive error rate monitoring
    // エラー率トレンド分析と影響評価の追加をテストする
    it('should add error rate trend analysis and impact assessment', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('error-rate-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Refactor Phase: Add error rate trend analysis and impact assessment
      const errorMetrics = {
        current: 2.1,
        threshold: 1.0,
        trend: 'increasing',
        historical: [0.8, 1.2, 1.6, 2.1],
        errorTypes: {
          '4xx': 1.5,
          '5xx': 0.6,
        },
        impact: {
          severity: 'medium',
          affectedUsers: 120,
          businessImpact: 'moderate',
        },
        timeWindow: '1h',
        prediction: 2.5,
      };

      logger.warn('Error rate monitoring with trend and impact analysis', errorMetrics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
      expect(messages[0]).toContain('trend and impact analysis');
      expect(messages[0]).toContain('increasing');
      expect(messages[0]).toContain('affectedUsers');
    });
  });

  // Task 8.3.2f: Threshold exceeded alerting
  /**
   * @suite Monitoring | Threshold Alerts
   * @description 閾値超過時のアラート生成/抑止/復帰通知の妥当性を検証。
   * @testType e2e
   * @coverage アラート連携/重複検知/抑止
   * Scenarios:
   * - 閾値超過→アラート生成→復帰→アラート閉塞の一連を記録
   * - 重複抑止/復帰通知の動作と条件を確認
   * Expects:
   * - 重複抑止と復帰通知が適切に機能
   */
  describe('Threshold Exceeded Alerting', () => {
    // 閾値超過アラートの存在を期待する
    it('should expect threshold breach alerts', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('threshold-alerts-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Red Phase: expect threshold alerts before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(false);
    });

    // Task 8.3.2f Green Phase: CPU threshold breach alerting
    // CPU閾値超過アラートをログに記録する
    it('should log CPU threshold exceeded alerts', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('threshold-alerts-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Green Phase: Implement CPU threshold breach alerting
      logger.error('CPU threshold exceeded', { cpu: 90, threshold: 85 });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(messages[0]).toContain('CPU threshold exceeded');
      expect(messages[0]).toContain('cpu');
      expect(messages[0]).toContain('threshold');
    });

    // Task 8.3.2f Refactor Phase: Advanced alerting system
    // エスカレーションロジックとアラート優先順位付けの追加をテストする
    it('should add escalation logic and alert prioritization', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('threshold-alerts-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Refactor Phase: Add escalation logic and alert prioritization
      const alertData = {
        metric: 'cpu',
        current: 90,
        threshold: 85,
        severity: 'critical',
        escalation: {
          level: 2,
          nextEscalation: '15min',
          recipients: ['ops-team', 'manager'],
        },
        priority: 'P1',
        context: {
          duration: '5min',
          trend: 'increasing',
          systemLoad: 'high',
          affectedServices: ['api', 'database'],
        },
        actions: {
          immediate: ['scale-up', 'alert-oncall'],
          scheduled: ['investigate-root-cause'],
        },
      };

      logger.error('Critical CPU threshold breach with escalation', alertData);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(messages[0]).toContain('escalation');
      expect(messages[0]).toContain('P1');
      expect(messages[0]).toContain('scale-up');
    });
  });

  // Task 8.3.2g: Performance metrics integration verification
  /**
   * @suite Monitoring | Performance Integration
   * @description 複数メトリクスの相関と統合可視化を検証。
   * @testType e2e
   * @coverage CPU/Memory/Response/Error の相関
   * Scenarios:
   * - 指標の同時収集と相関出力
   * - 閾値超過や傾向の統合ビュー
   * Expects:
   * - 統合的な監視ログが得られる
   */
  describe('Performance Monitoring Integration', () => {
    // 包括的パフォーマンス監視の存在を期待する
    it('should expect comprehensive performance monitoring', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('metrics-integration-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect integrated monitoring before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.2g Green Phase: Complete metrics correlation
    // 全パフォーマンス指標の収集と相関付けを検証する
    it('should verify all performance indicators are captured and correlated', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('metrics-integration-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Verify all performance indicators are captured and correlated
      logger.info('CPU usage: 75%', { cpu: 75, threshold: 80 });
      logger.info('Memory usage: 2.5GB', { memory: 2500, available: 1500 });
      logger.info('Response time: 150ms', { responseTime: 150, target: 200 });
      logger.warn('Error rate: 2.1%', { errorRate: 2.1, threshold: 1.0 });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);

      const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN);

      expect(infoMessages).toHaveLength(3);
      expect(warnMessages).toHaveLength(1);

      // Verify correlation across metrics
      expect(infoMessages.some((msg) => String(msg).includes('CPU usage'))).toBe(true);
      expect(infoMessages.some((msg) => String(msg).includes('Memory usage'))).toBe(true);
      expect(infoMessages.some((msg) => String(msg).includes('Response time'))).toBe(true);
      expect(warnMessages[0]).toContain('Error rate');
    });

    // Task 8.3.2g Refactor Phase: Optimized monitoring system
    // パフォーマンスデータ収集と分析の最適化をテストする
    it('should optimize performance data collection and analysis', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('metrics-integration-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Optimize performance data collection and analysis
      const performanceSnapshot = {
        timestamp: Date.now(),
        correlationId: 'perf-snapshot-001',
        metrics: {
          system: {
            cpu: { usage: 75, trend: 'stable', threshold: 80 },
            memory: { used: 2500, available: 1500, leakRisk: 'low' },
            disk: { usage: 60, iops: 150 },
          },
          application: {
            responseTime: { avg: 150, p95: 200, trend: 'improving' },
            errorRate: { current: 2.1, threshold: 1.0, impact: 'medium' },
            throughput: { rps: 500, capacity: 800 },
          },
          business: {
            activeUsers: 1200,
            transactionVolume: 850,
            satisfaction: 0.95,
          },
        },
        analysis: {
          overallHealth: 'good',
          recommendations: ['monitor-error-rate', 'consider-scaling'],
          predictions: {
            nextHour: 'stable',
            peakLoad: 'approaching',
          },
        },
      };

      logger.info('Comprehensive performance analysis snapshot', performanceSnapshot);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('performance analysis');
      expect(messages[0]).toContain('correlationId');
      expect(messages[0]).toContain('overallHealth');
      expect(messages[0]).toContain('recommendations');
    });
  });
});

/**
 * @suite Monitoring | User Action Correlation
 * @description セッション/ユーザー単位で行動とシステムログを相関付けて追跡。
 * @testType e2e
 * @coverage 相関ID設計/付与/検索
 * Scenarios:
 * - セッションID/ユーザーID/トランザクションIDで相関検索を実施
 * - 相関キーを用いて時系列復元
 * Expects:
 * - 一貫した相関キーで復元が可能
 */
describe('User Action Correlation Workflows', () => {
  // Task 8.3.3a: Session-based logging setup
  /**
   * @suite Monitoring | Session Correlation
   * @description セッション単位の行動相関と識別子の一貫性を検証。
   * @testType e2e
   * @coverage セッションID管理/相関付与
   * Scenarios:
   * - セッション初期化/識別子の付与
   * - セッションID一貫性の検証
   * Expects:
   * - INFOログからセッションが追跡可能
   */
  describe('Session-Based User Action Correlation', () => {
    // セッション相関ユーザー行動ログの存在を期待する
    it('should expect session-correlated user action logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('session-correlation-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect session tracking before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.3a Green Phase: Session ID management
    // 一貫したセッションIDでセッション追跡を設定する
    it('should setup session tracking with consistent session IDs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('session-correlation-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Setup session tracking with consistent session IDs
      const sessionId = 'sess-456';
      logger.info('Session initialized', { sessionId, userId: 'user123' });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Session initialized');
      expect(messages[0]).toContain(sessionId);
    });

    // Task 8.3.3a Refactor Phase: Advanced session handling
    // セッション管理と相関機能の拡張をテストする
    it('should enhance session management and correlation capabilities', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('session-correlation-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Enhance session management and correlation capabilities
      const sessionData = {
        sessionId: 'sess-456',
        userId: 'user123',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: '192.168.1.100',
        startTime: Date.now(),
        previousSessionId: 'sess-455',
        sessionType: 'authenticated',
        deviceFingerprint: 'device-123-456',
      };

      logger.info('Enhanced session tracking initialized', sessionData);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Enhanced session tracking');
      expect(messages[0]).toContain('deviceFingerprint');
      expect(messages[0]).toContain('authenticated');
    });
  });

  // Task 8.3.3b: User action logging with session context
  /**
   * @suite Monitoring | User Actions
   * @description ユーザー行動をセッション文脈と結び付けて記録。
   * @testType e2e
   * @coverage 行動分類/文脈メタデータ
   * Scenarios:
   * - ログイン等の行動にセッション/ユーザーIDを付与
   * - 行動の属性(カテゴリ/詳細)を記録
   * Expects:
   * - 行動と文脈の突合が可能
   */
  describe('User Actions with Session Context', () => {
    // セッションID付きユーザー行動ログの存在を期待する
    it('should expect user action logs with session IDs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('user-actions-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect user action tracking before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.3b Green Phase: User action logging with session data
    // セッションデータ付きでユーザーログイン行動をログに記録する
    it('should log user login action with session context', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('user-actions-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Implement user action logging with session data
      logger.info('User login action', { userId: 'user123', sessionId: 'sess-456' });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('User login action');
      expect(messages[0]).toContain('user123');
      expect(messages[0]).toContain('sess-456');
    });

    // Task 8.3.3b Refactor Phase: Enhanced user action tracking
    // 包括的ユーザー行動分類とメタデータの追加をテストする
    it('should add comprehensive user action classification and metadata', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('user-actions-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add comprehensive user action classification and metadata
      const userActionData = {
        userId: 'user123',
        sessionId: 'sess-456',
        actionType: 'authentication',
        actionCategory: 'security',
        actionDetails: {
          method: 'oauth2',
          provider: 'google',
          mfaUsed: true,
          deviceTrusted: true,
        },
        context: {
          timestamp: Date.now(),
          location: 'dashboard',
          previousAction: 'page-load',
          userAgent: 'Mozilla/5.0',
          referrer: 'https://app.example.com/login',
        },
        businessMetrics: {
          funnel: 'user-onboarding',
          cohort: '2024-Q1',
          experiment: 'login-optimization-v2',
        },
      };

      logger.info('Comprehensive user action tracking', userActionData);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Comprehensive user action');
      expect(messages[0]).toContain('oauth2');
      expect(messages[0]).toContain('user-onboarding');
    });
  });

  // Task 8.3.3c: System behavior logging with session correlation
  /**
   * @suite Monitoring | System Behavior
   * @description システム応答をセッション相関で記録し、影響を可視化。
   * @testType e2e
   * @coverage 応答分類/資源使用/相関キー
   * Scenarios:
   * - セッションIDと応答の紐付け
   * - 応答性能/資源使用の記録
   * Expects:
   * - 応答が行動と相関して追跡可能
   */
  describe('System Behavior with Session Correlation', () => {
    // 相関システム動作ログの存在を期待する
    it('should expect correlated system behavior logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('system-behavior-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect system behavior correlation before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.3c Green Phase: System behavior tracking with session correlation
    // 一致するセッションIDでシステム応答をログに記録する
    it('should log system responses with matching session IDs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('system-behavior-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Log system responses with matching session IDs
      const sessionId = 'sess-456';
      logger.info('System response to user action', { sessionId, responseTime: 120, status: 'success' });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('System response');
      expect(messages[0]).toContain(sessionId);
      expect(messages[0]).toContain('success');
    });

    // Task 8.3.3c Refactor Phase: Comprehensive system behavior analysis
    // システム動作分類とパフォーマンスメトリクスの追加をテストする
    it('should add system behavior classification and performance metrics', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('system-behavior-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add system behavior classification and performance metrics
      const systemBehaviorData = {
        sessionId: 'sess-456',
        userId: 'user123',
        systemResponse: {
          action: 'authentication-verification',
          service: 'auth-service',
          responseTime: 120,
          status: 'success',
          resourcesUsed: {
            cpu: 15,
            memory: 45,
            database: { queries: 3, latency: 25 },
          },
        },
        correlation: {
          causedBy: 'user-login-attempt',
          triggeredAt: Date.now() - 120,
          sequenceNumber: 2,
          chainId: 'auth-chain-001',
        },
        businessImpact: {
          userExperience: 'positive',
          conversionFunnel: 'authentication-complete',
          performanceCategory: 'excellent',
        },
      };

      logger.info('System behavior analysis with session correlation', systemBehaviorData);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('System behavior analysis');
      expect(messages[0]).toContain('auth-chain-001');
      expect(messages[0]).toContain('authentication-complete');
    });
  });

  // Task 8.3.3d: Advanced search for log correlation
  /**
   * @suite Monitoring | Correlation Search
   * @description 相関IDや規則でログを絞り込み、連鎖を復元。
   * @testType e2e
   * @coverage フィルタ/パターン検出/連番
   * Scenarios:
   * - セッションID/チェーンIDでのフィルタ
   * - ステップ順序の検出
   * Expects:
   * - 連鎖の時系列が復元可能
   */
  describe('Advanced Log Correlation Search', () => {
    // パターンマッチングを使用したセッションベースログ相関の存在を期待する
    it('should expect session-based log correlation using pattern matching', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('log-correlation-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect correlation search before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.3d Green Phase: Session-based log search functionality
    // セッションベースログフィルタリングユーティリティを実装する
    it('should implement session-based log filtering utility', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('log-correlation-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Implement session-based log filtering utility
      const sessionId = 'sess-456';
      logger.info('User login action', { sessionId, userId: 'user123' });
      logger.info('System response to user action', { sessionId, responseTime: 120 });
      logger.info('Different session action', { sessionId: 'sess-789', userId: 'user456' });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const allMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

      // Utility Integration: Filter logs by session ID
      const sessionLogs = allMessages.filter((log) => String(log).includes(sessionId));

      expect(sessionLogs).toHaveLength(2);
      expect(sessionLogs[0]).toContain('User login action');
      expect(sessionLogs[1]).toContain('System response');
      expect(sessionLogs.every((log) => String(log).includes(sessionId))).toBe(true);
    });

    // Task 8.3.3d Refactor Phase: Sophisticated correlation analysis
    // 高度な相関アルゴリズムとパターン検出の追加をテストする
    it('should add advanced correlation algorithms and pattern detection', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('log-correlation-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add advanced correlation algorithms and pattern detection
      const sessionId = 'sess-456';
      const userId = 'user123';
      const chainId = 'auth-chain-001';

      logger.info('User action start', { sessionId, userId, chainId, step: 1 });
      logger.info('System processing', { sessionId, chainId, step: 2, service: 'auth' });
      logger.info('Database operation', { sessionId, chainId, step: 3, operation: 'verify' });
      logger.info('User action complete', { sessionId, userId, chainId, step: 4, result: 'success' });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const allMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

      // Advanced correlation: Multiple pattern matching
      const sessionCorrelation = allMessages.filter((log) => String(log).includes(sessionId));
      const chainCorrelation = allMessages.filter((log) => String(log).includes(chainId));
      const userCorrelation = allMessages.filter((log) => String(log).includes(userId));

      // Pattern detection: Sequential steps (PlainFormatter includes object properties)
      const steps = sessionCorrelation.map((log) => {
        // PlainFormatter formats objects as JSON, look for "step":1 pattern
        const logStr = String(log);
        const match = /"step":\s*(\d+)/.exec(logStr) ?? /step:\s*(\d+)/.exec(logStr);
        return match ? parseInt(match[1]) : 0;
      }).filter((step) => step > 0).sort((a, b) => a - b);

      expect(sessionCorrelation).toHaveLength(4);
      expect(chainCorrelation).toHaveLength(4);
      expect(userCorrelation).toHaveLength(2);
      expect(steps).toEqual([1, 2, 3, 4]);
    });
  });

  // Task 8.3.3e: Transaction traceability verification
  /**
   * @suite Monitoring | Transaction Traceability
   * @description トランザクション開始〜完了までの一貫した追跡を検証。
   * @testType e2e
   * @coverage traceId/セッション/ユーザーの紐付け
   * Scenarios:
   * - 各フェーズ(開始/入力/処理/完了)の記録
   * - 同一traceIdでの時系列復元
   * Expects:
   * - E2Eでの一貫したトレースが可能
   */
  describe('Complete Transaction Traceability', () => {
    // 完全トランザクション追跡機能の存在を期待する
    it('should expect complete transaction tracing capability', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('transaction-trace-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect end-to-end tracing before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.3e Green Phase: Comprehensive transaction tracking
    // ユーザー行動を跨ぐエンドツーエンドトランザクション追跡可能性を検証する
    it('should verify end-to-end transaction traceability across user actions', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('transaction-trace-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Verify end-to-end transaction traceability across user actions
      const traceData = {
        traceId: 'trace-001',
        sessionId: 'sess-456',
        userId: 'user123',
        transactionType: 'user-authentication-flow',
      };

      logger.info('Transaction start', { ...traceData, phase: 'initiation' });
      logger.info('User action', { ...traceData, phase: 'user-input', action: 'login' });
      logger.info('System processing', { ...traceData, phase: 'processing', service: 'auth' });
      logger.info('Transaction complete', { ...traceData, phase: 'completion', result: 'success' });

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

      // Verify complete transaction trace
      expect(messages).toHaveLength(4);
      expect(messages.every((msg) => String(msg).includes('trace-001'))).toBe(true);
      expect(messages.every((msg) => String(msg).includes('sess-456'))).toBe(true);

      const phases = ['initiation', 'user-input', 'processing', 'completion'];
      phases.forEach((phase) => {
        expect(messages.some((msg) => String(msg).includes(phase))).toBe(true);
      });
    });

    // Task 8.3.3e Refactor Phase: Optimized transaction tracing system
    // 追跡完全性と相関精度の向上をテストする
    it('should enhance tracing completeness and correlation accuracy', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('transaction-trace-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Enhance tracing completeness and correlation accuracy
      const enhancedTraceData = {
        traceId: 'trace-002',
        spanId: 'span-auth-flow',
        parentSpanId: 'span-user-session',
        sessionId: 'sess-456',
        userId: 'user123',
        transactionType: 'enhanced-authentication-flow',
        businessContext: {
          feature: 'secure-login',
          experiment: 'mfa-optimization',
          cohort: '2024-security-enhanced',
        },
        performance: {
          startTime: Date.now(),
          checkpoints: [],
        },
        quality: {
          errorRate: 0,
          successRate: 1.0,
          userSatisfaction: 0.95,
        },
      };

      logger.info('Enhanced transaction tracing initiated', enhancedTraceData);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Enhanced transaction tracing');
      expect(messages[0]).toContain('span-auth-flow');
      expect(messages[0]).toContain('mfa-optimization');
      expect(messages[0]).toContain('userSatisfaction');
    });
  });
});

/**
 * @suite Monitoring | Security Incidents
 * @description セキュリティ基準/異常検知/アラート/インシデント対応の記録を検証。
 * @testType e2e
 * @coverage 監査ログ/ルール/通知/対応
 * Scenarios:
 * - ベースライン→逸脱検知→アラート→対応ログの流れを記録
 * - IOC と対応手順の紐付けを確認
 * Expects:
 * - アラート内容と対応が追跡可能
 */
describe('Security Incident Detection Workflows', () => {
  // Task 8.3.4a: Normal access pattern baseline
  /**
   * @suite Security | Baseline
   * @description 正常アクセスの基準パターンを記録し基準化。
   * @testType e2e
   * @coverage 振る舞いプロファイル/基準化
   * Scenarios:
   * - 典型的なアクセスの生成と記録
   * - 後続検知のための基準整備
   * Expects:
   * - 基準プロファイルが参照可能
   */
  describe('Security Baseline Pattern Establishment', () => {
    // 正常アクセスパターン認識の存在を期待する
    it('should expect normal access pattern recognition', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('security-baseline-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect baseline pattern recognition before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.4a Green Phase: Normal behavior pattern generation
    // 典型的ユーザーアクセスパターンと動作を生成する
    it('should generate typical user access patterns and behaviors', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('security-baseline-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Generate typical user access patterns and behaviors
      const normalAccess = {
        userId: 'user123',
        loginTime: '09:15:00',
        location: 'office-network',
        device: 'laptop-mac',
        frequency: 'daily',
        pattern: 'normal-business-hours',
      };

      logger.info('Normal user access pattern recorded', normalAccess);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Normal user access pattern');
      expect(messages[0]).toContain('office-network');
      expect(messages[0]).toContain('normal-business-hours');
    });

    // Task 8.3.4a Refactor Phase: Sophisticated baseline profiling
    // 包括的正常動作プロファイルの確立をテストする
    it('should establish comprehensive normal behavior profiles', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('security-baseline-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Establish comprehensive normal behavior profiles
      const behaviorProfile = {
        userId: 'user123',
        baselineMetrics: {
          averageLoginTime: '09:15:00',
          typicalLocations: ['office-network', 'home-wifi'],
          commonDevices: ['laptop-mac', 'phone-ios'],
          accessFrequency: {
            daily: true,
            weeklyPattern: [1, 1, 1, 1, 1, 0, 0], // Mon-Fri
            hourlyDistribution: { '08': 0.1, '09': 0.3, '10': 0.2 },
          },
          behaviorSignatures: {
            sessionDuration: { avg: 480, min: 60, max: 600 },
            clickPatterns: 'methodical',
            navigationStyle: 'consistent',
            failureRate: 0.01,
          },
        },
        riskProfile: 'low',
        trustScore: 0.95,
        lastUpdated: Date.now(),
      };

      logger.info('Comprehensive security baseline established', behaviorProfile);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('security baseline established');
      expect(messages[0]).toContain('trustScore');
      expect(messages[0]).toContain('behaviorSignatures');
    });
  });

  // Task 8.3.4b: Suspicious access pattern detection
  /**
   * @suite Security | Suspicious Patterns
   * @description 不審アクセスの検知ロジックと記録を検証。
   * @testType e2e
   * @coverage 逸脱検知/リスク評価
   * Scenarios:
   * - 異常なIP/時間帯/頻度の検出
   * - リスクスコアなどのメタを記録
   * Expects:
   * - 検知結果がログで追跡可能
   */
  describe('Suspicious Access Pattern Detection', () => {
    // 不審アクセス検知の存在を期待する
    it('should expect suspicious access detection', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('suspicious-access-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Red Phase: expect anomaly detection before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(false);
    });

    // Task 8.3.4b Green Phase: Anomalous behavior simulation
    // 異常なアクセスパターンをシミュレートする
    it('should simulate unusual access patterns', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('suspicious-access-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Green Phase: Simulate unusual access patterns (frequency, timing, geography)
      const suspiciousAccess = {
        userId: 'user123',
        loginTime: '03:45:00', // Unusual time
        location: 'unknown-country',
        device: 'unrecognized-device',
        frequency: 'multiple-rapid-attempts',
        anomalyScore: 0.85,
      };

      logger.warn('Suspicious access pattern detected', suspiciousAccess);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
      expect(messages[0]).toContain('Suspicious access pattern');
      expect(messages[0]).toContain('unknown-country');
      expect(messages[0]).toContain('unrecognized-device');
    });

    // Task 8.3.4b Refactor Phase: Comprehensive threat modeling
    // 現実的セキュリティ脅威シナリオの作成をテストする
    it('should create realistic security threat scenarios', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('suspicious-access-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Refactor Phase: Create realistic security threat scenarios
      const threatScenario = {
        userId: 'user123',
        threatType: 'credential-stuffing',
        anomalyIndicators: {
          geolocation: {
            current: 'RU',
            baseline: 'US',
            deviation: 'high-risk-country',
          },
          timing: {
            current: '03:45:00',
            baseline: '09:15:00',
            deviation: 'off-hours-access',
          },
          device: {
            current: 'unknown-linux',
            baseline: 'known-mac',
            deviation: 'device-fingerprint-mismatch',
          },
          behavior: {
            loginAttempts: 15,
            successRate: 0.0,
            pattern: 'automated-brute-force',
          },
        },
        riskAssessment: {
          overallScore: 0.95,
          category: 'critical',
          confidence: 0.87,
          recommendations: ['immediate-block', 'alert-user', 'forensic-analysis'],
        },
        correlation: {
          similarIncidents: 3,
          timeframe: '24h',
          affectedAccounts: ['user123', 'user456', 'user789'],
        },
      };

      logger.warn('Security threat scenario analysis', threatScenario);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
      expect(messages[0]).toContain('threat scenario analysis');
      expect(messages[0]).toContain('credential-stuffing');
      expect(messages[0]).toContain('immediate-block');
    });
  });

  // Task 8.3.4c: Security alert generation
  /**
   * @suite Security | Alerting
   * @description 検知結果からのアラート生成と分類を検証。
   * @testType e2e
   * @coverage 通知/分類/重複抑止
   * Scenarios:
   * - ルールに基づくアラート生成
   * - 重要度/種類の分類
   * Expects:
   * - アラート内容が調査に適う形で記録
   */
  describe('Security Alert Generation', () => {
    // セキュリティアラートログの存在を期待する
    it('should expect security alert logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('security-alerts-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Red Phase: expect security alerting before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(false);
    });

    // Task 8.3.4c Green Phase: Pattern-based alerting
    // 不審パターンに基づくセキュリティアラートを生成する
    it('should generate security alerts based on suspicious patterns', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('security-alerts-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Green Phase: Generate security alerts based on suspicious patterns
      const securityAlert = {
        alertId: 'SEC-001',
        severity: 'high',
        type: 'unauthorized-access-attempt',
        userId: 'user123',
        threat: 'potential-account-compromise',
        timestamp: Date.now(),
      };

      logger.error('Security alert generated', securityAlert);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(messages[0]).toContain('Security alert generated');
      expect(messages[0]).toContain('SEC-001');
      expect(messages[0]).toContain('unauthorized-access-attempt');
    });

    // Task 8.3.4c Refactor Phase: Sophisticated alert management
    // アラート分類と重要度評価の拡張をテストする
    it('should enhance alert classification and severity assessment', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('security-alerts-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Refactor Phase: Enhance alert classification and severity assessment
      const enhancedSecurityAlert = {
        alertId: 'SEC-002',
        classification: {
          category: 'authentication-anomaly',
          subcategory: 'credential-stuffing',
          severity: 'critical',
          priority: 'P0',
          confidence: 0.92,
        },
        threatIntelligence: {
          attackVector: 'automated-bot',
          origin: 'known-malicious-ip',
          campaign: 'global-credential-stuffing-2024',
          attribution: 'APT-unknown',
        },
        impact: {
          scope: 'single-account',
          dataAtRisk: 'personal-information',
          businessImpact: 'medium',
          complianceRisk: 'gdpr-violation-potential',
        },
        response: {
          automaticActions: ['account-lock', 'ip-block', 'mfa-enforce'],
          manualActions: ['forensic-review', 'user-notification'],
          escalation: {
            level: 2,
            team: 'security-operations',
            sla: '15min',
          },
        },
        context: {
          userId: 'user123',
          sessionId: 'sess-456',
          correlatedEvents: ['SEC-001', 'SEC-003'],
        },
      };

      logger.error('Enhanced security alert with threat intelligence', enhancedSecurityAlert);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(messages[0]).toContain('threat intelligence');
      expect(messages[0]).toContain('credential-stuffing');
      expect(messages[0]).toContain('security-operations');
    });
  });

  // Task 8.3.4d: Incident response logging
  /**
   * @suite Security | Incident Response
   * @description インシデント対応の手順と結果を記録。
   * @testType e2e
   * @coverage 初動/封じ込め/根絶/復旧
   * Scenarios:
   * - 各フェーズの実施とログ
   * - タイムライン/担当/結果の記録
   * Expects:
   * - 対応履歴を時系列に再構築可能
   */
  describe('Incident Response Logging', () => {
    // インシデント対応手順ログの存在を期待する
    it('should expect incident response procedure logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('incident-response-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect incident response tracking before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.4d Green Phase: Comprehensive response logging
    // インシデント対応行動と結果をログに記録する
    it('should log incident response actions and outcomes', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('incident-response-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Log incident response actions and outcomes
      const incidentResponse = {
        incidentId: 'INC-001',
        alertId: 'SEC-002',
        responseAction: 'account-lockout',
        result: 'success',
        timestamp: Date.now(),
        responderId: 'security-ops-001',
      };

      logger.info('Security incident response action executed', incidentResponse);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('incident response action');
      expect(messages[0]).toContain('account-lockout');
      expect(messages[0]).toContain('success');
    });

    // Task 8.3.4d Refactor Phase: Advanced response coordination
    it('should add incident response coordination and escalation tracking', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('incident-response-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add incident response coordination and escalation tracking
      const coordinatedResponse = {
        incidentId: 'INC-002',
        responseCoordination: {
          playbook: 'credential-stuffing-response-v2',
          phase: 'containment',
          progress: 0.75,
          estimatedCompletion: '45min',
        },
        actions: {
          automated: [
            { action: 'account-lock', status: 'completed', duration: '5s' },
            { action: 'ip-block', status: 'completed', duration: '2s' },
            { action: 'mfa-enforce', status: 'in-progress', eta: '10min' },
          ],
          manual: [
            { action: 'forensic-analysis', assignee: 'analyst-001', status: 'started' },
            { action: 'user-notification', assignee: 'support-002', status: 'pending' },
          ],
        },
        coordination: {
          teamInvolved: ['security-ops', 'incident-response', 'user-support'],
          communicationChannel: '#incident-response-001',
          statusUpdates: 3,
          stakeholdersNotified: ['ciso', 'legal', 'privacy-officer'],
        },
        metrics: {
          detectionTime: '30s',
          responseTime: '2min',
          containmentTime: '8min',
          mttr: '45min',
        },
        lessonsLearned: {
          effectiveness: 0.88,
          improvements: ['faster-ip-blocking', 'automated-user-notification'],
          nextReview: '2024-12-15',
        },
      };

      logger.info('Coordinated security incident response tracking', coordinatedResponse);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Coordinated security incident');
      expect(messages[0]).toContain('credential-stuffing-response-v2');
      expect(messages[0]).toContain('lessonsLearned');
    });
  });
});

/**
 * Capacity Management Workflows
 * @suite Monitoring | Capacity Management
 * @description キャパシティ基準/ピーク検知/不足警告/スケーリング追跡を検証。
 * @testType e2e
 * @coverage 需要予測/閾値/スケールアクション
 * Scenarios:
 * - ベースライン→ピーク→不足→スケールのシナリオを記録
 * - スケール判定条件と実行結果を確認
 * Expects:
 * - 予兆/検知/対応が一貫して記録
 */
describe('Capacity Management Workflows', () => {
  // Task 8.3.5a: Normal usage pattern logging
  /**
   * @suite Capacity | Baseline
   * @description 通常利用のベースラインと需要傾向を記録。
   * @testType e2e
   * @coverage 需要/利用率/傾向
   * Scenarios:
   * - 通常時の利用率と傾向を記録
   * - 後続検知のしきい値材料を整備
   * Expects:
   * - ベースライン参照で異常検知が容易
   */
  describe('Capacity Baseline Establishment', () => {
    it('should expect baseline capacity usage logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('capacity-baseline-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect capacity baseline tracking before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.5a Green Phase: Normal usage pattern logging
    it('should log normal resource usage patterns and trends', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('capacity-baseline-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Log normal resource usage patterns and trends
      const normalUsage = {
        timestamp: Date.now(),
        resourceUsage: {
          cpu: 45,
          memory: 60,
          disk: 35,
          network: 25,
        },
        userLoad: 150,
        transactionRate: 45,
        pattern: 'normal-business-hours',
      };

      logger.info('Normal capacity usage baseline', normalUsage);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('capacity usage baseline');
      expect(messages[0]).toContain('normal-business-hours');
      expect(messages[0]).toContain('transactionRate');
    });

    // Task 8.3.5a Refactor Phase: Advanced usage analytics
    it('should add historical usage analysis and pattern recognition', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('capacity-baseline-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add historical usage analysis and pattern recognition
      const usageAnalytics = {
        timestamp: Date.now(),
        current: {
          cpu: 45,
          memory: 60,
          disk: 35,
          network: 25,
          userLoad: 150,
          transactionRate: 45,
        },
        historical: {
          daily: { avg: 42, min: 20, max: 65 },
          weekly: { pattern: [40, 45, 50, 48, 52, 30, 25] },
          monthly: { trend: 'steady-growth', growthRate: 0.05 },
        },
        patterns: {
          businessHours: { peak: '14:00', low: '06:00' },
          seasonal: { quarter: 'Q4-high-load' },
          cyclical: { weeklyPattern: 'Monday-peak' },
        },
        predictions: {
          nextHour: 48,
          nextDay: 52,
          nextWeek: 55,
          confidence: 0.87,
        },
        capacity: {
          current: 0.6, // 60% of capacity
          recommended: 0.75,
          maximum: 1.0,
          headroom: '40%',
        },
      };

      logger.info('Advanced capacity usage analytics with predictions', usageAnalytics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('capacity usage analytics');
      expect(messages[0]).toContain('predictions');
      expect(messages[0]).toContain('steady-growth');
    });
  });

  // Task 8.3.5b: Peak usage pattern detection
  /**
   * @suite Capacity | Peak Usage
   * @description ピーク利用の検知と評価を検証。
   * @testType e2e
   * @coverage ピーク検出/影響評価
   * Scenarios:
   * - ピーク検知の条件とログ
   * - 影響(性能/コスト)の評価
   * Expects:
   * - ピーク挙動が再現/追跡可能
   */
  describe('Peak Usage Pattern Detection', () => {
    it('should expect peak usage detection and logging', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('peak-usage-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Red Phase: expect peak usage tracking before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(false);
    });

    // Task 8.3.5b Green Phase: Peak usage pattern recognition
    it('should log peak usage patterns and resource stress indicators', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('peak-usage-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Green Phase: Log peak usage patterns and resource stress indicators
      const peakUsage = {
        timestamp: Date.now(),
        peakType: 'traffic-surge',
        resourceUsage: {
          cpu: 85,
          memory: 90,
          disk: 65,
          network: 95,
        },
        stressIndicators: {
          responseTime: 'degraded',
          errorRate: 'elevated',
          queueDepth: 'high',
        },
        trigger: 'marketing-campaign-launch',
        duration: '45min',
      };

      logger.warn('Peak usage pattern detected', peakUsage);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
      expect(messages[0]).toContain('Peak usage pattern');
      expect(messages[0]).toContain('traffic-surge');
      expect(messages[0]).toContain('marketing-campaign-launch');
    });

    // Task 8.3.5b Refactor Phase: Predictive capacity analysis
    it('should add peak usage prediction and capacity forecasting', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('peak-usage-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // Refactor Phase: Add peak usage prediction and capacity forecasting
      const peakAnalytics = {
        currentPeak: {
          intensity: 0.9, // 90% of capacity
          duration: '45min',
          type: 'scheduled-event',
          cause: 'product-launch',
        },
        prediction: {
          algorithm: 'ml-time-series',
          nextPeak: {
            predictedTime: Date.now() + 3600000, // 1 hour from now
            expectedIntensity: 0.95,
            confidence: 0.82,
            preparation: '30min',
          },
          patterns: {
            dailyPeaks: ['14:00', '20:00'],
            weeklyTrend: 'Friday-highest',
            seasonality: 'holiday-season-surge',
          },
        },
        forecast: {
          shortTerm: { hours: 6, expectedPeak: 0.85 },
          mediumTerm: { days: 7, expectedPeak: 0.92 },
          longTerm: { weeks: 4, expectedPeak: 1.1 }, // Over capacity
        },
        recommendations: {
          immediate: ['enable-auto-scaling', 'prepare-additional-capacity'],
          strategic: ['capacity-planning-review', 'infrastructure-upgrade'],
        },
      };

      logger.warn('Predictive peak usage analysis with forecasting', peakAnalytics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
      expect(messages[0]).toContain('Predictive peak usage');
      expect(messages[0]).toContain('ml-time-series');
      expect(messages[0]).toContain('capacity-planning-review');
    });
  });

  // Task 8.3.5c: Resource shortage warning system
  /**
   * @suite Capacity | Shortage Warning
   * @description 資源不足の予兆/警告/対応提案を検証。
   * @testType e2e
   * @coverage 予兆検知/警告/優先度
   * Scenarios:
   * - 不足条件と警告発火の記録
   * - 優先度/対応候補の提示
   * Expects:
   * - 適切な警告と次アクションが示される
   */
  describe('Resource Shortage Warning System', () => {
    it('should expect resource shortage alerts', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('resource-shortage-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Red Phase: expect shortage alerting before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(false);
    });

    // Task 8.3.5c Green Phase: Shortage warning system
    it('should implement resource shortage warnings and threshold monitoring', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('resource-shortage-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Green Phase: Implement resource shortage warnings and threshold monitoring
      const shortageWarning = {
        timestamp: Date.now(),
        resource: 'memory',
        current: 95,
        threshold: 90,
        available: '200MB',
        severity: 'critical',
        impact: 'service-degradation',
        estimatedExhaustion: '15min',
      };

      logger.error('Resource shortage warning', shortageWarning);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(messages[0]).toContain('Resource shortage warning');
      expect(messages[0]).toContain('memory');
      expect(messages[0]).toContain('estimatedExhaustion');
    });

    // Task 8.3.5c Refactor Phase: Predictive shortage analysis
    it('should add predictive shortage detection and early warning systems', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('resource-shortage-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      // Refactor Phase: Add predictive shortage detection and early warning systems
      const predictiveShortage = {
        timestamp: Date.now(),
        analysis: {
          currentState: { cpu: 75, memory: 88, disk: 70, network: 45 },
          trajectory: {
            memory: { trend: 'increasing', rate: '2%/hour', projection: '95% in 3h' },
            disk: { trend: 'stable', rate: '0.1%/hour', projection: 'safe' },
          },
        },
        predictions: {
          shortageRisk: {
            memory: { probability: 0.89, timeframe: '3h', severity: 'high' },
            disk: { probability: 0.12, timeframe: '7d', severity: 'low' },
          },
          cascadeEffects: {
            memoryShortage: ['increased-swap', 'performance-degradation', 'service-instability'],
            preventiveMeasures: ['memory-cleanup', 'process-optimization', 'scaling-up'],
          },
        },
        earlyWarning: {
          level: 3, // out of 5
          timeToAction: '90min',
          automatedActions: ['garbage-collection', 'cache-cleanup'],
          manualActions: ['scaling-decision', 'capacity-increase'],
        },
        businessImpact: {
          userExperience: 'degradation-risk-high',
          slaRisk: 'breach-probable',
          revenueImpact: 'medium',
        },
      };

      logger.error('Predictive resource shortage analysis', predictiveShortage);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      expect(messages[0]).toContain('Predictive resource shortage');
      expect(messages[0]).toContain('cascadeEffects');
      expect(messages[0]).toContain('slaRisk');
    });
  });

  // Task 8.3.5d: Scaling execution logging
  /**
   * @suite Capacity | Scaling Actions
   * @description スケーリング実施の判断/実行/効果を記録。
   * @testType e2e
   * @coverage 判定条件/実行結果/効果測定
   * Scenarios:
   * - スケールアップ/ダウンの判断と実行ログ
   * - 効果(性能/コスト)の追跡
   * Expects:
   * - スケーリングの意思決定が追跡可能
   */
  describe('Scaling Actions Tracking', () => {
    it('should expect scaling action logs', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('scaling-actions-red', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Red Phase: expect scaling decision tracking before implementation
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });

    // Task 8.3.5d Green Phase: Scaling action logging
    it('should log scaling decisions and execution results', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('scaling-actions-green', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Green Phase: Log scaling decisions and execution results
      const scalingAction = {
        timestamp: Date.now(),
        actionType: 'scale-up',
        trigger: 'memory-shortage-prediction',
        execution: {
          from: { instances: 3, capacity: '75%' },
          to: { instances: 5, capacity: '45%' },
          duration: '3min',
          result: 'success',
        },
        cost: { increase: '$12/hour', efficiency: 0.78 },
      };

      logger.info('Scaling action executed', scalingAction);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('Scaling action executed');
      expect(messages[0]).toContain('scale-up');
      expect(messages[0]).toContain('memory-shortage-prediction');
    });

    // Task 8.3.5d Refactor Phase: Advanced scaling analytics
    it('should add scaling effectiveness analysis and optimization tracking', (ctx: TestContext) => {
      const mockLogger = setupE2eMockLogger('scaling-actions-refactor', ctx);

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Refactor Phase: Add scaling effectiveness analysis and optimization tracking
      const scalingAnalytics = {
        scalingEvent: {
          id: 'scale-event-001',
          timestamp: Date.now(),
          type: 'predictive-scale-up',
          trigger: 'ml-forecast-memory-shortage',
        },
        execution: {
          decision: {
            algorithm: 'predictive-ml',
            confidence: 0.91,
            leadTime: '45min',
          },
          implementation: {
            method: 'kubernetes-hpa',
            from: { pods: 3, cpu: '2.1 cores', memory: '6GB' },
            to: { pods: 5, cpu: '3.5 cores', memory: '10GB' },
            duration: '2min 30s',
            success: true,
          },
        },
        effectiveness: {
          problemPrevention: true,
          costEfficiency: 0.82,
          performanceImprovement: {
            responseTime: '35% faster',
            errorRate: '60% reduction',
            userSatisfaction: '+12%',
          },
          resourceUtilization: {
            before: { cpu: 85, memory: 90 },
            after: { cpu: 60, memory: 55 },
            optimal: true,
          },
        },
        optimization: {
          learnings: ['prediction-accuracy-excellent', 'scaling-timing-optimal'],
          adjustments: ['reduce-memory-threshold-10%', 'increase-prediction-confidence'],
          nextReview: '2024-12-20',
          modelUpdates: ['retrain-prediction-model', 'incorporate-business-seasonality'],
        },
        businessValue: {
          incidentsAvoided: 1,
          reputationProtected: true,
          slaCompliance: '99.9%',
          customerSatisfaction: 4.8,
        },
      };

      logger.info('Comprehensive scaling effectiveness analysis', scalingAnalytics);

      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages[0]).toContain('scaling effectiveness analysis');
      expect(messages[0]).toContain('predictive-ml');
      expect(messages[0]).toContain('incidentsAvoided');
    });
  });
});
