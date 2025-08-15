# E2E Tests Refactoring Tasks

## 概要

E2Eテストを本来の責務（エンドツーエンド統合検証）に集中させるための再構成プラン。
単体機能テストをintegrationテストに移行し、真のE2Eワークフローに特化したテストスイートを構築する。

---

## 更新状況（完了）

- 新E2Eディレクトリ（Console/Mock 系）へ集約し、旧 `tests/e2e/agLogger/*` は削除済み。
- 機能粒度テストは Integration 側へ移行・強化済み。
- 実行結果（現時点）: E2E 21 passed / Integration 88 passed（グリーン）。
- 追加ガイド: `docs/testing/e2e-guidelines.md` に新構造と追加ルール、スケルトンを記載。

本ファイルの「提案する新構造」「実装タスク」は設計意図の履歴として残し、実装の詳細は `docs/testing/e2e-guidelines.md` を参照。

---

## 現状分析

### 現在のE2Eテスト構造

```
tests/e2e/
├── console-output/           # Console出力検証 → 部分保持
├── internal-structure/       # 内部構造検証 → Integration移行
├── formatter-validation/     # フォーマッタ検証 → Integration移行
├── feature-validation/       # 機能検証 → Integration移行
├── scenario-validation/      # シナリオ検証 → 保持・拡張
└── mock-validation/         # Mock統合検証 → 保持・拡張
```

### 問題点

- **責務の混在**: 単体機能テストとE2Eテストが同一階層に存在
- **テスト粒度の不統一**: 詳細な機能テストから高レベルシナリオまで混在
- **保守性の低下**: E2Eとして不適切なテストの存在

---

## E2Eテストの真の責務定義

### Core責務: エンドツーエンドワークフロー

1. **アプリケーション全体の動作確認**
   - 初期化 → 設定 → ログ出力 → 終了の完全フロー
   - 実際のユーザー操作パターンの再現

2. **統合動作の検証**
   - 複数コンポーネント（Logger + Formatter + Output）の連携
   - 異なる設定組み合わせでの一貫した動作

3. **実環境シミュレーション**
   - 実際の使用方法での動作確認
   - エラーシナリオを含む現実的なワークフロー

### Non-Core: 他テスト層の責務

- **個別機能テスト** → Unit/Integration
- **内部実装検証** → Integration
- **パフォーマンステスト** → 専用Performance

---

## 新しいE2Eテスト構造

### 提案する新構造

```
tests/e2e/
├── console-integration/         # Console出力統合テスト（vi()使用）
│   ├── real-world-usage/        # 実際の使用パターン
│   │   ├── basic-logging-workflow.e2e.spec.ts
│   │   ├── error-handling-scenarios.e2e.spec.ts
│   │   └── configuration-changes.e2e.spec.ts
│   └── output-verification/     # 出力統合検証
│       ├── formatter-integration.e2e.spec.ts
│       └── multi-format-output.e2e.spec.ts
│
└── mock-integration/            # Mock環境統合テスト（直接制御）
    ├── application-workflows/   # アプリケーションワークフロー
    │   ├── startup-to-shutdown.e2e.spec.ts
    │   ├── configuration-lifecycle.e2e.spec.ts
    │   └── error-recovery.e2e.spec.ts
    ├── multi-component/         # 複数コンポーネント連携
    │   ├── logger-formatter-combinations.e2e.spec.ts
    │   ├── parallel-logging.e2e.spec.ts
    │   └── resource-management.e2e.spec.ts
    └── end-to-end-scenarios/    # 完全なE2Eシナリオ
        ├── production-simulation.e2e.spec.ts
        ├── high-load-scenarios.e2e.spec.ts
        └── edge-case-workflows.e2e.spec.ts
```

---

## 実装タスク

### Phase 1: 不適切なテストの移行・削除 【優先度: 高】

#### Task 1.1: Integration移行対象の特定と移行

**対象ファイル**:

- `internal-structure/configuration-management.e2e.spec.ts` → Integration
- `formatter-validation/formatter-output-verification.e2e.spec.ts` → Integration
- `feature-validation/filtering-and-log-levels.e2e.spec.ts` → Integration

**作業内容**:

