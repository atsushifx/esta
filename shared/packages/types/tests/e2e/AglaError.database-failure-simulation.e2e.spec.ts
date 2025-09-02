// src: tests/e2e/AglaError.database-failure-simulation.e2e.spec.ts
// @(#) : E2E tests for database failure scenarios and error handling workflows
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaErrorContext } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test support
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

// Database failure simulation context types extending AglaErrorContext
type DatabasePoolExhaustionContext = AglaErrorContext & {
  operation: string;
  poolSize: number;
  activeConnections: number;
  availableConnections: number;
  queueSize: number;
  waitTime: number;
};

type DatabaseTransactionFailureContext = AglaErrorContext & {
  operation: string;
  transactionId: string;
  isolationLevel: string;
  rollbackReason: string;
  affectedTables: string[];
  rollbackDuration: number;
};

type DatabaseReplicationContext = AglaErrorContext & {
  operation: string;
  primaryEndpoint: string;
  replicaEndpoint: string;
  replicationLag: number;
  consistency: 'eventual' | 'strong' | 'weak';
  readPreference: string;
};

/**
 * Mock database pool exhaustion simulation
 */
const simulateDatabasePoolExhaustion = (): DatabasePoolExhaustionContext => {
  return {
    operation: 'database-query',
    poolSize: 10,
    activeConnections: 10,
    availableConnections: 0,
    queueSize: 50,
    waitTime: 30000,
  };
};

/**
 * Mock database transaction failure simulation
 */
const simulateDatabaseTransactionFailure = (): DatabaseTransactionFailureContext => {
  return {
    operation: 'database-transaction',
    transactionId: 'tx-12345-67890',
    isolationLevel: 'READ_COMMITTED',
    rollbackReason: 'deadlock-detected',
    affectedTables: ['users', 'orders', 'inventory'],
    rollbackDuration: 1500,
  };
};

/**
 * Mock database replication lag simulation
 */
const simulateDatabaseReplicationLag = (): DatabaseReplicationContext => {
  return {
    operation: 'database-read',
    primaryEndpoint: 'db-primary.example.com:5432',
    replicaEndpoint: 'db-replica.example.com:5432',
    replicationLag: 2500,
    consistency: 'eventual',
    readPreference: 'secondary',
  };
};

