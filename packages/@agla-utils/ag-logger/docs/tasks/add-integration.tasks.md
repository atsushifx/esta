# Integration Tests Enhancement Tasks

## 概要

E2Eテストの再構成に伴い、単体機能テストとして分類されたテスト内容をintegrationテストに移行・強化する。
atsushifx式BDD形式での統一的なテスト実装により、コンポーネント間の統合動作を包括的に検証する。

---

## 移行対象テスト分析

### E2Eテストから移行すべき内容

#### 1. **内部構造・設定管理テスト**

**移行元**: `tests/e2e/internal-structure/configuration-management.e2e.spec.ts`
**移行先**: `tests/integration/aglogger/core/` (拡張)

**移行理由**: ロガーの設定と内部状態検証は統合テストの範囲

**移行内容**:

- ロガー設定の動的変更検証
- パラメータ省略時のデフォルト動作
- 設定競合時のエラーハンドリング

#### 2. **フォーマッタ検証テスト**

**移行元**: `tests/e2e/formatter-validation/formatter-output-verification.e2e.spec.ts`
**移行先**: `tests/integration/plugins/formatters/` (拡張)

**移行理由**: 各フォーマッタの出力形式は統合テストで十分

**移行内容**:

- PlainFormatterの詳細出力検証
- JsonFormatterの構造化データ処理
- MockFormatterの呼び出し履歴検証

#### 3. **機能検証テスト**

**移行元**: `tests/e2e/feature-validation/filtering-and-log-levels.e2e.spec.ts`
**移行先**: `tests/integration/aglogger/features/` (拡張)

**移行理由**: ログレベルフィルタリングは個別機能テスト

**移行内容**:

- 包括的なログレベルフィルタリング
- 高負荷時のフィルタリング性能
- logメソッドの特殊動作

---

## 実装タスク

### Phase 1: Core機能の強化 【優先度: 高】

#### Task 1.1: 設定管理統合テストの拡張

**ファイル**: `tests/integration/aglogger/core/configuration.integration.spec.ts`

**追加すべきテスト**:

```typescript
describe('Given: 動的設定変更シナリオ', () => {
  describe('When: ログレベルを実行中に変更する', () => {
    it('Then: 新しいレベルが即座に適用される', () => {
      // E2Eから移行: 動的ログレベル変更の詳細検証
    });
  });

  describe('When: パラメータを省略して初期化する', () => {
    it('Then: 適切なデフォルト値が設定される', () => {
      // E2Eから移行: デフォルト設定の包括的検証
    });
  });
});
```

**実装方針**:

- 既存の複雑な設定組み合わせテストを維持
- E2Eから移行する動的変更テストを統合
- MockLoggerとvitestモックを適切に使い分け

#### Task 1.2: フィルタリング機能統合テストの作成

**新規ファイル**: `tests/integration/aglogger/features/filtering.integration.spec.ts`

**実装内容**:

```typescript
describe('Feature: ログレベルフィルタリング統合テスト', () => {
  describe('Context: 全ログレベルでのフィルタリング', () => {
    describe('When: 各ログレベルを設定する', () => {
      // FATAL, ERROR, WARN, INFO, DEBUG, TRACE, OFF の包括的テスト
    });
  });

  describe('Context: 高負荷環境でのフィルタリング', () => {
    describe('When: 大量ログを高速出力する', () => {
      // パフォーマンスと正確性の両立検証
    });
  });
});
```

**実装方針**:

- E2Eの詳細なフィルタリングテストを統合レベルに適応
- 既存の `filtering.integration.spec.ts` と重複を避けて拡張
- 性能テストと機能テストの分離

### Phase 2: Plugin統合の強化 【優先度: 中】

#### Task 2.1: フォーマッタ統合テストの拡張

**ファイル**: `tests/integration/plugins/formatters/formatterTypes.integration.spec.ts`

**追加すべきテスト**:

```typescript
describe('Given: MockFormatterによるテスト支援', () => {
  describe('When: フォーマッタ呼び出しを追跡する', () => {
    it('Then: 正確な呼び出し履歴が記録される', () => {
      // E2Eから移行: MockFormatterの詳細検証
    });
  });
});
```

**実装方針**:

