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

- **テストランナー**: Vitest (CI設定 - `configs/vitest.config.ci.ts`)
- **ファイルI/O**: `@agla-e2e/fileio-framework`
- **一時ディレクトリ**: 自動生成・自動削除
- **依存関係**: `@esta-utils/config-loader`の統合テスト
- **テストコマンド**: `pnpm run test:ci`

## E2Eテストスイート構成

### 1. 設定ファイル読み込みE2E (`tests/e2e/loadConfig.e2e.spec.ts`)

**概要**: `loadToolsConfig` 関数の実ファイルシステムを使用した統合テスト

**テストコンテキストヘルパー**:

```typescript
const createTestContext = async (
  testName: string,
  testContext: { task: { id: string } },
): Promise<{ testDir: string; cleanup: () => Promise<void> }> => {
  const testDir = await createTempDirectory(`loadConfig-${testName}-${testContext.task.id}`);
  return {
    testDir,
    cleanup: async () => {
      await removeDirectory(testDir);
    },
  };
};
```

#### 1.1 JSONファイル読み込みテスト

**目的**: JSON形式設定ファイルの実際の読み込み動作検証

```typescript
describe('JSONファイル読み込み', () => {
  it('有効なJSON設定ファイルを読み込める', async (testContext) => {
    // Given: テストコンテキストを作成（一意の一時ディレクトリ）
    const ctx = await createTestContext('valid-json', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: 有効なJSON設定ファイルを作成
    const configData = {
      defaultInstallDir: 'custom/install/dir',
      defaultTempDir: 'custom/temp/dir',
      tools: [{
        installer: 'eget',
        id: 'custom-tool',
        repository: 'custom/repo',
        version: 'latest',
        options: {
          '/q': '',
        },
      }],
    };

    // When: 設定ファイルを読み込む
    const result = await loadToolsConfig(configFilePath);

    // Then: 成功して設定が読み込まれる
    expect(result.defaultInstallDir).toBe('custom/install/dir');
    expect(result.tools).toHaveLength(1);
  });

  it('部分的な設定ファイルを読み込める', async (testContext) => {
    // Given: 部分的な設定ファイルを作成
    const configData = {
      defaultTempDir: 'custom/temp/dir',
      // defaultInstallDirは指定しない
    };

    // When: 設定ファイルを読み込む
    // Then: 成功して読み込まれる
    expect(result.defaultInstallDir).toBeUndefined();
  });

  it('空のJSONファイルを読み込める', async (testContext) => {
    // Given: 空のJSON設定ファイルを作成
    const configData = {};

    // When: 設定ファイルを読み込む
    // Then: 成功して空の設定が読み込まれる
    expect(result).toEqual({});
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
  it('YAML設定ファイルを読み込める', async (testContext) => {
    // Given: テストコンテキストを作成
    const ctx = await createTestContext('yaml-config', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: YAML設定ファイルを作成
    const yamlContent = `
defaultInstallDir: custom/yaml/dir
defaultTempDir: custom/yaml/tmp
tools:
  - installer: eget
    id: yaml-tool
    repository: yaml/repo
    version: latest
    options:
      '/q': ''
`;

    // When: 設定ファイルを読み込む
    const result = await loadToolsConfig(configFilePath);

    // Then: 成功して設定が読み込まれる
    expect(result.defaultInstallDir).toBe('custom/yaml/dir');
    expect(result.tools).toHaveLength(1);
    expect(result.tools![0].id).toBe('yaml-tool');
  });
});
```

**検証ポイント**:

- YAML形式の正確なパース処理
- 配列とオブジェクトの適切な変換
- インデント構造の正しい解釈

#### 1.3 複数ツール設定テスト

**目的**: 複数ツール設定ファイルの処理性能と正確性検証

```typescript
describe('複数ツール設定', () => {
  it('複数のツール設定を読み込める', async (testContext) => {
    // Given: テストコンテキストを作成
    const ctx = await createTestContext('multiple-tools', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: 複数のツール設定を含むファイルを作成
    const configData = {
      defaultInstallDir: 'custom/multi/dir',
      tools: [
        { installer: 'eget', id: 'tool1', repository: 'owner1/repo1', version: 'latest' },
        { installer: 'eget', id: 'tool2', repository: 'owner2/repo2', version: 'latest' },
      ],
    };

    // When: 設定ファイルを読み込む
    const result = await loadToolsConfig(configFilePath);

    // Then: 成功して複数のツール設定が読み込まれる
    expect(result.tools).toHaveLength(2);
    expect(result.tools![0].id).toBe('tool1');
    expect(result.tools![1].id).toBe('tool2');
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
  it('存在しないファイルでエラー終了する', async (testContext) => {
    // Given: テストコンテキストを作成
    const ctx = await createTestContext('nonexistent-file', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: 存在しないファイルパス
    const configFilePath = path.join(ctx.testDir, 'nonexistent-config.json');

    // When/Then: 設定ファイル読み込みでerrorExitが呼ばれる
    expect(() => loadToolsConfig(configFilePath)).toThrow();
  });

  it('不正なJSONファイルでエラー終了する', async (testContext) => {
    // Given: テストコンテキストを作成
    const ctx = await createTestContext('invalid-json', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: 不正なJSONファイル
    const invalidJsonContent = '{ invalid json content }';
    await writeFile(configFilePath, invalidJsonContent);

    // When/Then: 設定ファイル読み込みでerrorExitが呼ばれる
    expect(() => loadToolsConfig(configFilePath)).toThrow();
  });
});
```

