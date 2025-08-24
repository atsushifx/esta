# AgLogger インテグレーションテスト再構成タスク

## 概要

`tests/integration`下のすべてのインテグレーションテストをスキャン、レビューして重複したテスト、開発用の関数存在チェックなどのテストを削除し、また各テストケースを振る舞い、目的、種類別に統合、整理し、階層構造にしてその階層構造をDescribeに写してテストを再構成する。

**実装方針**: atsushifx式BDDを使用し、各テストごとにテストが通ることを確認しながらコードを書き直す。

## 現在の構造分析

### 既存ファイル構造

```
tests/integration/
├── AgLogger.integration.spec.ts                    # メインエントリーポイント
├── AgLoggerManager.integration.spec.ts             # マネージャー統合テスト
├── PluginInteraction.integration.spec.ts           # プラグイン相互作用テスト
└── aglogger/
    ├── basic.integration.spec.ts                   # 基本統合テスト
    ├── configuration.integration.spec.ts           # 設定統合テスト
    ├── dataProcessing.integration.spec.ts          # データ処理統合テスト
    ├── edgecases.integration.spec.ts              # エッジケース統合テスト
    ├── filtering.integration.spec.ts              # フィルタリング統合テスト
    └── performance.integration.spec.ts            # パフォーマンス統合テスト
```

## 重複・不要テスト分析結果

### 1. 開発用の関数存在チェック

- `AgLoggerManager.integration.spec.ts`の`getFormatter`メソッド呼び出しテスト（コメントアウト済み）
- テスト内の不要な開発用変数宣言

### 2. 重複したテスト内容

- **プラグイン組み合わせテスト**: `PluginInteraction.integration.spec.ts`と各ファイルに散在
- **循環参照テスト**: `dataProcessing.integration.spec.ts`と`PluginInteraction.integration.spec.ts`に重複
- **パフォーマンステスト**: 複数ファイルに分散

### 3. 階層構造の問題

- テストの責務が不明確（機能別ではなくファイル別に分散）
- BDD構造が統一されていない

## 新しい階層構造設計（テストスイート別）

### 最終ディレクトリ構造

```
tests/integration/
├── agLogger/                              # AgLogger.class のテスト
│   ├── singleton.integration.spec.ts      # シングルトン管理の統合テスト
│   ├── configuration.integration.spec.ts  # 設定管理の統合テスト
│   ├── plugins.integration.spec.ts        # プラグイン統合テスト
│   ├── dataProcessing.integration.spec.ts # データ処理統合テスト
│   └── filtering.integration.spec.ts      # フィルタリング統合テスト
├── agLoggerManager/                       # AgLoggerManager.class のテスト
│   └── manager.integration.spec.ts        # マネージャー統合テスト
├── utils/
│   └── testEnvironment.ts                 # 共通テスト環境設定
└── AgLogger.integration.spec.ts           # メインエントリーポイント
```

## setupTestEnvironment共通関数設計

### utils/testEnvironment.ts

```typescript
// utils/testEnvironment.ts
export const setupTestEnvironment = (ctx: TestContext) => {
  const mockLogger = new MockLogger.buffer();
  const mockFormatter = MockFormatter.passthrough;

  ctx.onTestFinished(() => {
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
    mockLogger.clearAllMessages();
    vi.clearAllMocks();
  });

  return { mockLogger, mockFormatter };
};
```

## 各ファイルのTOP describe構造

### agLogger/singleton.integration.spec.ts

```typescript
describe('AgLogger Singleton Management Integration');
describe('AgLogger Instance State Sharing Integration');
describe('AgLogger Singleton Error Recovery Integration');
```

### agLogger/configuration.integration.spec.ts

```typescript
describe('AgLogger Complex Configuration Integration');
describe('AgLogger Dynamic Configuration Changes Integration');
describe('AgLogger Configuration Conflict Resolution Integration');
```

### agLogger/plugins.integration.spec.ts

```typescript
describe('AgLogger-Formatter Plugin Integration');
describe('AgLogger-ConsoleLoggerMap Integration');
describe('AgLogger Plugin Error Recovery Integration');
```

### agLogger/dataProcessing.integration.spec.ts

```typescript
describe('AgLogger Circular Reference Processing Integration');
describe('AgLogger Complex Object Processing Integration');
describe('AgLogger Large Data Processing Integration');
```

### agLogger/filtering.integration.spec.ts

```typescript
describe('AgLogger Log Level Filtering Integration');
describe('AgLogger Verbose Functionality Integration');
describe('AgLogger Dynamic Filtering Integration');
```