describe('Given AglaError database failure simulation scenarios', () => {
  describe('When database connection pool becomes exhausted', () => {
    it('Then 正常系：接続プール枯渇時のエラー処理が適切に実行される', () => {
      const poolContext = simulateDatabasePoolExhaustion();
      const poolError = new TestAglaError(
        'DATABASE_POOL_EXHAUSTED',
        'Database connection pool exhausted',
        {
          code: 'E_DB_POOL_EXHAUSTED',
          severity: ErrorSeverity.ERROR,
          context: poolContext satisfies DatabasePoolExhaustionContext,
        },
      );

      expect(poolError.context?.availableConnections).toBe(0);
      expect(poolError.context?.operation).toBe('database-query');
      expect(poolError.errorType).toBe('DATABASE_POOL_EXHAUSTED');
      expect(poolError.severity).toBe(ErrorSeverity.ERROR);
    });

    it('Then 異常系：プール状態が不正な場合でもエラーコンテキストが保持される', () => {
      const invalidPoolContext: DatabasePoolExhaustionContext = {
        ...simulateDatabasePoolExhaustion(),
        availableConnections: -1,
        activeConnections: 15, // poolSizeを超過
      };

      const poolError = new TestAglaError(
        'INVALID_POOL_STATE',
        'Invalid pool state detected',
        {
          code: 'E_INVALID_POOL_STATE',
          severity: ErrorSeverity.FATAL,
          context: invalidPoolContext satisfies DatabasePoolExhaustionContext,
        },
      );

      expect(poolError.context?.availableConnections).toBe(-1);
      expect((poolError.context as DatabasePoolExhaustionContext).activeConnections).toBeGreaterThan(
        (poolError.context as DatabasePoolExhaustionContext).poolSize,
      );
      expect(poolError.severity).toBe(ErrorSeverity.FATAL);
    });

    it('Then エッジケース：極端に長い待機時間でもコンテキストが正しく処理される', () => {
      const longWaitContext: DatabasePoolExhaustionContext = {
        ...simulateDatabasePoolExhaustion(),
        waitTime: 300000, // 5分
        queueSize: 1000,
      };

      const longWaitError = new TestAglaError(
        'CONNECTION_WAIT_TIMEOUT',
        'Connection wait timeout exceeded',
        {
          code: 'E_CONNECTION_WAIT_TIMEOUT',
          severity: ErrorSeverity.WARNING,
          context: longWaitContext satisfies DatabasePoolExhaustionContext,
        },
      );

      expect(longWaitError.context?.waitTime).toBe(300000);
      expect(longWaitError.context?.queueSize).toBe(1000);
      expect(longWaitError.message).toContain('wait timeout');
    });
  });

  describe('When database transaction fails and rollback is required', () => {
    it('Then 正常系：トランザクション失敗時のロールバック連携が適切に処理される', () => {
      const transactionContext = simulateDatabaseTransactionFailure();
      const transactionError = new TestAglaError(
        'TRANSACTION_ROLLBACK',
        'Transaction failed and rolled back',
        {
          code: 'E_TRANSACTION_ROLLBACK',
          severity: ErrorSeverity.ERROR,
          context: transactionContext satisfies DatabaseTransactionFailureContext,
        },
      );

      expect(transactionError.context?.transactionId).toBeDefined();
      expect(transactionError.context?.transactionId).toBe('tx-12345-67890');
      expect(transactionError.context?.rollbackReason).toBe('deadlock-detected');
      expect(transactionError.context?.affectedTables).toHaveLength(3);
    });

    it('Then 異常系：ロールバック自体が失敗した場合のエラー処理', () => {
      const rollbackFailureContext: DatabaseTransactionFailureContext = {
        ...simulateDatabaseTransactionFailure(),
        rollbackReason: 'rollback-failed',
        rollbackDuration: -1, // 負の値で失敗を示す
      };

      const rollbackError = new TestAglaError(
        'ROLLBACK_FAILURE',
        'Transaction rollback failed',
        {
          code: 'E_ROLLBACK_FAILURE',
          severity: ErrorSeverity.FATAL,
          context: rollbackFailureContext satisfies DatabaseTransactionFailureContext,
        },
      );

      expect(rollbackError.context?.rollbackReason).toBe('rollback-failed');
      expect(rollbackError.context?.rollbackDuration).toBe(-1);
      expect(rollbackError.severity).toBe(ErrorSeverity.FATAL);
    });

    it('Then エッジケース：大量のテーブルが関与するトランザクションでも処理される', () => {
      const largeTables = Array.from({ length: 100 }, (_, i) => `table_${i}`);
      const largeTransactionContext: DatabaseTransactionFailureContext = {
        ...simulateDatabaseTransactionFailure(),
        affectedTables: largeTables,
        rollbackDuration: 60000, // 1分
      };

      const largeTransactionError = new TestAglaError(
        'LARGE_TRANSACTION_ROLLBACK',
        'Large transaction rollback completed',
        {
          code: 'E_LARGE_TRANSACTION_ROLLBACK',
          severity: ErrorSeverity.WARNING,
          context: largeTransactionContext satisfies DatabaseTransactionFailureContext,
        },
      );

      expect((largeTransactionError.context as DatabaseTransactionFailureContext).affectedTables).toHaveLength(100);
      expect(largeTransactionError.context?.rollbackDuration).toBe(60000);
      expect((largeTransactionError.context as DatabaseTransactionFailureContext).affectedTables[0]).toBe('table_0');
      expect((largeTransactionError.context as DatabaseTransactionFailureContext).affectedTables[99]).toBe('table_99');
    });
  });

  describe('When database replication lag causes read consistency issues', () => {
    it('Then 正常系：レプリケーション遅延時の読み取り一貫性エラーが適切に検出される', () => {
      const replicationContext = simulateDatabaseReplicationLag();
      const replicationError = new TestAglaError(
        'REPLICATION_LAG_ERROR',
        'Read consistency compromised due to replication lag',
        {
          code: 'E_REPLICATION_LAG',
          severity: ErrorSeverity.WARNING,
          context: replicationContext satisfies DatabaseReplicationContext,
        },
      );

      expect(replicationError.context?.replicationLag).toBeGreaterThan(1000);
      expect(replicationError.context?.replicationLag).toBe(2500);
      expect(replicationError.context?.consistency).toBe('eventual');
      expect(replicationError.context?.readPreference).toBe('secondary');
    });

    it('Then 異常系：極端な遅延でも一貫性エラーが正しく報告される', () => {
      const extremeLagContext: DatabaseReplicationContext = {
        ...simulateDatabaseReplicationLag(),
        replicationLag: 600000, // 10分の遅延
        consistency: 'weak',
      };

      const extremeLagError = new TestAglaError(
        'EXTREME_REPLICATION_LAG',
        'Extreme replication lag detected',
        {
          code: 'E_EXTREME_REPLICATION_LAG',
          severity: ErrorSeverity.ERROR,
          context: extremeLagContext satisfies DatabaseReplicationContext,
        },
      );

      expect(extremeLagError.context?.replicationLag).toBe(600000);
      expect(extremeLagError.context?.consistency).toBe('weak');
      expect(extremeLagError.errorType).toBe('EXTREME_REPLICATION_LAG');
    });

    it('Then エッジケース：レプリケーションが完全に停止した場合の処理', () => {
      const stoppedReplicationContext: DatabaseReplicationContext = {
        ...simulateDatabaseReplicationLag(),
        replicationLag: -1, // 停止を示す特殊値
        consistency: 'strong', // 強整合性が要求されている
        readPreference: 'primary-only',
      };

      const stoppedReplicationError = new TestAglaError(
        'REPLICATION_STOPPED',
        'Replication stopped, falling back to primary',
        {
          code: 'E_REPLICATION_STOPPED',
          severity: ErrorSeverity.ERROR,
          context: stoppedReplicationContext satisfies DatabaseReplicationContext,
        },
      );

      expect(stoppedReplicationError.context?.replicationLag).toBe(-1);
      expect(stoppedReplicationError.context?.consistency).toBe('strong');
      expect(stoppedReplicationError.context?.readPreference).toBe('primary-only');
    });
  });
});
