# @esta-core/tools-config 詳細設計書

## 概要

`@esta-core/tools-config`は、ツールインストール設定の生成と管理を行うライブラリです。個別のツール設定を読み込み、統一されたインストール設定を生成し、`eget`などのインストーラーと連携します。

## アーキテクチャ

### モジュール構成

```
@esta-core/tools-config/
├── src/
│   ├── index.ts              # エクスポート定義
│   ├── defaults.ts           # デフォルト設定
│   ├── loadConfig.ts         # 設定ファイル読み込み
│   ├── tools.ts              # ツール操作
│   ├── validateConfig.ts     # 設定検証
│   └── validator/
│       ├── egetValidator.ts  # eget専用バリデーター
│       └── tools/
│           ├── index.ts
│           └── validatePath.ts
├── shared/
│   ├── types/               # 共有型定義
│   │   ├── index.ts
│   │   ├── toolEntry.types.ts
│   │   └── tools.types.ts
│   └── schemas/             # バリデーションスキーマ
│       ├── index.ts
│       └── tools.schemas.ts
└── tests/
    └── e2e/                 # E2Eテスト
```

### 型システム

#### 基本型定義

```typescript
export type ToolEntry = {
  installer: string; // インストーラータイプ ('eget' 等)
  id: string; // ツール識別子
  repository: string; // GitHubリポジトリ ('owner/repo' 形式)
  options?: Record<string, unknown>; // インストーラー固有オプション
};

export type ToolsConfig = {
  defaultInstallDir: string; // デフォルトインストールディレクトリ
  defaultTempDir: string; // デフォルト一時ディレクトリ
  tools: ToolEntry[]; // ツールエントリー配列
};
```

#### eget専用型定義

```typescript
export type EgetToolEntryOptions = {
  version?: string; // バージョン指定 (/tag:xxx)
  installDir?: string; // インストールディレクトリ (/to:xxx)
  quiet?: boolean; // 静粛モード (/quiet)
  asset?: string; // アセット指定 (/asset:xxx)
};

export type EgetToolEntry = Omit<ToolEntry, 'options'> & {
  installer: 'eget';
  options?: EgetToolEntryOptions;
};
```

## 主要コンポーネント

### 1. 設定ファイル読み込み (loadConfig.ts)

**責務**: 設定ファイルの読み込みとパース

**機能**:

- ファイル存在チェック
- `@esta-utils/config-loader`を使用した設定読み込み
- エラーハンドリング

**API**:

```typescript
export const loadConfig = async (configPath: string): Promise<LoadConfigResult>

export type LoadConfigResult = {
  success: boolean;
  config?: Partial<ToolsConfig>;
  error?: string;
};
```

**実装詳細**:

- `TSearchConfigFileType.PROJECT`で指定ディレクトリ内を検索
- JSON, YAML, JS/TS形式をサポート
- ファイル拡張子を除いたベース名で検索

### 2. 設定検証 (validateConfig.ts)

**責務**: 設定データの妥当性検証

**機能**:

- ToolsConfig全体の構造検証
- ツールエントリー配列の検証
- インストーラータイプ別の詳細検証

**API**:

```typescript
export const validateConfig = (config: unknown): ValidateResult
export const validateTools = (tools: unknown[]): ValidateToolsResult

export type ValidateToolsResult = {
  success: boolean;
  validEntries: ToolEntry[];
  errors: Array<{
    index: number;
    entry: unknown;
    error: string;
  }>;
};
```

**検証フロー**:

1. 基本的なToolEntry形式チェック
2. installerフィールドの存在確認
3. インストーラータイプ別の詳細検証
4. エラー収集と有効エントリーの分離

### 3. egetバリデーター (validator/egetValidator.ts)

**責須**: eget固有の検証ロジック

**機能**:

- GitHubリポジトリ形式検証 (`owner/repo`)
- eget専用オプションの検証
- 型安全な変換処理

**API**:

```typescript
export const validateEgetToolEntry = (entry: ToolEntry): EgetToolEntry
export const isEgetToolEntry = (entry: ToolEntry): entry is EgetToolEntry
```

**検証ルール**:

- `installer`フィールドが`'eget'`であること
- `repository`が`owner/repo`形式であること
- `options`がEgetToolEntryOptionsの形式であること

### 4. ツール操作 (tools.ts)

**責務**: ツール設定の操作機能

**想定機能** (実装予定):

- ツール検索 (`getTool`)
- ツール一覧取得 (`listTools`)
- ツール追加/削除
- 設定のマージ処理

### 5. デフォルト設定 (defaults.ts)

**責務**: デフォルト設定値の提供

**想定機能** (実装予定):

- `defaultToolsConfig`の定義
- プラットフォーム別デフォルト値
- 環境変数からの設定読み込み

## データフロー

### 1. 設定読み込みフロー

```
設定ファイル → loadConfig() → Partial<ToolsConfig>
                    ↓
               validateConfig() → ValidateResult
                    ↓
               デフォルト値マージ → ToolsConfig
```

### 2. ツール検証フロー

```
ToolEntry[] → validateTools() → ValidateToolsResult
                  ↓
            インストーラー判定
                  ↓
         egetValidator.validateEgetToolEntry() → EgetToolEntry
```

## 設計パターン

### 1. バリデーターパターン

各インストーラータイプに対応する専用バリデーターを実装:

- `egetValidator`: eget固有の検証
- 将来的に`scriptValidator`等を追加予定

### 2. Result型パターン

エラー処理に明示的なResult型を使用:

```typescript
type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### 3. スキーマ検証パターン

valibotを使用した型安全なスキーマ検証:

- コンパイル時とランタイムの型安全性
- パフォーマンスを重視したバリデーション
- カスタム変換処理のサポート

## 依存関係

### 外部依存

- `valibot`: スキーマ検証ライブラリ
- `@esta-utils/config-loader`: 設定ファイル読み込み
- `@agla-e2e/fileio-framework`: E2Eテスト用

### 内部依存

- `@shared/types`: 共有型定義
- `@shared/constants`: 共有定数

## 拡張性

### 新しいインストーラーの追加

1. 専用型定義の作成
2. バリデータースキーマの実装
3. `validateTools`への追加
4. テストの実装

### 設定形式の拡張

1. 新しいオプションフィールドの追加
2. スキーマの更新
3. デフォルト値の定義
4. バックワード互換性の保証

## パフォーマンス考慮事項

- valibotによる高速なスキーマ検証
- 設定ファイル読み込みの最適化
- 大量のツールエントリーに対応した効率的な検証
- エラー情報の詳細化とパフォーマンスのバランス

## セキュリティ考慮事項

- 設定ファイルパスの検証
- GitHubリポジトリ形式の厳密なチェック
- インジェクション攻撃の防止
- 一時ディレクトリの安全な作成
