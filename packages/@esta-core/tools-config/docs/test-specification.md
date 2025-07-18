# @esta-core/tools-config テスト仕様書

## 概要

`@esta-core/tools-config`モジュールのユニットテスト仕様書です。TDD（テスト駆動開発）のt-wada方式に基づき、各機能の動作を検証するテストケースを定義します。

## テスト方針

### テスト戦略

- **BDDスタイル**: Given-When-Thenパターンでテストを記述
- **境界値テスト**: 正常値、異常値、境界値を包括的にテスト
- **型安全性**: TypeScriptの型システムとランタイム検証の両方をテスト
- **エラーハンドリング**: 異常系の動作を詳細に検証

### テストフレームワーク

- **テストランナー**: Vitest
- **アサーション**: Vitest標準アサーション
- **カバレッジ**: 100%を目標とした網羅的テスト

## テストスイート構成

### 1. デフォルト設定テスト (`src/__tests__/defaults.spec.ts`)

#### 1.1 defaultToolsConfig関数のテスト

**目的**: デフォルト設定生成機能の検証

```typescript
describe('defaultToolsConfig', () => {
  test('デフォルト設定を正しく返す', () => {
    // Given: デフォルト設定要求
    // When: defaultToolsConfigを呼び出す
    // Then: 正しいデフォルト値を持つToolsConfigを返す
  });

  test('9個のデフォルトツールが含まれている', () => {
    // 期待値: 9個のツールエントリー
  });

  test('特定ツール（gitleaks, gh）が含まれている', () => {
    // 重要ツールの存在確認
  });

  test('すべてのデフォルトツールが有効なegetエントリー', () => {
    // installerが'eget'、リポジトリ形式が正しいことを確認
  });
});
```

**実装されているテストケース**:

- 型安全性のテスト
- デフォルトツールの存在確認
- 設定の構造検証
- 不変性の保証

### 2. 設定読み込みテスト (`src/core/config/__tests__/loadConfig.spec.ts`)

#### 2.1 正常系テスト

**目的**: 設定ファイル読み込み機能の検証

```typescript
describe('loadToolsConfig', () => {
  test('存在する設定ファイルを正常に読み込める', () => {
    // Given: 存在する設定ファイルパス
    // When: loadToolsConfigを実行
    // Then: PartialToolsConfigを返す
  });

  test('JSON形式の設定ファイルを読み込める');
  test('YAML形式の設定ファイルを読み込める');
  test('JavaScript形式の設定ファイルを読み込める');
});
```

#### 2.2 異常系テスト

**目的**: エラーケースの適切な処理確認

```typescript
describe('loadToolsConfig異常系', () => {
  test('存在しないファイルパスでエラー終了する', () => {
    // Given: 存在しないファイルパス
    // When: loadToolsConfigを実行
    // Then: errorExitでプロセス終了
  });

  test('無効な形式のファイルでエラー終了する');
  test('読み込み権限のないファイルでエラー終了する');
});
```

### 3. 設定マージテスト (`src/core/config/__tests__/mergeConfig.spec.ts`)

#### 3.1 正常系テスト

**目的**: 設定マージ機能の検証

```typescript
describe('mergeToolsConfig', () => {
  test('デフォルト設定と部分設定を正しくマージする', () => {
    // Given: デフォルト設定と部分設定
    // When: mergeToolsConfigを実行
    // Then: 統合された設定を返す
  });

  test('ツール配列を正しくマージする');
  test('グローバル設定を上書きする');
});
```

### 4. 統合テスト (`src/core/config/__tests__/integration.spec.ts`)

#### 4.1 設定フロー統合テスト

**目的**: 設定読み込みからマージまでの全体フロー検証

```typescript
describe('設定統合フロー', () => {
  test('設定読み込みからマージまでの完全フロー');
  test('エラーハンドリングの統合テスト');
  test('パフォーマンステスト');
});
```

