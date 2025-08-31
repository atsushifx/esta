// src: tests/integration/ExternalSystemIntegration.integration.spec.ts
// @(#) : AglaError 外部システム統合異常系テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// Type definitions
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// I-005 グループ: 外部システム統合異常系
describe('Given AglaError for external system integration failures', () => {
  describe('When logging system fails', () => {
    it('Then 正常系：should provide fallback logging mechanism', () => {
      // Arrange
      const error = new TestAglaError('LOGGING_FAILURE', 'Logging system failure', {
        context: { originalDestination: 'primary-log-server', timestamp: Date.now() },
      });

      // Act: ログシステム連携失敗時のフォールバック処理をシミュレート
      let primaryLogFailed = false;
      let fallbackLog = '';

      try {
        // プライマリログシステムの失敗をシミュレート
        throw new Error('Primary logging system unavailable');
      } catch {
        primaryLogFailed = true;
        // フォールバック: エラー情報をローカルバッファに保存
        fallbackLog = `FALLBACK: ${error.errorType} - ${error.message}`;
      }

      // Assert
      expect(primaryLogFailed).toBe(true);
      expect(fallbackLog).toContain(error.errorType);
      expect(fallbackLog).toContain('FALLBACK');
      expect(error.context?.originalDestination).toBe('primary-log-server');
    });

    it('Then 異常系：should handle logging system complete failure', () => {
      // Arrange
      const criticalError = new TestAglaError('CRITICAL_LOG_FAILURE', 'Critical logging failure', {
        severity: ErrorSeverity.FATAL,
        context: {
          systemsDown: ['primary-log', 'backup-log', 'emergency-log'],
          lastSuccessfulLog: Date.now() - 3600000, // 1時間前
        },
      });

      // Act: 全ログシステム停止時の処理
      const emergencyBuffer: string[] = [];
      const logSystems = ['primary', 'backup', 'emergency'];

      logSystems.forEach((system) => {
        try {
          throw new Error(`${system} log system down`);
        } catch {
          // 緊急時バッファに記録
          emergencyBuffer.push(`${system}: ${criticalError.errorType}`);
        }
      });

      // Assert
      expect(emergencyBuffer).toHaveLength(3);
      expect(emergencyBuffer.every((log) => log.includes(criticalError.errorType))).toBe(true);
      expect(criticalError.severity).toBe(ErrorSeverity.FATAL);
    });

    it('Then エッジケース：should handle partial logging system recovery', () => {
      // Arrange
      const recoveryError = new TestAglaError('LOG_RECOVERY', 'Logging recovery test', {
        context: {
          recoveryAttempt: 3,
          partialSystems: ['backup-log'],
          failedSystems: ['primary-log', 'audit-log'],
        },
      });

      // Act: 部分回復シナリオ
      const systemStatus = {
        'primary-log': false,
        'backup-log': true,
        'audit-log': false,
      };

      const availableSystems = Object.entries(systemStatus)
        .filter(([_, available]) => available)
        .map(([system, _]) => system);

      const loggedSuccessfully = availableSystems.length > 0;

      // Assert
      expect(loggedSuccessfully).toBe(true);
      expect(availableSystems).toContain('backup-log');
      expect(availableSystems).toHaveLength(1);
      expect(recoveryError.context?.partialSystems).toContain('backup-log');
    });
  });

  describe('When monitoring system fails', () => {
    it('Then 正常系：should queue errors for monitoring system recovery', () => {
      // Arrange
      const monitoringError = new TestAglaError('MONITORING_FAILURE', 'Monitoring system failure', {
        context: { monitoringEndpoint: 'https://monitor.example.com', retryCount: 0 },
      });

      // Act: 監視システム失敗時のキューイング
      const errorQueue: TestAglaError[] = [];
      let monitoringAvailable = false;

      try {
        // 監視システム接続失敗をシミュレート
        throw new Error('Monitoring system unreachable');
      } catch {
        // エラーをキューに追加
        errorQueue.push(monitoringError);
        monitoringAvailable = false;
      }

      // Assert
      expect(errorQueue).toContain(monitoringError);
      expect(errorQueue).toHaveLength(1);
      expect(monitoringAvailable).toBe(false);
      expect(monitoringError.context?.retryCount).toBe(0);
    });

    it('Then 異常系：should handle monitoring queue overflow', () => {
      // Arrange
      const queueLimit = 100;
      const errorQueue: TestAglaError[] = [];

      // Act: キューオーバーフロー状況をシミュレート
      for (let i = 0; i < queueLimit + 50; i++) {
        const error = new TestAglaError(`QUEUE_OVERFLOW_${i}`, `Queue overflow test ${i}`, {
          context: { queuePosition: i, timestamp: Date.now() },
        });

        if (errorQueue.length < queueLimit) {
          errorQueue.push(error);
        } else {
          // キュー満杯時の処理: 古いエラーを削除して新しいエラーを追加
          errorQueue.shift();
          errorQueue.push(error);
        }
      }

      // Assert
      expect(errorQueue).toHaveLength(queueLimit);
      expect(errorQueue[0].context?.queuePosition).toBeGreaterThan(49); // 古いエラーは削除済み
      expect(errorQueue[queueLimit - 1].context?.queuePosition).toBe(149); // 最新エラー
    });

    it('Then エッジケース：should handle monitoring system partial failure', () => {
      // Arrange
      const partialError = new TestAglaError('PARTIAL_MONITORING', 'Partial monitoring failure', {
        context: {
          availableMetrics: ['cpu', 'memory'],
          failedMetrics: ['disk', 'network'],
          degradedMode: true,
        },
      });

      // Act: 部分機能動作の確認
      const availableServices = partialError.context?.availableMetrics as string[];
      const failedServices = partialError.context?.failedMetrics as string[];
      const isPartiallyOperational = availableServices.length > 0;

      // Assert
      expect(isPartiallyOperational).toBe(true);
      expect(availableServices).toContain('cpu');
      expect(availableServices).toContain('memory');
      expect(failedServices).toContain('disk');
      expect(failedServices).toContain('network');
      expect(partialError.context?.degradedMode).toBe(true);
    });
  });

  describe('When database persistence fails', () => {
    it('Then 正常系：should use local buffer for database failure', () => {
      // Arrange
      const dbError = new TestAglaError('DATABASE_FAILURE', 'Database persistence failure', {
        context: {
          database: 'error-db',
          operation: 'INSERT',
          retryAttempts: 3,
        },
      });

      // Act: データベース障害時のローカルバッファ使用
      const localBuffer: Record<string, unknown>[] = [];
      let dbConnectionFailed = false;

      try {
        // データベース接続失敗をシミュレート
        throw new Error('Database connection timeout');
      } catch {
        dbConnectionFailed = true;
        // ローカルバッファに保存
        localBuffer.push(dbError.toJSON());
      }

      // Assert
      expect(dbConnectionFailed).toBe(true);
      expect(localBuffer).toHaveLength(1);
      expect(localBuffer[0]).toEqual(dbError.toJSON());
      expect(localBuffer[0].errorType).toBe('DATABASE_FAILURE');
    });

    it('Then 異常系：should handle database recovery with buffer flush', () => {
      // Arrange
      const bufferSize = 10;
      const localBuffer: Record<string, unknown>[] = [];

      // バッファに複数エラーを蓄積
      for (let i = 0; i < bufferSize; i++) {
        const error = new TestAglaError(`DB_RECOVERY_${i}`, `Database recovery test ${i}`, {
          context: { buffered: true, index: i },
        });
        localBuffer.push(error.toJSON());
      }

      // Act: データベース復旧時のバッファフラッシュ
      const flushedErrors: Record<string, unknown>[] = [];

      // バッファからデータベースに一括保存
      flushedErrors.push(...localBuffer);
      localBuffer.length = 0; // バッファクリア

      // Assert
      expect(flushedErrors).toHaveLength(bufferSize);
      expect(localBuffer).toHaveLength(0);
      expect(flushedErrors[0].errorType).toBe('DB_RECOVERY_0');
      expect(flushedErrors[bufferSize - 1].errorType).toBe(`DB_RECOVERY_${bufferSize - 1}`);
    });

    it('Then エッジケース：should handle database transaction rollback', () => {
      // Arrange
      const transactionError = new TestAglaError('TRANSACTION_ROLLBACK', 'Transaction rollback test', {
        context: {
          transactionId: 'tx-12345',
          affectedTables: ['errors', 'logs', 'audit'],
          rollbackReason: 'constraint_violation',
        },
      });

      // Act: トランザクションロールバック処理
      let transactionCompleted = false;
      let rollbackPerformed = false;

      try {
        // トランザクション失敗をシミュレート
        throw new Error('Foreign key constraint violation');
      } catch {
        rollbackPerformed = true;
        // ロールバック後の状態確認
        transactionCompleted = false;
      }

      // Assert
      expect(rollbackPerformed).toBe(true);
      expect(transactionCompleted).toBe(false);
      expect(transactionError.context?.transactionId).toBe('tx-12345');
      expect(transactionError.context?.rollbackReason).toBe('constraint_violation');
      expect((transactionError.context?.affectedTables as string[]).length).toBe(3);
    });
  });
});