```bash
# 移行先への適切な配置
mv tests/e2e/internal-structure/configuration-management.e2e.spec.ts \
   tests/integration/aglogger/core/configuration-advanced.integration.spec.ts

mv tests/e2e/formatter-validation/formatter-output-verification.e2e.spec.ts \
   tests/integration/plugins/formatters/formatter-detailed.integration.spec.ts

mv tests/e2e/feature-validation/filtering-and-log-levels.e2e.spec.ts \
   tests/integration/aglogger/features/filtering-detailed.integration.spec.ts
```

#### Task 1.2: 旧ディレクトリの削除

**削除対象**:

- `tests/e2e/internal-structure/`
- `tests/e2e/formatter-validation/`
- `tests/e2e/feature-validation/`

### Phase 2: 真のE2Eテストの再設計 【優先度: 高】

#### Task 2.1: Console Integration テストの作成

**新規ファイル**: `tests/e2e/console-integration/real-world-usage/basic-logging-workflow.e2e.spec.ts`

**実装内容**:

```typescript
describe('Feature: 実際のアプリケーションログ利用ワークフロー', () => {
  describe('Context: 典型的なWebアプリケーション環境', () => {
    describe('When: アプリケーション全体のライフサイクルを実行', () => {
      it('Then: 一貫したログ出力が実現される', () => {
        // Given: リアルな初期化設定
        // When: 起動→リクエスト処理→エラーハンドリング→終了
        // Then: 各フェーズでの適切なコンソール出力確認
      });
    });
  });
});
```

#### Task 2.2: Mock Integration テストの作成

**新規ファイル**: `tests/e2e/mock-integration/application-workflows/startup-to-shutdown.e2e.spec.ts`

**実装内容**:

```typescript
describe('Feature: アプリケーション完全ライフサイクル', () => {
  describe('Context: プロダクション環境シミュレーション', () => {
    describe('When: 完全な起動から終了までを実行', () => {
      it('Then: 全フェーズで正常な動作を維持', () => {
        // Given: プロダクション相当の設定
        // When: 起動→設定読込→ログ出力→リソース解放→終了
        // Then: 各段階での適切な状態遷移と出力
      });
    });
  });
});
```

#### Task 2.3: 既存保持テストの改修

**対象ファイル**:

- `console-output/basic-console-output.e2e.spec.ts` → 統合ワークフローテストに改修
- `scenario-validation/application-lifecycle.e2e.spec.ts` → より包括的なシナリオに拡張
- `mock-validation/e2e-mock-logger-integration.e2e.spec.ts` → E2E統合テストとして再設計

### Phase 3: 高度なE2Eシナリオの追加 【優先度: 中】

#### Task 3.1: 実世界シナリオテストの作成

**新規ファイル**: `tests/e2e/console-integration/real-world-usage/error-handling-scenarios.e2e.spec.ts`

**シナリオ例**:

- ネットワークエラー発生時のログ出力継続
- 設定ファイル破損からの復旧シナリオ
- メモリ不足時の適切なフォールバック

#### Task 3.2: パフォーマンス統合シナリオ

**新規ファイル**: `tests/e2e/mock-integration/end-to-end-scenarios/high-load-scenarios.e2e.spec.ts`

**シナリオ例**:

- 高負荷環境での長時間稼働テスト
- 並行アクセス時のデータ整合性確認
- リソースリーク検出テスト

### Phase 4: テスト支援ツールの整備 【優先度: 低】

#### Task 4.1: E2E専用ヘルパー関数の作成

**新規ファイル**: `tests/e2e/_helpers/e2eWorkflowHelpers.ts`

**実装内容**:

```typescript
export const E2EWorkflowHelpers = {
  simulateApplicationStartup: () => {/* 起動シミュレーション */},
  createRealisticLogScenario: () => {/* リアルなログシナリオ */},
  verifyEndToEndFlow: () => {/* E2Eフロー検証 */},
};
```

#### Task 4.2: Console出力キャプチャーの強化

**既存改修**: `tests/e2e/_helpers/consoleMock.ts`

**追加機能**:

- より現実的なコンソール出力パターン
- タイミング制御機能
- 出力バッファリング機能

---

## 技術的実装ガイドライン

### E2E専用テストパターン

#### Console Integration パターン

```typescript
describe('Feature: [E2E機能名]', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  describe('Context: [実世界の状況]', () => {
    describe('When: [完全なワークフロー]', () => {
      it('Then: [エンドツーエンド結果]', (ctx) => {
        // Arrange: リアルな環境設定
        setup();
        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: PlainFormatter,
        });

        // Act: 完全なワークフロー実行
        simulateRealWorldWorkflow(logger);

        // Assert: E2E結果検証
        verifyEndToEndOutput(mockConsole);
      });
    });
  });
});
```