### 5. スキーマ検証テスト (`src/internal/schemas/__tests__/tools.schemas.spec.ts`)

#### 5.1 ToolsConfigSchemaの検証

**目的**: Valibotスキーマによるランタイム検証

```typescript
describe('ToolsConfigSchema', () => {
  test('有効なToolsConfigオブジェクトを正常に検証できる');
  test('パス正規化（小文字変換、スラッシュ統一）が正しく実行される');
  test('部分設定でも正規化が適用される');
});
```

#### 5.2 CompleteToolsConfigSchemaの検証

**目的**: 完全設定のスキーマ検証

```typescript
describe('CompleteToolsConfigSchema', () => {
  test('完全な設定オブジェクトを正常に検証できる');
  test('必須フィールドが不足している場合はエラーを投げる');
  test('ディレクトリ同一性チェックが正しく実行される');
});
```

### 6. ツール検証テスト

#### 6.1 基本検証テスト (`src/tools-validator/validator/__tests__/validateTools.spec.ts`)

**目的**: ツール検証の基本機能テスト

```typescript
describe('validateTools', () => {
  test('すべて有効なツールエントリーの場合に成功する');
  test('無効なエントリーがある場合にエラーを投げる');
  test('空配列の場合に成功する');
});
```

#### 6.2 egetバリデーターテスト

**API レベルテスト** (`src/tools-validator/validator/__tests__/egetValidator.api.spec.ts`):

- 公開APIの機能テスト
- 型判定テスト
- エラーケースの確認

**内部実装テスト** (`src/tools-validator/validator/__tests__/egetValidator.internal.spec.ts`):

- 内部ロジックの詳細テスト
- 境界値テスト
- パフォーマンステスト

#### 6.3 境界値テスト (`src/tools-validator/validator/__tests__/boundary.spec.ts`)

**目的**: 境界値とエッジケースの検証

```typescript
describe('境界値テスト', () => {
  test('大量のツールエントリー処理');
  test('Unicode文字を含むツール名');
  test('極端に長いリポジトリ名');
  test('メモリ使用量の測定');
});
```

### 7. パスユーティリティテスト

#### 7.1 基本機能テスト (`src/utils/__tests__/pathUtils.spec.ts`)

**目的**: パス処理の基本機能テスト

```typescript
describe('pathUtils', () => {
  test('パス正規化が正しく動作する');
  test('クロスプラットフォーム対応');
  test('パス比較が正しく動作する');
});
```

#### 7.2 エッジケーステスト (`src/utils/__tests__/pathUtils.edge.spec.ts`)

**目的**: パス処理のエッジケース検証

```typescript
describe('pathUtils エッジケース', () => {
  test('無効な文字を含むパス');
  test('極端に長いパス');
  test('Unicode文字を含むパス');
  test('空文字列やnullの処理');
});
```

## テストデータ設計

### 正常系テストデータ

```typescript
const validToolsConfig: ToolsConfig = {
  defaultInstallDir: '.tools/bin',
  defaultTempDir: '.tools/tmp',
  tools: [
    {
      installer: 'eget',
      id: 'ripgrep',
      repository: 'BurntSushi/ripgrep',
      version: 'latest',
      options: {
        '/q': '',
        '/asset:': 'ripgrep-*-x86_64-unknown-linux-gnu.tar.gz',
      },
    },
  ],
};
```

### 境界値テストデータ

```typescript
const boundaryTestCases = [
  { path: '', description: '空文字列パス' },
  { path: '/', description: 'ルートパス' },
  { path: './a', description: '最小相対パス' },
  { path: 'C:\\', description: 'Windowsルートパス' },
  { repository: 'a/b', description: '最小リポジトリ名' },
  { repository: 'very-long-owner-name/very-long-repository-name-with-many-hyphens', description: '長いリポジトリ名' },
];
```

### 大量データテスト

