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

### 1. デフォルト設定テスト (`src/__tests__/defaultToolsConfig.spec.ts`)

#### 1.1 getDefaultToolsConfig関数のテスト

**目的**: デフォルト設定生成機能の検証

```typescript
describe('getDefaultToolsConfig', () => {
  test('デフォルト設定を正しく返す', () => {
    // Given: デフォルト設定要求
    // When: getDefaultToolsConfigを呼び出す
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

#### 1.2 getDefaultTools関数のテスト

**目的**: デフォルトツール一覧取得機能の検証

```typescript
describe('getDefaultTools', () => {
  test('設定されているすべてのツールのリストを返す', () => {
    // Given: 設定されたツールリスト
    // When: getDefaultToolsを呼び出す
    // Then: 配列形式でツールリストを返す
  });

  test('返されるツールは有効なToolEntryオブジェクト', () => {
    // Given: ツールリスト
    // When: getDefaultToolsを呼び出す
    // Then: 各要素がToolEntryの必須プロパティを持つ
  });
});
```

#### 1.3 getDefaultTool関数のテスト

**目的**: ツールID指定による単一ツール取得機能の検証

```typescript
describe('getDefaultTool', () => {
  test('存在するツールIDを指定すると対応するToolEntryを返す', () => {
    // Given: 存在するツールID 'gh'
    // When: getDefaultToolを呼び出す
    // Then: 対応するToolEntryオブジェクトを返す
  });

  test('存在しないツールIDを指定するとundefinedを返す', () => {
    // Given: 存在しないツールID 'non-existent-tool'
    // When: getDefaultToolを呼び出す
    // Then: undefinedを返す
  });
});
```

#### 1.4 下位互換性テスト

**目的**: 既存APIとの互換性確認

```typescript
describe('下位互換性', () => {
  test('defaultToolsConfig関数は getDefaultToolsConfig と同じ結果を返す', () => {
    // Given: defaultToolsConfig と getDefaultToolsConfig
    // When: それぞれを呼び出す
    // Then: 同じ結果を返すことを確認
  });
});
```

### 2. 設定検証テスト (`src/__tests__/validateConfig.spec.ts`)

#### 2.1 正常系テスト

**目的**: 有効な設定データの検証動作確認

```typescript
describe('正常なconfig検証', () => {
  test('完全で有効なToolsConfigを検証して成功する', () => {
    // Given: 完全で有効なToolsConfig
    const validConfig: ToolsConfig = {
      defaultInstallDir: '.tools/bin',
      defaultTempDir: '.tools/tmp',
      tools: [/* 有効なツールエントリー */],
    };
    // When: validateConfigを実行
    // Then: success=trueを返す
  });
});
```

#### 2.2 null/undefined検証

**目的**: null/undefinedの適切な処理確認

```typescript
describe('null/undefined検証', () => {
  test('nullを検証して失敗する');
  test('undefinedを検証して失敗する');
});
```

#### 2.3 必須フィールド検証

**目的**: 完全設定の必須フィールドの存在確認

```typescript
describe('必須フィールド検証', () => {
  test('空オブジェクトを検証して失敗する');
  test('defaultInstallDirのみ欠如した場合に失敗する');
  test('defaultTempDirのみ欠如した場合に失敗する');
  test('toolsのみ欠如した場合に失敗する');
});
```

**注意**: これらのテストは`validateCompleteConfig`を使用して実行されます。

#### 2.4 ツールエントリー検証

**目的**: tools配列内エントリーの検証

```typescript
describe('toolEntry検証', () => {
  test('空のtoolsを検証して成功する');
  test('optionsが省略されたtoolEntryを検証して成功する');
  test('installerが欠如したtoolEntryを検証して失敗する');
  test('idが欠如したtoolEntryを検証して失敗する');
  test('repositoryが欠如したtoolEntryを検証して失敗する');
});
```

#### 2.5 パス形式検証

**目的**: ディレクトリパスの形式検証

```typescript
describe('パス形式検証', () => {
  test('有効な相対パスのdefaultInstallDirを検証して成功する');
  test('有効な絶対パス（Unix）のdefaultInstallDirを検証して成功する');
  test('有効な絶対パス（Windows）のdefaultInstallDirを検証して成功する');
  test('無効なパス（空文字列）のdefaultInstallDirを検証して失敗する');
  test('無効なパス（無効文字含む）のdefaultTempDirを検証して失敗する');
  test('連続スラッシュを含むパスを検証して失敗する');
});
```

#### 2.6 ディレクトリ同一性検証

**目的**: インストールディレクトリと一時ディレクトリの重複防止

```typescript
describe('ディレクトリ同一性検証', () => {
  test('defaultInstallDirとdefaultTempDirが同じ場合に失敗する');
  test('defaultInstallDirとdefaultTempDirが異なる場合に成功する');
});
```

### 3. 設定読み込みテスト (`src/__tests__/loadConfig.spec.ts`)

#### 3.1 正常系テスト

**目的**: 設定ファイル読み込み機能の検証

```typescript
describe('loadConfig', () => {
  test('存在する設定ファイルを正常に読み込める', () => {
    // Given: 存在する設定ファイルパス
    // When: loadConfigを実行
    // Then: success=true、設定データを返す
  });

  test('JSON形式の設定ファイルを読み込める');
  test('YAML形式の設定ファイルを読み込める');
  test('JavaScript形式の設定ファイルを読み込める');
});
```

#### 3.2 異常系テスト

**目的**: エラーケースの適切な処理確認

```typescript
describe('loadConfig異常系', () => {
  test('存在しないファイルパスで失敗する', () => {
    // Given: 存在しないファイルパス
    // When: loadConfigを実行
    // Then: success=false、エラーメッセージを返す
  });

  test('無効な形式のファイルで失敗する');
  test('読み込み権限のないファイルで失敗する');
});
```

### 4. ツール検証テスト (`src/__tests__/validateTools.spec.ts`)

#### 4.1 混合ツールリスト検証

**目的**: 複数種類のツールエントリーの一括検証

```typescript
describe('validateTools', () => {
  test('すべて有効なツールエントリーの場合に成功する', () => {
    // Given: 有効なツールエントリー配列
    // When: validateToolsを実行
    // Then: success=true、全エントリーがvalidEntriesに含まれる
  });

  test('一部無効なエントリーがある場合に部分的成功する', () => {
    // Given: 有効・無効混在のエントリー配列
    // When: validateToolsを実行
    // Then: 有効エントリーはvalidEntriesに、無効エントリーはerrorsに分類される
  });

  test('すべて無効なエントリーの場合に失敗する');
});
```

### 5. スキーマ検証テスト (`src/__tests__/schemas.spec.ts`)

#### 5.1 ToolEntrySchemaの検証

**目的**: Valibotスキーマによるランタイム検証

```typescript
describe('ToolEntrySchema の検証', () => {
  test('有効なToolEntryオブジェクトを正常に検証できる');
  test('optionsを持つToolEntryオブジェクトを正常に検証できる');
  test('必須フィールドが不足している場合はエラーを投げる');
  test('文字列正規化（小文字変換）が正しく実行される');
});
```

#### 5.2 ToolsConfigSchemaの検証

**目的**: 設定全体のスキーマ検証（部分設定対応）

```typescript
describe('ToolsConfigSchema の検証', () => {
  test('有効なToolsConfigオブジェクトを正常に検証できる');
  test('パス正規化（小文字変換、スラッシュ統一）が正しく実行される');
  test('部分設定でも正規化が適用される');
});
```

#### 5.3 CompleteToolsConfigSchemaの検証

**目的**: 完全設定のスキーマ検証

```typescript
describe('CompleteToolsConfigSchema の検証', () => {
  test('完全な設定オブジェクトを正常に検証できる');
  test('必須フィールドが不足している場合はエラーを投げる');
  test('ディレクトリ同一性チェックが正しく実行される');
});
```

### 6. egetバリデーターテスト (`src/validator/__tests__/egetValidator.spec.ts`)

#### 6.1 egetツールエントリー検証

**目的**: eget固有の検証ロジックテスト

```typescript
describe('egetValidator', () => {
  test('有効なegetツールエントリーを検証して成功する', () => {
    // Given: 有効なegetエントリー
    const validEntry = {
      installer: 'eget',
      id: 'ripgrep',
      repository: 'BurntSushi/ripgrep',
      version: 'latest',
      options: { '/q': '', '/asset:': 'gh_linux_amd64.tar.gz' },
    };
    // When: validateEgetToolEntryを実行
    // Then: 検証済みEgetToolEntryを返す
  });

  test('無効なリポジトリ形式で失敗する', () => {
    // Given: 'owner/repo'形式でないリポジトリ
    // When: 検証実行
    // Then: エラーをスロー
  });

  test('installer !== "eget"で失敗する');
  test('無効なegetオプション文字列で失敗する');
  test('/a や /asset: でアセット文字列が空の場合に失敗する');
  test('/q や /quiet で値が空でない場合に失敗する');
});
```

#### 6.2 型判定テスト

```typescript
describe('isEgetToolEntry', () => {
  test('egetツールエントリーの場合にtrueを返す');
  test('非egetツールエントリーの場合にfalseを返す');
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

## カバレッジ目標

### 最小カバレッジ要件

- **ライン**: 95%以上
- **関数**: 100%
- **ブランチ**: 90%以上
- **ステートメント**: 95%以上

### 重点カバレッジ領域

1. **エラーハンドリング**: すべてのtry-catchブロック
2. **バリデーション**: すべての検証ルール
3. **型変換**: TypeScriptとランタイムの型安全性
4. **境界値**: 正常値と異常値の境界

## パフォーマンステスト

### レスポンステスト

- 小規模設定（10ツール以下）: 10ms以下
- 中規模設定（100ツール以下）: 100ms以下
- 大規模設定（1000ツール以下）: 1秒以下

### メモリ使用量テスト

- 設定ファイル読み込み時のメモリリーク検出
- 大量ツールエントリー処理時のメモリ効率性

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

## テスト保守

### テスト更新ルール

1. 新機能追加時は対応テストを同時作成
2. バグ修正時は再現テストを追加
3. リファクタリング時はテストを先に更新
4. 四半期ごとのテストレビュー実施

### テストコード品質

- DRY原則の適用（重複テストコードの排除）
- SOLID原則に基づくテストヘルパー設計
- テストケース名の一貫性確保
- アサーションメッセージの明確化
