---
header:
  - src: docs/architecture-design.spec.md
  - @(#) : @esta-core/tools-config architecture specs
title:  @esta-core/tools-config アーキテクチャ仕様
version: 0.0.0
created: 2025-07-19
authors:
    - atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-19: 初回作成（ドキュメント整備）
  - 2025-09-06: パッケージドキュメント標準化
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

`@esta-core/tools-config`は、ツールインストール設定の生成と管理をするモジュールです。個別のツール設定を読み込み、統一されたインストール設定を生成し、`eget`などのインストーラーと連携します。現在は実装が完了し、プロダクション使用可能なレベルに達しています。

## アーキテクチャ概要

### モジュール構成

```bash
@esta-core/tools-config/
├── src/
│   ├── index.ts              # メインエクスポート
│   ├── getToolsConfig.ts     # メインエントリーポイント
│   ├── defaults.ts           # デフォルト設定プロバイダー
│   ├── core/
│   │   └── config/           # コア設定管理
│   │       ├── loadToolsConfig.ts
│   │       ├── mergeToolsConfig.ts
│   │       └── index.ts
│   ├── internal/
│   │   ├── constants/        # 内部定数
│   │   │   ├── config.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   ├── schemas/          # Valibotスキーマ
│   │   │   ├── tools.schemas.ts
│   │   │   └── index.ts
│   │   └── types/            # 内部型定義
│   │       ├── config.ts
│   │       ├── tools.ts
│   │       ├── validation.ts
│   │       └── index.ts
│   ├── tools-validator/      # ツール検証フレームワーク
│   │   ├── utils/            # 検証ユーティリティ
│   │   └── validator/
│   │       ├── base.ts
│   │       ├── egetValidator.ts
│   │       └── index.ts
│   └── utils/                # ユーティリティ
│       ├── pathUtils.ts
│       └── index.ts
├── shared/
│   └── types/                # 共有型定義
│       ├── toolsConfig.types.ts
│       └── index.ts
└── tests/
    ├── e2e/                  # E2Eテスト
    ├── integration/          # インテグレーションテスト
    └── __tests__/            # 単体テスト（各モジュール配下）
```

### 型システム

#### 基本型定義 (shared/types/toolsConfig.types.ts)

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

export type PartialToolsConfig = {
  defaultInstallDir?: string; // オプショナルインストールディレクトリ
  defaultTempDir?: string; // オプショナル一時ディレクトリ
  tools?: ToolEntry[]; // オプショナルツールエントリー配列
};
```

#### 内部型定義 (src/internal/types/)

```typescript
export type LoadConfigResult<T = unknown> = {
  success: boolean;
  config?: T;
  error?: string;
};

export type ValidateToolsResult = {
  success: boolean;
  validEntries: ToolEntry[];
  errors: Array<{
    index: number;
    entry: ToolEntry;
    error: string;
  }>;
};

export type EgetToolEntry = ToolEntry & {
  installer: 'eget';
};
```

## 主要コンポーネント

### 1. メインエントリーポイント (`getToolsConfig.ts`)

**責務**: デフォルト設定および設定ファイル読み込みの統合。

**機能**:

- 設定ファイルの読み込み
- デフォルト設定とのマージ
- 完全性チェックと最終検証
- エラーハンドリング

**API**:

```typescript
export const getToolsConfig = async (configPath: string): Promise<ToolsConfig>
```

**実装フロー**:

```bash
defaultToolsConfig() → ToolsConfig (デフォルト)
    ↓
configPath → loadToolsConfig() → PartialToolsConfig
    ↓
mergeToolsConfig() → ToolsConfig (マージ結果)
    ↓
validateCompleteConfig()  (mergeToolsConfig内部で呼び出し)
    ↓
ToolsConfig (最終検証)
```

### 2. 設定ファイル読み込み (`core/config/loadToolsConfig.ts`)

**責務**: 設定ファイルの読み込みとバリデーション。

**機能**:

- `@esta-utils/config-loader`を使用した設定読み込み
- Valibot スキーマによる検証と正規化
- 部分設定の処理
- エラーハンドリング

**API**:

```typescript
export const loadToolsConfig = async (configPath: string): Promise<PartialToolsConfig>
export const isCompleteConfig = (config: PartialToolsConfig): config is ToolsConfig
export const validateCompleteConfig = (config: PartialToolsConfig): ToolsConfig
```

**実装詳細**:

- JSON, YAML, JS/TS 形式をサポート
- 設定ファイル読み込みでエラーが発生した場合は `errorExit` でプロセス終了
- 部分設定でも文字列正規化を実行（小文字変換、パス正規化）

### 3. 設定マージ (`core/config/mergeToolsConfig.ts`)

**責務**: デフォルト設定と読み込み設定のマージ、バリデーション。

**機能**:

- デフォルト設定と部分設定の統合
- ツール配列のマージ処理
- 設定値の上書き処理
- バリデーション

**API**:

```typescript
export const mergeToolsConfig = (
  defaultConfig: ToolsConfig,
  loadConfig: PartialToolsConfig | object
): ToolsConfig | object
```

**実装詳細**:

- グローバル設定（defaultInstallDir、defaultTempDir）は読み込み設定で上書き
- ツール配列はデフォルトと読み込み設定を結合
- 無効な設定の場合は空のオブジェクトを返す

### 4. ツール検証フレームワーク (`tools-validator/validator/`)

**責務**: ツールエントリーの検証とバリデーション。

**base.ts**:

```typescript
export const validateTools = (tools: ToolEntry[]): void
```

**egetValidator.ts**:

```typescript
export const validateEgetToolEntry = (entry: ToolEntry): EgetToolEntry
export const isEgetToolEntry = (entry: ToolEntry): entry is EgetToolEntry
```

**検証ルール**:

- `installer`フィールドが`'eget'`であること
- `repository`が`owner/repo`形式であること
- `options`が有効な eget オプション文字列であること

**有効なegetオプション**:

- `/q`: 静粛モード (値は空文字列)
- `/quiet`: 静粛モード (値は空文字列)
- `/a`: アセット指定 (値にアセット文字列が必要)
- `/asset:`: アセット指定 (値にアセット文字列が必要)

### 5. パスユーティリティ (`utils/pathUtils.ts`)

**責務**: クロスプラットフォーム対応のパス処理。

**機能**:

- パス正規化とバリデーション
- Windows/Unix パス形式の処理
- スキーマ用パス正規化

**API**:

```typescript
export const normalizePath = (path: string): string
export const validateAndNormalizePath = (path: string): string
export const normalizePathForSchema = (path: string): string
export const arePathsEqual = (path1: string, path2: string): boolean
```

### 6. デフォルト設定プロバイダー (`defaults.ts`)

**責務**: デフォルト設定値の提供。

**実装機能**:

- デフォルト設定の生成
- デフォルトでインストールできるツールを設定

**API**:

```typescript
export const defaultToolsConfig = (): ToolsConfig
```

**デフォルトツール一覧**:

- gh (GitHub CLI)
- ripgrep (高速検索)
- fd (ファイル検索)
- bat (cat 代替)
- exa (ls 代替)
- jq (JSON 処理)
- yq (YAML 処理)
- delta (git 差分表示)
- gitleaks (秘密情報検出)

### 7. Valibotスキーマ (internal/schemas/tools.schemas.ts)

**責務**: 設定データのスキーマ定義とバリデーション。

**機能**:

- 自動パス正規化とバリデーション
- 文字列正規化（小文字変換）
- 包括的なバリデーションとエラーメッセージ

**スキーマ構成**:

- `ToolsConfigSchema`: 部分設定対応（フィールドがオプショナル）
- `CompleteToolsConfigSchema`: 完全設定検証（必須フィールドチェック）
- `ToolEntrySchema`: ツールエントリーの検証と正規化

## データフロー

### 1. 設定読み込みフロー

```bash
設定ファイル → loadToolsConfig() → PartialToolsConfig
                    ↓
               Valibotスキーマ検証 → 正規化された設定
                    ↓
               isCompleteConfig() → 完全性チェック
                    ↓
               validateCompleteConfig() → ToolsConfig
```

### 2. 統合フロー（getToolsConfig）

```bash
configPath → loadToolsConfig() → PartialToolsConfig (読み込み設定)
                ↓
        defaultToolsConfig() → ToolsConfig (デフォルト)
                ↓
        mergeToolsConfig() → ToolsConfig (マージ結果)
                ↓
        validateCompleteConfig() → ToolsConfig (最終検証)
```

### 3. ツール検証フロー

```bash
ToolEntry[] → validateTools() → void (エラー時throw)
                  ↓
            インストーラー判定
                  ↓
         egetValidator.validateEgetToolEntry() → EgetToolEntry
```

## 設計パターン

### 1. レイヤードアーキテクチャ

機能別に明確な層分離を実装:

- 公開 API 層: `index.ts`、`getToolsConfig.ts`
- コア機能層: `core/config/`
- 内部実装層: `internal/`
- 共有型定義層: `shared/types/`

### 2. バリデーターパターン

各インストーラータイプに対応する専用バリデーターを実装:

- `egetValidator`: eget 固有の検証
- 将来的に`scriptValidator`等を追加予定

### 3. エラーハンドリングパターン

`@esta-core/error-handler`を使用したエラーハンドリング:

```typescript
// 設定読み込みエラー時は即座にプロセス終了
errorExit(exitCode, message);
```

### 4. スキーマ検証パターン

valibot を使用した型安全なスキーマ検証:

- コンパイル時とランタイムの型安全性
- パフォーマンスを重視したバリデーション
- カスタム変換処理のサポート（自動正規化）
- 部分設定と完全設定の分離検証

### 5. モジュール分離パターン

機能別のモジュール分離:

- `internal/`: 内部実装詳細（types, schemas, constants）
- `shared/`: 公開 API 用の共有型
- `tools-validator/`: 拡張可能なバリデーター フレームワーク
- `utils/`: 再利用可能なユーティリティ

## 依存関係

### 外部依存

- `valibot`: スキーマ検証ライブラリ
- `@esta-utils/config-loader`: 設定ファイル読み込み
- `@esta-core/error-handler`: エラーハンドリング
- `@agla-e2e/fileio-framework`: E2E テスト用
- `node:fs`: ファイル存在チェック
- `node:path`: パス操作

### 内部依存

- パッケージは自己完結型で、内部では共有型を使用
- 公開 API は`shared/types`で定義された型を使用

## テスト戦略

### テストファイル構成（14ファイル）

#### ユニットテスト（12ファイル）

- デフォルト設定: `src/__tests__/defaultToolsConfig.spec.ts`
- メイン機能: `src/__tests__/getToolsConfig.spec.ts`
- 設定管理: `src/core/config/__tests__/loadConfig.spec.ts`, `mergeConfig.spec.ts`
- スキーマ検証: `src/internal/schemas/__tests__/tools.schemas.spec.ts`
- ツール検証: `src/tools-validator/validator/__tests__/` 配下に 4ファイル
- ユーティリティ: `src/utils/__tests__/` 配下に 2ファイル

#### 統合テスト（2ファイル）

- E2E テスト: `tests/e2e/` 配下に 2ファイル
- インテグレーションテスト: `tests/integration/` 配下に 1ファイル

### テスト設定

- 単体テスト: `vitest.config.unit.ts`
- E2E テスト: `vitest.config.e2e.ts`
- インテグレーションテスト: `vitest.config.integration.ts`

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

- valibot による高速なスキーマ検証
- 設定ファイル読み込みの最適化
- 大量のツールエントリーに対応した検証
- エラー情報の詳細化とパフォーマンスのバランス
- デフォルト設定の配列コピーによるイミュータブル性の保証
- ファイル存在チェックの効率化

## セキュリティ考慮事項

- 設定ファイルパスの検証
- GitHub リポジトリ形式の厳密なチェック
- インジェクション攻撃の防止
- 一時ディレクトリの安全な作成

## 実装状況

### 完成済み機能

- メインエントリーポイント (`getToolsConfig`)
- 設定ファイル読み込み・マージ機能
- Valibot スキーマ検証・正規化
- デフォルト設定提供（9ツール）
- パスユーティリティ（クロスプラットフォーム対応）
- ツールバリデータ（eget 対応）
- 包括的なテストスイート（14ファイル）
- TypeScript 型システム
- ビルド設定（ESM/CJS 対応）

### 品質レベル

- テストカバレッジ: 包括的な単体・統合・E2E テスト
- 型安全性: TypeScript + Valibot による厳密な型チェック
- エラーハンドリング: errorExit によるエラーハンドリングとプロセス終了
- パフォーマンス: ファイル I/O と検証処理
- 保守性: モジュラー設計による高い保守性