**検証ポイント**:

- ファイル存在チェックの実動作
- ファイル権限エラーの処理
- 不正フォーマットでのerrorExit処理
- プロセス終了時の適切なエラーハンドリング

### 2. 現在のE2Eテスト構成

**テストファイル**: `tests/e2e/loadConfig.e2e.spec.ts` のみ

**テストスイート総覧**:

1. **JSONファイル読み込み** (3テスト)
   - 有効なJSON設定ファイル
   - 部分的な設定ファイル
   - 空のJSONファイル

2. **YAMLファイル読み込み** (1テスト)
   - YAML形式の設定ファイル

3. **複数ツール設定** (1テスト)
   - 複数ツールエントリーの処理

4. **エラーハンドリング** (2テスト)
   - 存在しないファイル
   - 不正なJSONファイル

**検証ポイント**:

- 実ファイルシステムでのファイルI/O動作
- `@esta-utils/config-loader`との統合動作
- `errorExit`によるエラーハンドリング
- ファイル存在チェックの実動作
- Valibotスキーマによる設定正規化
- 各種ファイル形式（JSON、YAML）の読み込み

## テストデータ設計

### 正常系テストデータ

#### 最小設定データ

```json
{
  "defaultInstallDir": "custom/install/dir",
  "defaultTempDir": "custom/temp/dir",
  "tools": [
    {
      "installer": "eget",
      "id": "custom-tool",
      "repository": "custom/repo",
      "version": "latest",
      "options": {
        "/q": ""
      }
    }
  ]
}
```

#### 部分設定データ

```json
{
  "defaultTempDir": "custom/temp/dir"
}
```

#### 空の設定データ

```json
{}
```

#### 複数ツール設定

```json
{
  "defaultInstallDir": "custom/multi/dir",
  "tools": [
    {
      "installer": "eget",
      "id": "tool1",
      "repository": "owner1/repo1",
      "version": "latest"
    },
    {
      "installer": "eget",
      "id": "tool2",
      "repository": "owner2/repo2",
      "version": "latest"
    }
  ]
}
```

### YAML形式テストデータ

```yaml
defaultInstallDir: custom/yaml/dir
defaultTempDir: custom/yaml/tmp
tools:
  - installer: eget
    id: yaml-tool
    repository: yaml/repo
    version: latest
    options:
      "/q": ""
```

### 異常系テストデータ

#### 不正JSON

```javascript
'{ invalid json content }';
```

#### 存在しないファイル

```javascript
'nonexistent-config.json';
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

**テストコンテキストヘルパーの使用**:

```typescript
const ctx = await createTestContext('test-name', testContext);
testContext.onTestFinished(ctx.cleanup);
```

1. **テスト前**:
   - 一意の一時ディレクトリ作成 (`loadConfig-{testName}-{taskId}`)
   - テスト用設定ファイル作成 (`writeFile`)
   - クリーンアップ関数の登録 (`testContext.onTestFinished`)

2. **テスト実行**:
   - 実際のファイルI/O操作
   - `loadConfig(configFilePath)` 関数の呼び出し
   - `LoadConfigResult` の検証

3. **テスト後**:
   - 一時ディレクトリの自動削除 (`removeDirectory`)
   - リソースの適切な解放
   - テスト失敗時の確実なクリーンアップ

## パフォーマンス要件

### 処理時間要件

- **小規模設定**（空の設定ファイル）: 50ms以下
- **中規模設定**（数個のツールエントリー）: 100ms以下
- **複数ツール設定**（2つのツールエントリー）: 100ms以下

### メモリ使用量要件

- 設定ファイルサイズの5倍以下のメモリ使用量
- テスト後のメモリリーク検出（0バイト）
- 一時ディレクトリの確実なクリーンアップ

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
- **並列実行**: テストケース間の独立性確保（一意テストID使用）
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

### テストコマンド

- **E2Eテスト実行**: `pnpm run test:ci`
- **テスト設定**: `configs/vitest.config.ci.ts`
- **テストファイル**: `tests/e2e/loadConfig.e2e.spec.ts`
- **統合テスト**: `pnpm run test` (単体テスト + E2Eテスト)

## 保守とメンテナンス

### テストデータの保守

- 四半期ごとのテストデータ見直し
- 新機能追加時のテストケース追加
- パフォーマンス劣化検出の継続監視

### 依存関係の管理

- `@esta-utils/config-loader`更新時の回帰テスト
- `@agla-e2e/fileio-framework`更新時の動作確認
- 新しいファイル形式サポート時の統合テスト追加

### テスト改善推奨事項

1. **ファイルサイズ制限テスト**: 大きな設定ファイルの処理テスト追加
2. **ファイル権限テスト**: 読み込み専用ファイルの処理テスト
3. **パフォーマンステスト**: 大量データ処理時のパフォーマンス検証

### トラブルシューティング

1. **テスト失敗の診断**:
   - 一時ディレクトリの状態確認
   - ファイル権限の確認
   - 環境依存の問題の特定

2. **パフォーマンス劣化の対応**:
   - ベンチマークテストの実行
   - メモリプロファイリング
   - I/O最適化の検討
