# @esta-core/tools-config E2Eテスト仕様書

## 概要

`@esta-core/tools-config`モジュールのE2E（End-to-End）テスト仕様書です。実際のファイルシステムを使用した統合テストによって、モジュール全体の動作を検証します。

## E2Eテスト方針

### テスト戦略

- **実ファイルシステム**: 実際のファイル読み書きを行う統合テスト
- **一時ディレクトリ**: テスト用の独立した環境を作成
- **ライフサイクル管理**: テスト前後の適切なセットアップ・クリーンアップ
- **フォーマット網羅**: JSON、YAML、JavaScript形式の設定ファイルをテスト

### テストフレームワーク

- **テストランナー**: Vitest (CI設定)
- **ファイルI/O**: `@agla-e2e/fileio-framework`
- **一時ディレクトリ**: 自動生成・自動削除
- **依存関係**: `@esta-utils/config-loader`の統合テスト

## E2Eテストスイート構成

### 1. 設定ファイル読み込みE2E (`tests/e2e/loadConfig.e2e.spec.ts`)

#### 1.1 JSONファイル読み込みテスト

**目的**: JSON形式設定ファイルの実際の読み込み動作検証

```typescript
describe('JSONファイル読み込み', () => {
  test('有効なJSON設定ファイルを読み込める', async (testContext) => {
    // Given: 一時ディレクトリとJSON設定ファイルを作成
    const configData = {
      defaultInstallDir: 'custom/install/dir',
      defaultTempDir: 'custom/temp/dir',
      tools: [{
        installer: 'eget',
        id: 'custom-tool',
        repository: 'custom/repo',
      }],
    };

    // When: loadConfigで実ファイルを読み込み
    // Then: 正確な設定データが取得される
  });

  test('部分的な設定ファイルを読み込める', async (testContext) => {
    // Given: 一部のフィールドのみ含むJSON設定
    // When: loadConfigで読み込み
    // Then: 存在するフィールドのみ取得、未定義フィールドはundefined
  });

  test('空のJSONファイルを読み込める', async (testContext) => {
    // Given: 空のオブジェクト {}
    // When: loadConfigで読み込み
    // Then: 空の設定オブジェクトが取得される
  });
});
```

**検証ポイント**:

- 実ファイルからの正確なデータ読み込み
- JSON形式の正しいパース処理
- 部分設定の適切な処理
- ファイル存在チェックの動作

#### 1.2 YAMLファイル読み込みテスト

**目的**: YAML形式設定ファイルの読み込み統合テスト

```typescript
describe('YAMLファイル読み込み', () => {
  test('YAML設定ファイルを読み込める', async (testContext) => {
    // Given: YAML形式の設定ファイル作成
    const yamlContent = `
defaultInstallDir: custom/yaml/dir
defaultTempDir: custom/yaml/tmp
tools:
  - installer: eget
    id: yaml-tool
    repository: yaml/repo
`;

    // When: loadConfigで読み込み
    // Then: YAML→オブジェクト変換が正確に実行される
  });
});
```

**検証ポイント**:

- YAML形式の正確なパース処理
- 配列とオブジェクトの適切な変換
- インデント構造の正しい解釈

#### 1.3 複数ツール設定テスト

**目的**: 大規模設定ファイルの処理性能と正確性検証

```typescript
describe('複数ツール設定', () => {
  test('複数のツール設定を読み込める', async (testContext) => {
    // Given: 複数ツールエントリーを含む設定ファイル
    const configData = {
      defaultInstallDir: 'custom/multi/dir',
      tools: [
        { installer: 'eget', id: 'tool1', repository: 'owner1/repo1' },
        { installer: 'eget', id: 'tool2', repository: 'owner2/repo2' },
      ],
    };

    // When: loadConfigで読み込み
    // Then: 全ツール設定が正確に読み込まれる
  });
});
```

**検証ポイント**:

- 複数エントリーの順序保持
- 大量データの処理性能
- メモリ効率性

#### 1.4 エラーハンドリングテスト