```typescript
// 1000個のツールエントリーを生成してパフォーマンス測定
const generateLargeToolsConfig = (count: number): ToolsConfig => {
  const tools = Array.from({ length: count }, (_, i) => ({
    installer: 'eget',
    id: `tool-${i}`,
    repository: `owner${i}/repo${i}`,
    version: 'latest',
  }));
  return {
    defaultInstallDir: '.tools/bin',
    defaultTempDir: '.tools/tmp',
    tools,
  };
};
```

### Unicode・特殊文字テストデータ

```typescript
const unicodeTestCases = [
  { id: 'ツール名', description: '日本語ツール名' },
  { id: 'tool-名前', description: '混在文字' },
  { repository: 'owner/repo-名前', description: 'Unicode リポジトリ名' },
  { path: './フォルダ/bin', description: 'Unicode パス' },
];
```

### 異常系テストデータ

```typescript
const invalidTestCases = [
  { data: null, description: 'null値' },
  { data: undefined, description: 'undefined値' },
  { data: {}, description: '空オブジェクト' },
  { data: { installer: 'invalid' }, description: '無効installer' },
  { repository: 'invalid-format', description: '無効リポジトリ形式' },
  { path: 'path|with|invalid|chars', description: '無効文字を含むパス' },
];
```

## テスト設定とフレームワーク

### Vitestテスト設定

**単体テスト設定** (`configs/vitest.config.unit.ts`):

- TypeScript パスマッピング (`@` → `src`)
- 単体テスト用キャッシュディレクトリ
- カバレッジレポート（text, json-summary）

**CI/E2E テスト設定** (`configs/vitest.config.ci.ts`):

- 実ファイルI/O操作
- 一時ディレクトリ自動管理
- 詳細なテスト結果レポート

### テストパターン

**BDD形式テスト構成**:

```typescript
describe('機能グループ', () => {
  describe('正常系', () => {
    it('should 期待する動作', () => {
      // Given-When-Then パターン
    });
  });

  describe('異常系', () => {
    it('should handle エラーケース', () => {
      // エラーハンドリング検証
    });
  });
});
```

## カバレッジ目標

### 最小カバレッジ要件

- **ライン**: 95%以上
- **関数**: 100%
- **ブランチ**: 90%以上
- **ステートメント**: 95%以上

### 重点カバレッジ領域

1. **エラーハンドリング**: すべてのerrorExitパターン
2. **バリデーション**: すべての検証ルール
3. **型変換**: TypeScriptとランタイムの型安全性
4. **境界値**: 正常値と異常値の境界
5. **パフォーマンス**: 大量データ処理時の挙動

## パフォーマンステスト

### レスポンステスト

- 小規模設定（10ツール以下）: 10ms以下
- 中規模設定（100ツール以下）: 100ms以下
- 大規模設定（1000ツール以下）: 1秒以下

### メモリ使用量テスト

- 設定ファイル読み込み時のメモリリーク検出
- 大量ツールエントリー処理時のメモリ効率性
- 1000個のツールエントリーでのパフォーマンス測定

## 継続的インテグレーション

### テスト実行環境

- **Node.js**: v20以上
- **OS**: Windows, Linux, macOS
- **TypeScript**: 最新安定版

### 自動化テスト

1. プルリクエスト時の全テスト実行
2. 毎日のリグレッションテスト
3. パフォーマンス劣化検出
4. カバレッジレポート生成

### テストコマンド

- **単体テスト**: `pnpm run test:develop`
- **E2Eテスト**: `pnpm run test:ci`
- **全テスト**: `pnpm run test`

## テスト保守

### テスト更新ルール

1. 新機能追加時は対応テストを同時作成
2. バグ修正時は再現テストを追加
3. リファクタリング時はテストを先に更新
4. 四半期ごとのテストレビュー実施

### テストコード品質

- DRY原則の適用（重複テストコードの排除）
- SOLID原則に基づくテストヘルパー設計
- テストケース名の一貫性確保（日本語での説明）
- アサーションメッセージの明確化
- モック・スタブの適切な使用
