---
header:
  - src: docs/specs/uni-test.spec.md
  - @(#) : @esta-core/tools-config E2E Test specs
title: @esta-core/tools-config E2E テスト 仕様書
version: 1.0.0
created: 2025-07-19
updated: 2025-07-19
authors:
    - atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-19 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

`@esta-core/tools-config`モジュールの E2E (End-to-End) テスト仕様書です。実際のファイルシステムを使用した統合テストによって、モジュール全体の動作を検証します。

## E2Eテスト方針

### テスト戦略

- 実ファイルシステム: 実際のファイル読み書きをする統合テスト
- 一時ディレクトリ: テスト用の独立した環境を作成
- ライフサイクル管理: テスト前後のセットアップ・クリーンアップ
- フォーマット網羅: JSON、YAML、JavaScript 形式の設定ファイルをテスト

### テストフレームワーク

- テストランナー: Vitest (E2E 設定 - `configs/vitest.config.e2e.ts`)
- ファイル I/O: `@agla-e2e/fileio-framework`
- 一時ディレクトリ: 自動生成・自動削除
- 依存関係: `@esta-utils/config-loader`の統合テスト
- テストコマンド: `pnpm run test:ci`

## E2Eテストスイート構成

### 1. メイン機能E2E (`tests/e2e/getToolsConfig.e2e.spec.ts`)

**概要**: `getToolsConfig` 関数の実ファイルシステムを使用した統合テスト。

**テストコンテキストヘルパー**:

```typescript
const createTestContext = async (
  testName: string,
  testContext: { task: { id: string } },
): Promise<{ testDir: string; cleanup: () => Promise<void> }> => {
  const testDir = await createTempDirectory(`getToolsConfig-${testName}-${testContext.task.id}`);
  return {
    testDir,
    cleanup: async () => {
      await removeDirectory(testDir);
    },
  };
};
```

#### 1.1 完全設定統合テスト

**目的**: 設定読み込み→デフォルトマージ→検証の完全フロー検証。

```typescript
describe('完全設定統合フロー', () => {
  it('有効な設定ファイルから完全なToolsConfigを生成する', async (testContext) => {
    // Given: テストコンテキストを作成（一意の一時ディレクトリ）
    const ctx = await createTestContext('complete-flow', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: 有効な設定ファイルを作成
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

    // When: getToolsConfigを実行
    const result = await getToolsConfig(configFilePath);

    // Then: 完全なToolsConfigが返される
    expect(result.defaultInstallDir).toBe('custom/install/dir');
    expect(result.defaultTempDir).toBe('custom/temp/dir');
    expect(result.tools).toContain(
      expect.objectContaining({
        installer: 'eget',
        id: 'custom-tool',
        repository: 'custom/repo',
      }),
    );
    // デフォルトツールも含まれていることを確認
    expect(result.tools.length).toBeGreaterThan(1);
  });

  it('部分設定でもデフォルトとマージされて完全設定になる', async (testContext) => {
    // Given: 部分設定ファイルを作成
    const configData = {
      defaultTempDir: 'custom/temp/dir',
      // defaultInstallDir, toolsは指定しない
    };

    // When: getToolsConfigを実行
    const result = await getToolsConfig(configFilePath);

    // Then: デフォルト値でマージされた完全設定を返す
    expect(result.defaultInstallDir).toBe('.tools/bin'); // デフォルト値
    expect(result.defaultTempDir).toBe('custom/temp/dir'); // 設定値
    expect(result.tools).toHaveLength(9); // デフォルトツール
  });

  it('空設定でもデフォルト設定として完全設定になる', async (testContext) => {
    // Given: 空の設定ファイルを作成
    const configData = {};

    // When: getToolsConfigを実行
    const result = await getToolsConfig(configFilePath);

    // Then: デフォルト設定が返される
    expect(result.defaultInstallDir).toBe('.tools/bin');
    expect(result.defaultTempDir).toBe('.tools/tmp');
    expect(result.tools).toHaveLength(9);
  });
});
```

#### 1.2 フォーマット別統合テスト

**目的**: 各ファイル形式での完全フロー検証。

```typescript
describe('フォーマット別統合テスト', () => {
  it('YAML設定ファイルで完全フローが動作する', async (testContext) => {
    // Given: YAML形式の設定ファイル
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

    // When: getToolsConfigを実行
    const result = await getToolsConfig(configFilePath);

    // Then: YAML設定が正しく読み込まれ、マージされる
    expect(result.defaultInstallDir).toBe('custom/yaml/dir');
    expect(result.tools).toContainEqual(
      expect.objectContaining({
        installer: 'eget',
        id: 'yaml-tool',
        repository: 'yaml/repo',
      }),
    );
    expect(result.tools.length).toBeGreaterThan(1); // デフォルト + 設定
  });

  it('JavaScript設定ファイルで完全フローが動作する', async (testContext) => {
    // Given: JavaScript形式の設定ファイル
    const jsContent = `
module.exports = {
  defaultInstallDir: 'custom/js/dir',
  tools: [
    {
      installer: 'eget',
      id: 'js-tool',
      repository: 'js/repo',
      version: 'latest'
    }
  ]
};
`;

    // When: getToolsConfigを実行
    const result = await getToolsConfig(configFilePath);

    // Then: JavaScript設定が正しく処理される
    expect(result.defaultInstallDir).toBe('custom/js/dir');
    expect(result.tools).toContainEqual(
      expect.objectContaining({
        installer: 'eget',
        id: 'js-tool',
        repository: 'js/repo',
      }),
    );
  });
});
```

#### 1.3 エラーハンドリング統合テスト

**目的**: 実ファイルシステムでのエラー状況の処理検証。

```typescript
describe('エラーハンドリング統合テスト', () => {
  it('存在しないファイルでエラー終了する', async (testContext) => {
    // Given: テストコンテキストを作成
    const ctx = await createTestContext('nonexistent-file', testContext);
    testContext.onTestFinished(ctx.cleanup);

    // Given: 存在しないファイルパス
    const configFilePath = path.join(ctx.testDir, 'nonexistent-config.json');

    // When/Then: getToolsConfigでerrorExitが呼ばれる
    await expect(getToolsConfig(configFilePath)).rejects.toThrow();
  });

  it('不正なJSONファイルでエラー終了する', async (testContext) => {
    // Given: 不正なJSONファイル
    const invalidJsonContent = '{ invalid json content }';
    await writeFile(configFilePath, invalidJsonContent);

    // When/Then: getToolsConfigでerrorExitが呼ばれる
    await expect(getToolsConfig(configFilePath)).rejects.toThrow();
  });

  it('無効なスキーマの設定でエラー終了する', async (testContext) => {
    // Given: スキーマに違反する設定
    const invalidConfigData = {
      defaultInstallDir: 123, // 数値（文字列ではない）
      tools: ['invalid-tool'], // 文字列配列（オブジェクト配列ではない）
    };

    // When/Then: getToolsConfigでバリデーションエラー
    await expect(getToolsConfig(configFilePath)).rejects.toThrow();
  });
});
```

### 2. 設定読み込みE2E (`tests/e2e/loadConfig.e2e.spec.ts`)

**概要**: `loadToolsConfig` 関数の実ファイルシステムを使用した統合テスト。

#### 2.1 JSONファイル読み込みテスト

**目的**: JSON 形式設定ファイルの実際の読み込み動作検証。

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
    const result = await loadToolsConfig(configFilePath);

    // Then: 成功して読み込まれる
    expect(result.defaultInstallDir).toBeUndefined();
    expect(result.defaultTempDir).toBe('custom/temp/dir');
  });

  it('空のJSONファイルを読み込める', async (testContext) => {
    // Given: 空のJSON設定ファイルを作成
    const configData = {};

    // When: 設定ファイルを読み込む
    const result = await loadToolsConfig(configFilePath);

    // Then: 成功して空の設定が読み込まれる
    expect(result).toEqual({});
  });
});
```

#### 2.2 YAMLファイル読み込みテスト

**目的**: YAML 形式設定ファイルの読み込み統合テスト。

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

#### 2.3 複数ツール設定テスト

**目的**: 複数ツール設定ファイルの処理性能と正確性検証。

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

## 実際のテストファイル構成

### 現在のE2Eテストファイル (2ファイル)

1. **`tests/e2e/getToolsConfig.e2e.spec.ts`**
   - メイン機能の完全フロー統合テスト
   - 設定読み込み→マージ→検証の一連の処理

2. **`tests/e2e/loadConfig.e2e.spec.ts`**
   - 設定ファイル読み込み機能の統合テスト
   - 各種ファイル形式（JSON、YAML）の読み込み

### テストスイート総覧

#### getToolsConfig.e2e.spec.ts

1. **完全設定統合フロー** (3テスト)
   - 有効な設定ファイルからの完全設定生成
   - 部分設定でのデフォルトマージ
   - 空設定でのデフォルト設定使用

2. **フォーマット別統合テスト** (2テスト)
   - YAML 設定ファイルでの完全フロー
   - JavaScript 設定ファイルでの完全フロー

3. **エラーハンドリング統合テスト** (3テスト)
   - 存在しないファイル
   - 不正な JSON ファイル
   - 無効なスキーマの設定

#### loadConfig.e2e.spec.ts

1. **JSONファイル読み込み** (3テスト)
   - 有効な JSON 設定ファイル
   - 部分的な設定ファイル
   - 空の JSON ファイル

2. **YAMLファイル読み込み** (1テスト)
   - YAML 形式の設定ファイル

3. **複数ツール設定** (1テスト)
   - 複数ツールエントリーの処理

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

### JavaScript形式テストデータ

```javascript
module.exports = {
  defaultInstallDir: 'custom/js/dir',
  tools: [
    {
      installer: 'eget',
      id: 'js-tool',
      repository: 'js/repo',
      version: 'latest',
    },
  ],
};
```

### 異常系テストデータ

#### 不正JSON

```javascript
'{ invalid json content }';
```

#### 無効スキーマ

```json
{
  "defaultInstallDir": 123,
  "tools": ["invalid-tool"]
}
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
  const testDir = await createTempDirectory(`${testName}-${testContext.task.id}`);

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
   - 一意の一時ディレクトリ作成 (`{testName}-{taskId}`)
   - テスト用設定ファイル作成 (`writeFile`)
   - クリーンアップ関数の登録 (`testContext.onTestFinished`)

