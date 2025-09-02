import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';
import type { AglaErrorContext } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// E-005-03: 並行アクセス時のデータ整合性エラーテスト用型定義

/**
 * データ整合性エラー発生時のコンテキスト情報
 * E-005-03用の専用型定義
 */
type DataIntegrityContext = AglaErrorContext & {
  /** 期待されたバージョン: 楽観的ロック用 */
  readonly expectedVersion: number;
  /** 実際のバージョン: 競合検出用 */
  readonly actualVersion: number;
  /** 影響を受けたデータエンティティ */
  readonly affectedEntity: {
    readonly entityId: string;
    readonly entityType: string;
    readonly lastModified: number;
    readonly modifiedBy: string;
  };
  /** 並行アクセス詳細 */
  readonly concurrentAccess: readonly {
    readonly sessionId: string;
    readonly operationType: 'read' | 'write' | 'update' | 'delete';
    readonly timestamp: number;
    readonly userId: string;
  }[];
  /** 整合性チェック結果 */
  readonly integrityCheckResult:
    | 'version-conflict'
    | 'checksum-mismatch'
    | 'timestamp-violation'
    | 'constraint-violation';
  /** データ復旧可能性 */
  readonly recoverable: boolean;
  /** 提案される解決策 */
  readonly suggestedResolution: 'retry' | 'merge' | 'manual-review' | 'rollback';
};

// シミュレーション関数の戻り値型
type DataIntegritySimulationResult = {
  readonly error: TestAglaError;
  readonly context: DataIntegrityContext;
  readonly actualVersion: number;
  readonly expectedVersion: number;
};

// シミュレーション関数 - RED段階では未実装（エラーを投げる）

/**
 * データ整合性エラーをシミュレートする関数
 * E-005-03: 楽観的ロックによるバージョン競合確認用
 */
const simulateDataIntegrityError = async (): Promise<DataIntegritySimulationResult> => {
  // GREEN段階: 最小実装 - テストを通すために必要最小限の実装
  const currentTime = Date.now();
  const expectedVersion = 42;
  const actualVersion = 45; // バージョン競合をシミュレート

  const affectedEntity = {
    entityId: 'user-profile-12345',
    entityType: 'UserProfile',
    lastModified: currentTime - 1000,
    modifiedBy: 'user-session-67890',
  };

  const concurrentAccess = [
    {
      sessionId: 'session-alpha-001',
      operationType: 'update' as const,
      timestamp: currentTime - 500,
      userId: 'user-alice',
    },
    {
      sessionId: 'session-beta-002',
      operationType: 'update' as const,
      timestamp: currentTime - 300,
      userId: 'user-bob',
    },
  ];

  const context: DataIntegrityContext = {
    expectedVersion,
    actualVersion,
    affectedEntity,
    concurrentAccess,
    integrityCheckResult: 'version-conflict',
    recoverable: true,
    suggestedResolution: 'retry',
  };

  const error = new TestAglaError(
    'DATA_INTEGRITY_VIOLATION',
    `Version conflict detected: expected version ${expectedVersion} but found ${actualVersion} for entity ${affectedEntity.entityId}`,
    {
      code: 'E_DATA_INTEGRITY',
      severity: ErrorSeverity.ERROR,
      context,
    },
  );

  return { error, context, actualVersion, expectedVersion };
};

describe('Given AglaError in concurrent data access environment', () => {
  describe('When E-005-03 data integrity violations occur during concurrent access', () => {
    it('Then バージョン競合検出: expectedVersionとactualVersionが異なる値で記録される', async () => {
      // Arrange: バージョン競合シミュレーションの準備

      // Act: データ整合性エラーシミュレーション実行
      const result = await simulateDataIntegrityError();
      const integrityError = result.error;

      // Assert: バージョン競合の検証
      const context = integrityError.context as DataIntegrityContext;
      expect(context.expectedVersion).toBeDefined();
      expect(context.actualVersion).toBeDefined();
      expect(context.expectedVersion).not.toBe(context.actualVersion);
      expect(result.expectedVersion).not.toBe(result.actualVersion);
    });

    it('Then エンティティ情報記録: affectedEntityに競合したデータエンティティ情報が記録される', async () => {
      // Arrange & Act
      const result = await simulateDataIntegrityError();
      const integrityError = result.error;
      const context = integrityError.context as DataIntegrityContext;
      const entity = context.affectedEntity;

      // Assert: エンティティ情報の検証
      expect(entity.entityId).toBeDefined();
      expect(entity.entityType).toBeDefined();
      expect(entity.lastModified).toBeDefined();
      expect(entity.modifiedBy).toBeDefined();
      expect(typeof entity.entityId).toBe('string');
      expect(typeof entity.entityType).toBe('string');
      expect(typeof entity.lastModified).toBe('number');
      expect(typeof entity.modifiedBy).toBe('string');
    });

    it('Then 並行アクセス記録: concurrentAccessに競合したアクセス情報が記録される', async () => {
      // Arrange & Act
      const result = await simulateDataIntegrityError();
      const integrityError = result.error;
      const context = integrityError.context as DataIntegrityContext;
      const accesses = context.concurrentAccess;

      // Assert: 並行アクセス情報の検証
      expect(accesses).toBeDefined();
      expect(Array.isArray(accesses)).toBe(true);
      expect(accesses.length).toBeGreaterThan(0);

      // 各アクセス情報の検証
      accesses.forEach((access) => {
        expect(access.sessionId).toBeDefined();
        expect(['read', 'write', 'update', 'delete']).toContain(access.operationType);
        expect(access.timestamp).toBeDefined();
        expect(access.userId).toBeDefined();
      });
    });

    it('Then 整合性チェック結果記録: integrityCheckResultに適切な競合タイプが記録される', async () => {
      // Arrange & Act
      const result = await simulateDataIntegrityError();
      const integrityError = result.error;

      // Assert: 整合性チェック結果の検証
      const context = integrityError.context as DataIntegrityContext;
      const validResults = ['version-conflict', 'checksum-mismatch', 'timestamp-violation', 'constraint-violation'];
      expect(validResults).toContain(context.integrityCheckResult);
    });

    it('Then 復旧可能性評価: recoverableに復旧可能性フラグが設定される', async () => {
      // Arrange & Act
      const result = await simulateDataIntegrityError();
      const integrityError = result.error;

      // Assert: 復旧可能性の検証
      const context = integrityError.context as DataIntegrityContext;
      expect(typeof context.recoverable).toBe('boolean');
    });

    it('Then 解決策提案: suggestedResolutionに適切な解決策が提案される', async () => {
      // Arrange & Act
      const result = await simulateDataIntegrityError();
      const integrityError = result.error;

      // Assert: 解決策の検証
      const context = integrityError.context as DataIntegrityContext;
      const validResolutions = ['retry', 'merge', 'manual-review', 'rollback'];
      expect(validResolutions).toContain(context.suggestedResolution);
    });
  });
});