**目的**: 実ファイルシステムでのエラー状況の処理検証

```typescript
describe('エラーハンドリング', () => {
  test('存在しないファイルでエラーが発生する', async (testContext) => {
    // Given: 存在しないファイルパス
    // When: loadConfigで読み込み試行
    // Then: 適切なエラーメッセージと失敗フラグ
  });

  test('不正なJSONファイルでエラーが発生する', async (testContext) => {
    // Given: 構文エラーのあるJSONファイル
    // When: loadConfigで読み込み試行
    // Then: JSONパースエラーが適切に処理される
  });
});
```

**検証ポイント**:

- ファイル存在チェックの実動作
- ファイル権限エラーの処理
- 不正フォーマットの適切なエラーハンドリング

### 2. config-loader統合確認テスト (`tests/e2e/config-loader-test.spec.ts`)

#### 2.1 config-loader基本動作確認

**目的**: 依存する`@esta-utils/config-loader`の実動作検証

```typescript
describe('config-loader動作確認', () => {
  test('JSONファイルを正しく読み込める', async (testContext) => {
    // Given: テスト用JSONファイルを実際に作成
    // When: config-loaderのloadConfig関数で直接読み込み
    // Then: 期待通りの設定オブジェクトが返される
  });

  test('存在しないファイルでnullが返される', async (testContext) => {
    // Given: 存在しないファイル名を指定
    // When: config-loader呼び出し
    // Then: nullが返される（例外ではない）
  });
});
```

**検証ポイント**:

- 外部依存ライブラリの正確な動作
- エラー処理の一貫性
- ファイル検索の実動作

#### 2.2 複数フォーマット対応確認

```typescript
describe('YAMLファイル読み込み', () => {
  test('YAMLファイルを正しく読み込める', async (testContext) => {
    // Given: YAML形式の実ファイル
    // When: config-loaderで読み込み
    // Then: 正確なオブジェクト変換
  });
});
```

## テストデータ設計

### 正常系テストデータ

#### 最小設定データ

```json
{
  "defaultInstallDir": ".tools/bin",
  "defaultTempDir": ".tools/tmp",
  "tools": []
}
```

#### 完全設定データ

```json
{
  "defaultInstallDir": "custom/install/dir",
  "defaultTempDir": "custom/temp/dir",
  "tools": [
    {
      "installer": "eget",
      "id": "ripgrep",
      "repository": "BurntSushi/ripgrep",
      "options": {
        "version": "latest",
        "quiet": true,
        "asset": "ripgrep-*-x86_64-unknown-linux-gnu.tar.gz"
      }
    }
  ]
}
```

#### 大規模設定データ

```json
{
  "defaultInstallDir": "tools/bin",
  "defaultTempDir": "tools/tmp",
  "tools": [
    // 100個のツールエントリー（パフォーマンステスト用）
  ]
}
```

### YAML形式テストデータ

```yaml
defaultInstallDir: custom/yaml/dir
defaultTempDir: custom/yaml/tmp
tools:
  - installer: eget
    id: jq
    repository: jqlang/jq
    options:
      version: latest
      quiet: true
  - installer: eget
    id: ripgrep
    repository: BurntSushi/ripgrep
    options:
      asset: "ripgrep-*-x86_64-unknown-linux-gnu.tar.gz"
```

### 異常系テストデータ

#### 不正JSON

```text
{
  "defaultInstallDir": "test",
  "defaultTempDir": "temp"
  // 意図的な構文エラー: カンマ不足
}
```

#### 不正YAML

```yaml
defaultInstallDir: test
defaultTempDir: temp
tools:
  - installer: eget
    id: test
  repository: invalid/indent  # 不正なインデント
```

## テスト環境とライフサイクル

### テスト環境セットアップ

```typescript
const createTestContext = async (
  testName: string,
  testContext: { task: { id: string } },
): Promise<{ testDir: string; cleanup: () => Promise<void> }> => {
  // 一意の一時ディレクトリ作成
  const testDir = await createTempDirectory(`loadConfig-${testName}-${testContext.task.id}`);

  return {
    testDir,
    cleanup: async () => {
      await removeDirectory(testDir);
    },
  };
};
```