- 既存のフォーマッタタイプテストを維持
- E2EのMockFormatter検証を統合テストレベルに適応
- 複雑データ処理能力の検証を強化

#### Task 2.2: ロガープラグイン統合テストの拡張

**ファイル**: `tests/integration/plugins/loggers/loggerTypes.integration.spec.ts`

**新規追加内容**:

- MockLoggerとE2eMockLoggerの使い分け検証
- ConsoleLoggerとの統合動作確認
- プラグイン間の相互作用テスト

### Phase 3: 高度なシナリオテスト 【優先度: 低】

#### Task 3.1: 複合シナリオ統合テストの作成

**新規ファイル**: `tests/integration/aglogger/scenarios/complexScenarios.integration.spec.ts`

**実装内容**:

- 複数ロガーインスタンスの並行動作
- 設定変更とログ出力の混在シナリオ
- エラー処理と回復シナリオ

#### Task 3.2: パフォーマンス統合テストの強化

**ファイル**: `tests/integration/aglogger/performance/highLoad.integration.spec.ts`

**拡張内容**:

- E2Eから移行した高負荷フィルタリングテスト
- メモリ使用量と処理速度の包括的測定
- 長時間実行シナリオでの安定性検証

---

## 技術的実装ガイドライン

### atsushifx式BDD構造

```typescript
describe('Feature: [機能名]', () => {
  describe('Context: [状況・条件]', () => {
    describe('When: [アクション・操作]', () => {
      it('Then: [期待される結果]', () => {
        // Arrange (Given)
        // Act (When)
        // Assert (Then)
      });
    });
  });
});
```

### モック使い分け原則

#### MockLogger (AgMockBufferLogger) 使用場面

- 内部状態の詳細検証が必要
- メッセージ内容の精密な検証
- パフォーマンステスト

#### vi()モック 使用場面

- 関数呼び出しの回数・引数の検証
- エラーハンドリングのテスト
- 動的設定変更のテスト

#### E2eMockLogger 使用場面

- テスト分離が重要な並行処理テスト
- vitest固有の機能との統合テスト

### テストデータ標準化

#### 共通テストデータ

```typescript
const commonTestData = {
  simple: 'test message',
  withData: { key: 'value', id: 123 },
  complex: {
    user: { id: 123, name: 'test user' },
    metadata: { timestamp: '2024-01-01', active: true },
  },
};
```

#### 共通設定パターン

```typescript
const commonConfigs = {
  basic: { defaultLogger: mockLogger, formatter: PlainFormatter },
  json: { defaultLogger: mockLogger, formatter: JsonFormatter },
  partial: {
    defaultLogger: mockLogger,
    loggerMap: { [AG_LOGLEVEL.ERROR]: errorLogger },
  },
};
```

---

## 実装優先度とスケジュール

### Week 1: Phase 1実装

- [ ] Task 1.1: 設定管理統合テストの拡張
- [ ] Task 1.2: フィルタリング機能統合テストの作成

### Week 2: Phase 2実装

- [ ] Task 2.1: フォーマッタ統合テストの拡張
- [ ] Task 2.2: ロガープラグイン統合テストの拡張

### Week 3: Phase 3実装

- [ ] Task 3.1: 複合シナリオ統合テストの作成
- [ ] Task 3.2: パフォーマンス統合テストの強化

### 完了基準

- [ ] 既存のintegrationテストとの整合性確認
- [ ] E2Eテストからの移行完了
- [ ] 全integrationテストがpassすることを確認
- [ ] コードカバレッジの維持・向上
- [ ] テスト実行時間の最適化

---

## Notes

### 既存テストとの重複回避

- `tests/integration/aglogger/features/filtering.integration.spec.ts` との差分化
- `tests/integration/plugins/formatters/formatterTypes.integration.spec.ts` の拡張方針
- 新規作成ファイルでの命名規則統一

### メンテナンス方針

- 統合テストは単体テストよりも変更頻度を低く保つ
- E2Eテストの真の責務（エンドツーエンド検証）との明確な分離
- パフォーマンステストは別途CI環境での実行も考慮

### 今後の拡張性

- 新しいプラグイン追加時の統合テストパターン
- 設定オプション増加時の回帰テスト戦略
- 互換性テストのフレームワーク準備