### agLoggerManager/manager.integration.spec.ts

```typescript
describe('AgLoggerManager Singleton Integration');
describe('AgLoggerManager Logger Map Integration');
describe('AgLoggerManager Configuration Integration');
```

## 実行計画

### フェーズ1: 共通テスト環境の準備

1. `utils/testEnvironment.ts` 作成
   - 重複するテスト初期設定を一元化

### フェーズ2: AgLogger.class テストスイートの作成

2. `agLogger/singleton.integration.spec.ts` 作成
   - AgLogger のシングルトン管理統合テスト
3. `agLogger/configuration.integration.spec.ts` 作成
   - AgLogger の設定管理統合テスト
4. `agLogger/plugins.integration.spec.ts` 作成
   - AgLogger のプラグイン統合テスト
5. `agLogger/dataProcessing.integration.spec.ts` 作成
   - AgLogger のデータ処理統合テスト
6. `agLogger/filtering.integration.spec.ts` 作成
   - AgLogger のフィルタリング統合テスト

### フェーズ3: AgLoggerManager.class テストスイートの整理

7. `agLoggerManager/manager.integration.spec.ts` 作成
   - 既存のAgLoggerManager.integration.spec.tsから不要部分を除去し移動

### フェーズ4: 旧ファイル整理

8. 旧ファイル削除
   - `AgLoggerManager.integration.spec.ts` (agLoggerManager/に移動後)
   - `PluginInteraction.integration.spec.ts`
   - `aglogger/basic.integration.spec.ts`
   - `aglogger/configuration.integration.spec.ts`
   - `aglogger/dataProcessing.integration.spec.ts`
   - `aglogger/edgecases.integration.spec.ts`
   - `aglogger/filtering.integration.spec.ts`
   - `aglogger/performance.integration.spec.ts`
   - `aglogger/` ディレクトリ（空になるため）

9. 新メインエントリーポイント更新
   - `AgLogger.integration.spec.ts` を更新し、新しいサブディレクトリ構造のファイルをimport

### フェーズ5: 検証

10. テスト動作確認
    - 各新ファイルで `pnpm run test:ci` 実行
    - 全テストが正常に通ることを確認
    - 重複テストが除去されていることを確認

## 削除する重複・不要テスト

1. **開発用関数存在チェック**: AgLoggerManagerの`getFormatter`メソッド呼び出し（コメントアウト済み）
2. **重複プラグインテスト**: PluginInteraction.integration.spec.ts と各ファイル間の重複
3. **重複循環参照テスト**: dataProcessing と PluginInteraction ファイル間の重複
4. **重複パフォーマンステスト**: 複数ファイルに分散していた性能テスト
5. **不要な開発用変数宣言**: テスト内の未使用変数

## 期待される改善効果

- **明確な責務分離**: テストスイート（クラス）別のディレクトリ構造
- **保守性向上**: 機能別の明確な分類と共通テスト環境
- **重複削除**: テストの重複による実行時間短縮
- **BDD統一**: atsushifx式BDDによる可読性向上
- **テスト品質**: 各テストケースの目的と期待値の明確化

## 進捗状況

- [x] 現在のインテグレーションテストディレクトリをスキャンし構造を把握
- [x] 各テストファイルの内容を分析し重複や不要なテストを特定
- [x] 振る舞い・目的・種類別にテストを分類し階層構造を設計
- [x] テストスイート別サブディレクトリ構造の再設計（agLogger/agLoggerManager等）
- [ ] utils/testEnvironment.tsにsetupTestEnvironment共通関数を作成
- [ ] agLogger/singleton.integration.spec.tsを作成しシングルトン管理テストを実装
- [ ] agLogger/configuration.integration.spec.tsを作成し設定管理テストを実装
- [ ] agLogger/plugins.integration.spec.tsを作成しプラグイン統合テストを実装
- [ ] agLogger/dataProcessing.integration.spec.tsを作成しデータ処理テストを実装
- [ ] agLogger/filtering.integration.spec.tsを作成しフィルタリングテストを実装
- [ ] agLoggerManager/manager.integration.spec.tsを作成しマネージャーテストを整理
- [ ] 旧ファイル削除と新メインエントリーポイント作成
- [ ] 各テストが正常に動作することを確認

## 注意事項

- テストの再配置、再構成はatsushifx式BDDを使用する
- 各テストごとにテストが通ることを確認しながらコードを書き直す
- 1つのファイルにTOP describeが複数あってもよい
- 初期設定が重複するなら、setupTestEnvironment関数を作成し、その中でbeforeEach,afterEachを宣言する