2. **テスト実行**:
   - 実際のファイル I/O 操作
   - `getToolsConfig` / `loadToolsConfig` 関数の呼び出し
   - 結果の検証

3. **テスト後**:
   - 一時ディレクトリの自動削除 (`removeDirectory`)
   - リソースの解放
   - テスト失敗時の確実なクリーンアップ

## パフォーマンス要件

### 処理時間要件

- **小規模設定**（空の設定ファイル）: 50ms 以下
- **中規模設定**（数個のツールエントリー）: 100ms 以下
- **複数ツール設定**（2つのツールエントリー）: 100ms 以下
- **完全フロー**（読み込み→マージ→検証）: 150ms 以下

### メモリ使用量要件

- 設定ファイルサイズの 5倍以下のメモリ使用量
- テスト後のメモリリーク検出（0バイト）
- 一時ディレクトリの確実なクリーンアップ

## 統合テストシナリオ

### シナリオ1: 新規プロジェクト設定

```typescript
test('新規プロジェクトでの設定ファイル作成から完全設定生成まで', async () => {
  // 1. 空のプロジェクトディレクトリ作成
  // 2. tools-config.jsonファイル作成
  // 3. 基本設定の書き込み
  // 4. getToolsConfigによる完全設定生成
  // 5. デフォルト設定とのマージ確認
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
  // 3. 両方から生成される設定の一致確認
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

- 実行頻度: 全コミット、全プルリクエスト
- 並列実行: テストケース間の独立性確保（一意テスト ID 使用）
- クリーンアップ: テスト失敗時の確実なリソース解放
- レポート: 詳細なテスト結果とカバレッジレポート

### 環境別テスト

1. Windows 環境:
   - パス区切り文字の処理確認
   - ファイル権限の違いによる動作確認

2. Linux 環境:
   - Unix パスの処理確認
   - シンボリックリンクの処理確認

3. macOS 環境:
   - ケースセンシティブファイルシステムでの動作確認

### テストコマンド

- E2E テスト実行: `pnpm run test:ci`
- テスト設定: `configs/vitest.config.e2e.ts`
- テストファイル: `tests/e2e/` 配下の 2ファイル
- 統合テスト: `pnpm run test` (単体テスト + E2E テスト)

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
   - I/O 最適化の検討

## 実装完成度

### 現在の実装状況

- E2E テストフレームワーク構築済み
- 実ファイルシステム統合テスト実装済み
- 完全フロー統合テスト（getToolsConfig）実装済み
- 設定読み込み統合テスト（loadToolsConfig）実装済み
- 複数ファイル形式（JSON、YAML、JS）対応
- エラーハンドリング統合テスト実装済み
- 一時ディレクトリ管理システム実装済み

### 品質レベル

- テストカバレッジ: E2E レベルでの包括的なテスト
- 統合テスト: 実ファイルシステムでの動作確認
- エラーハンドリング: プロダクション環境を想定したエラー処理
- パフォーマンス: 実用的なレスポンス時間での動作確認

### 結論

E2E テストスイート実装され、`@esta-core/tools-config`パッケージの実ファイルシステムでの動作を包括的に検証しています。プロダクション環境での信頼性を確保するための十分なテストカバレッジを提供しています。