### ライフサイクル管理

1. **テスト前**:
   - 一意の一時ディレクトリ作成
   - テスト用設定ファイル作成
   - クリーンアップ関数の登録

2. **テスト実行**:
   - 実際のファイルI/O操作
   - loadConfig関数の呼び出し
   - 結果の検証

3. **テスト後**:
   - 一時ディレクトリの自動削除
   - リソースの適切な解放

## パフォーマンス要件

### 処理時間要件

- **小規模設定**（10ツール以下）: 50ms以下
- **中規模設定**（100ツール以下）: 200ms以下
- **大規模設定**（1000ツール以下）: 2秒以下

### メモリ使用量要件

- 設定ファイルサイズの5倍以下のメモリ使用量
- テスト後のメモリリーク検出（0バイト）

## 統合テストシナリオ

### シナリオ1: 新規プロジェクト設定

```typescript
test('新規プロジェクトでの設定ファイル作成から読み込みまで', async () => {
  // 1. 空のプロジェクトディレクトリ作成
  // 2. tools-config.jsonファイル作成
  // 3. デフォルト設定の書き込み
  // 4. loadConfigによる読み込み
  // 5. 設定内容の検証
});
```

### シナリオ2: 既存設定の更新

```typescript
test('既存設定ファイルの更新と再読み込み', async () => {
  // 1. 初期設定ファイル作成・読み込み
  // 2. 設定ファイルの部分更新
  // 3. 再読み込みによる変更検出
  // 4. 更新内容の反映確認
});
```

### シナリオ3: フォーマット変換

```typescript
test('JSON設定からYAML設定への変換', async () => {
  // 1. JSON形式の設定ファイル作成
  // 2. YAML形式での同じ設定作成
  // 3. 両方を読み込み、内容の一致確認
});
```

## エラーシナリオテスト

### ファイルシステムエラー

```typescript
describe('ファイルシステムエラー', () => {
  test('読み込み権限なしファイル', async () => {
    // ファイル権限を制限して読み込み不可状態を作成
    // 適切なエラーハンドリングを確認
  });

  test('ディスク容量不足での書き込み失敗', async () => {
    // ディスク容量制限環境でのエラー処理確認
  });
});
```

### ネットワークファイルシステム

```typescript
describe('ネットワークファイルシステム', () => {
  test('ネットワーク遅延下での設定読み込み', async () => {
    // ネットワークドライブ上の設定ファイル読み込み
    // タイムアウト処理の確認
  });
});
```

## 継続的インテグレーション

### CI環境での実行

- **実行頻度**: 全コミット、全プルリクエスト
- **並列実行**: テストケース間の独立性確保
- **クリーンアップ**: テスト失敗時の確実なリソース解放
- **レポート**: 詳細なテスト結果とカバレッジレポート

### 環境別テスト

1. **Windows環境**:
   - パス区切り文字の処理確認
   - ファイル権限の違いによる動作確認

2. **Linux環境**:
   - Unixパスの処理確認
   - シンボリックリンクの処理確認

3. **macOS環境**:
   - ケースセンシティブファイルシステムでの動作確認

## 保守とメンテナンス

### テストデータの保守

- 四半期ごとのテストデータ見直し
- 新機能追加時のテストケース追加
- パフォーマンス劣化検出の継続監視

### 依存関係の管理

- `@esta-utils/config-loader`更新時の回帰テスト
- `@agla-e2e/fileio-framework`更新時の動作確認
- 新しいファイル形式サポート時の統合テスト追加

### トラブルシューティング

1. **テスト失敗の診断**:
   - 一時ディレクトリの状態確認
   - ファイル権限の確認
   - 環境依存の問題の特定

2. **パフォーマンス劣化の対応**:
   - ベンチマークテストの実行
   - メモリプロファイリング
   - I/O最適化の検討
