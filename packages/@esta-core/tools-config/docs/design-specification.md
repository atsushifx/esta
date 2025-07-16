# @esta-core/tools-config 詳細設計書

## 概要

`@esta-core/tools-config`は、ツールインストール設定の生成と管理を行うライブラリです。個別のツール設定を読み込み、統一されたインストール設定を生成し、`eget`などのインストーラーと連携します。

## アーキテクチャ

### モジュール構成

```
@esta-core/tools-config/
├── src/
│   ├── index.ts              # エクスポート定義
│   ├── core/
│   │   ├── index.ts          # コア機能エクスポート
│   │   └── config/
│   │       ├── index.ts      # 設定関連エクスポート
│   │       ├── loader.ts     # 設定ファイル読み込み
│   │       └── defaults.ts   # デフォルト設定
│   ├── types/               # 型定義（共有型のリエクスポート）
│   │   ├── index.ts
│   │   ├── config.ts
│   │   └── tools.ts
│   └── validator/           # 検証機能
│       ├── index.ts
│       ├── config.ts
│       ├── egetValidator.ts
│       ├── utils.ts
│       └── tools/
│           └── index.ts
├── shared/
│   ├── types/               # 共有型定義
│   │   ├── index.ts
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
  version?: string; // バージョン指定（セマンティックバージョンまたは"latest"）
  options?: Record<string, string>; // インストーラー固有オプション（文字列のみ）
};

export type ToolsConfig = {
  defaultInstallDir: string; // デフォルトインストールディレクトリ
  defaultTempDir: string; // デフォルト一時ディレクトリ
  tools: ToolEntry[]; // ツールエントリー配列
};

export type PartialToolsConfig = Partial<ToolsConfig>; // 部分設定
```

#### eget専用型定義

```typescript
export type EgetToolEntry = ToolEntry & {
  installer: 'eget';
};
```

## 主要コンポーネント

### 1. 設定ファイル読み込み (core/config/loader.ts)

**責務**: 設定ファイルの読み込みとパース

**機能**:

- ファイル存在チェック
- `@esta-utils/config-loader`を使用した設定読み込み
- スキーマ検証による正規化処理
- エラーハンドリング

**API**:

```typescript
export const loadConfig = async (configPath: string): Promise<LoadConfigResult>
export const isCompleteConfig = (config: PartialToolsConfig): config is ToolsConfig
export const validateCompleteConfig = (config: PartialToolsConfig): ToolsConfig

export type LoadConfigResult = {
  success: boolean;
  config?: PartialToolsConfig;
  error?: string;
};
```

**実装詳細**:

- `TSearchConfigFileType.PROJECT`で指定ディレクトリ内を検索
- JSON, YAML, JS/TS形式をサポート
- ファイル拡張子を除いたベース名で検索
- 部分設定でも文字列正規化を実行（小文字変換、パス正規化）

### 2. 設定検証 (validator/config.ts)

**責務**: 設定データの妥当性検証

**機能**:

- 部分設定の検証（ToolsConfigSchema）
- 完全設定の検証（CompleteToolsConfigSchema）
- ツールエントリー配列の検証
- インストーラータイプ別の詳細検証

**API**:

```typescript
export const validateConfig = (config: unknown): ValidateConfigResult
export const validateCompleteConfig = (config: unknown): ValidateCompleteConfigResult
export const validateTools = (tools: unknown[]): ValidateToolsResult

export type ValidateConfigResult = SafeParseResult<typeof ToolsConfigSchema>;
export type ValidateCompleteConfigResult = SafeParseResult<typeof CompleteToolsConfigSchema>;

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
5. 文字列正規化（小文字変換、パス正規化）

### 3. egetバリデーター (validator/egetValidator.ts)

**責須**: eget固有の検証ロジック

**機能**:

- GitHubリポジトリ形式検証 (`owner/repo`)
- eget専用オプション文字列の検証
- 型安全な変換処理

**API**:

```typescript
export const validateEgetToolEntry = (entry: ToolEntry): EgetToolEntry
export const isEgetToolEntry = (entry: ToolEntry): entry is EgetToolEntry
```

**検証ルール**:

- `installer`フィールドが`'eget'`であること
- `repository`が`owner/repo`形式であること
- `options`が有効なegetオプション文字列であること

**有効なegetオプション**:

- `/q`: 静粛モード（値は空文字列）
- `/quiet`: 静粛モード（値は空文字列）
- `/a`: アセット指定（値にアセット文字列が必要）
- `/asset:`: アセット指定（値にアセット文字列が必要）

### 4. ツール操作 (tools.ts)

**責務**: ツール設定の操作機能

**実装機能**:

- ツール検索 (`getTool`)
- ツール一覧取得 (`listTools`)
- ツール追加/削除
- 設定のマージ処理

**API**:

```typescript
export const getTool = (id: string): ToolEntry | undefined
export const listTools = (): ToolEntry[]
export const addTool = (tool: ToolEntry): void
export const removeTool = (id: string): boolean
```

### 5. デフォルト設定 (core/config/defaults.ts)

**責務**: デフォルト設定値の提供

**実装機能**:

- `getDefaultToolsConfig`の定義
- デフォルトツールリストの提供
- 特定ツールの検索機能

**API**:

```typescript
export const getDefaultToolsConfig = (): ToolsConfig
export const getDefaultTools = (): ToolEntry[]
export const getDefaultTool = (id: string): ToolEntry | undefined
export const defaultToolsConfig = getDefaultToolsConfig // 下位互換性
```

**デフォルトツール一覧**:

- gh (GitHub CLI)
- ripgrep (高速検索)
- fd (ファイル検索)
- bat (cat代替)
- exa (ls代替)
- jq (JSON処理)
- yq (YAML処理)
- delta (git差分表示)
- gitleaks (秘密情報検出)

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
- 部分設定と完全設定の分離検証

**スキーマ構成**:

- `ToolsConfigSchema`: 部分設定対応（フィールドがオプショナル）
- `CompleteToolsConfigSchema`: 完全設定検証（必須フィールドチェック）
- `ToolEntrySchema`: ツールエントリーの検証と正規化

## 依存関係

### 外部依存

- `valibot`: スキーマ検証ライブラリ
- `@esta-utils/config-loader`: 設定ファイル読み込み
- `@agla-e2e/fileio-framework`: E2Eテスト用
- `node:fs`: ファイル存在チェック
- `node:path`: パス操作

### 内部依存

- `@shared/types`: 共有型定義
- `@shared/schemas`: 共有スキーマ定義

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
- デフォルト設定の配列コピーによるイミュータブル性の保証
- ファイル存在チェックの効率化

## セキュリティ考慮事項

- 設定ファイルパスの検証
- GitHubリポジトリ形式の厳密なチェック
- インジェクション攻撃の防止
- 一時ディレクトリの安全な作成