#### Mock Integration パターン

```typescript
describe('Feature: [E2E機能名]', () => {
  describe('Context: [統合環境]', () => {
    describe('When: [複合操作]', () => {
      it('Then: [統合結果]', (ctx) => {
        // Arrange: 複数コンポーネント準備
        const mockLogger = new E2eMockLogger('e2e-integration');
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        // Act: 複合的な統合操作
        executeIntegratedWorkflow(mockLogger);

        // Assert: 統合動作検証
        verifyIntegratedBehavior(mockLogger);
      });
    });
  });
});
```

### E2Eテスト設計原則

#### 1. **現実性重視**

- 実際のアプリケーション使用パターンを再現
- プロダクション環境に近い設定を使用
- リアルなデータとワークフローでテスト

#### 2. **包括性確保**

- 単一機能ではなく複数機能の連携を検証
- 正常系だけでなく異常系も含む完全フロー
- 開始から終了までの全体プロセス検証

#### 3. **独立性維持**

- E2Eテスト間の相互依存を避ける
- テスト環境の完全な初期化とクリーンアップ
- 並行実行時の競合状態回避

### データ・設定パターン

#### 現実的なテストデータ

```typescript
const realisticTestData = {
  application: {
    startup: { version: '2.1.0', environment: 'production' },
    requests: [
      { id: 'req-001', method: 'GET', path: '/api/users', duration: 45 },
      { id: 'req-002', method: 'POST', path: '/api/auth', duration: 120 },
    ],
    errors: [
      { type: 'NetworkError', message: 'Connection timeout', code: 'ECONNRESET' },
      { type: 'ValidationError', message: 'Invalid input', field: 'email' },
    ],
  },

  configurations: {
    development: { logLevel: AG_LOGLEVEL.DEBUG, formatter: PlainFormatter },
    production: { logLevel: AG_LOGLEVEL.INFO, formatter: JsonFormatter },
    testing: { logLevel: AG_LOGLEVEL.WARN, formatter: NullFormatter },
  },
};
```

---

## 実装スケジュールと完了基準

### Week 1: Phase 1 - 不適切テストの移行

- [ ] Integration移行対象ファイルの特定完了
- [ ] 各ファイルのIntegrationテスト適応完了
- [ ] 旧ディレクトリの削除完了
- [ ] 移行後のテスト実行確認

### Week 2: Phase 2 - 真のE2Eテスト設計

- [ ] Console Integration基本テストの実装
- [ ] Mock Integration基本テストの実装
- [ ] 既存保持テストの改修完了
- [ ] 新構造でのテスト実行確認

### Week 3: Phase 3 - 高度シナリオ追加

- [ ] 実世界シナリオテストの実装
- [ ] パフォーマンス統合シナリオの実装
- [ ] エッジケース・エラーシナリオの実装

### Week 4: Phase 4 - 支援ツール整備

- [ ] E2E専用ヘルパー関数の実装
- [ ] Console出力キャプチャーの強化
- [ ] ドキュメント更新

### 完了基準

- [ ] 全E2Eテストが真のE2E責務を果たしている
- [ ] 単体機能テストが完全にIntegrationに移行済み
- [ ] 実世界使用パターンが適切にカバーされている
- [ ] Console/Mock両系統で一貫したE2E検証が実現
- [ ] テスト実行時間が合理的な範囲に収まっている
- [ ] 新しいE2Eテスト追加のガイドラインが確立

---

## Notes

### 移行時の注意点

- **テスト内容の重複確認**: Integration移行時に既存テストとの重複チェック
- **カバレッジの維持**: E2E責務変更後もカバレッジが適切に維持される
- **CI/CD影響**: テスト構造変更がCI/CDパイプラインに与える影響の確認

### 今後のメンテナンス方針

- **E2E追加基準**: 新しいE2Eテスト追加時の判断基準明文化
- **責務境界の維持**: Unit/Integration/E2Eの責務境界の継続的な明確化
- **パフォーマンス監視**: E2Eテスト実行時間の継続的な監視と最適化

### 長期的改善計画

- **Visual Regression**: 将来的なコンソール出力の視覚的回帰テスト導入検討
- **Contract Testing**: プラグイン間のContract Test導入可能性
- **Mutation Testing**: E2Eテストの品質を測定するMutation Testing導入
