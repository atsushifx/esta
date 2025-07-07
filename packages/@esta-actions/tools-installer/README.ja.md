# 📦 @esta-actions/tools-installer

GitHub Actions 向けに外部CLIツールを柔軟にセットアップするユニバーサルツールインストーラーフレームワークです。
eget ベースのインストール機能を提供し、pnpm環境・マルチパッケージ構成に最適化されています。

---

## 🏗️ アーキテクチャ

### コアクラス

#### ToolConfigManager

- **ファイル**: `src/helper/configs/ToolConfigManager.class.ts`
- **用途**: ツール設定の管理とストレージ
- **主要メソッド**:
  - `getToolConfig(tool: string)`: 指定ツールの設定を取得
  - `addToolConfigs(configs: AgActionToolConfig[])`: 設定を追加

#### HandleInstaller

- **ファイル**: `src/installer/AgActionHandleInstaller.class.ts`
- **用途**: インストール操作の制御とエグゼキュータ管理
- **主要メソッド**:
  - `handle(type: AgActionInstallerType, options: AgActionInstallOptions)`: インストール実行
  - `getSupportedTypes()`: サポートされるインストーラータイプを取得

### インストーラーエグゼキュータ

#### EgetInitializer

- **ファイル**: `src/installer/executor/EgetInitializer.ts`
- **用途**: eget CLI ツールの初期化とインストール
- **主要メソッド**:
  - `execute(options: AgActionInstallOptions)`: eget インストール実行
  - Windows/Linux 対応の個別インストールメソッド

#### NullExecutor

- **ファイル**: `src/installer/executor/NullExecutor.ts`
- **用途**: 未サポートインストールタイプ用プレースホルダー

### ユーティリティ関数

#### prepareInstallDirectory

- **ファイル**: `src/utils/prepareInstallDirectory.ts`
- **用途**: GitHub Actions 用インストールディレクトリの準備と PATH 設定

---

## 📋 開発コマンド

### ビルド・テスト

| コマンド名          | 内容                         |
| ------------------- | ---------------------------- |
| `pnpm build`        | CJS/ESM 両方をビルド         |
| `pnpm build:cjs`    | CommonJS版をビルド           |
| `pnpm build:esm`    | ESM版をビルド                |
| `pnpm clean`        | ビルド成果物をクリーンアップ |
| `pnpm test`         | 単体&E2Eテスト               |
| `pnpm test:develop` | 単体テスト（src/ 以下）      |
| `pnpm test:ci`      | E2Eテスト（tests/ 以下）     |
| `pnpm test:watch`   | 単体テスト（ウォッチモード） |

### 品質チェック

| コマンド名          | 内容                              |
| ------------------- | --------------------------------- |
| `pnpm check:dprint` | dprint によるフォーマットチェック |
| `pnpm check:types`  | TypeScript 型チェック             |
| `pnpm check:spells` | cSpell によるスペルチェック       |
| `pnpm lint`         | ESLint チェック（型なし）         |
| `pnpm lint:types`   | 型情報を伴うESLintチェック        |
| `pnpm lint:all`     | 全ESLintチェック                  |
| `pnpm lint:fix`     | ESLint 自動修正                   |
| `pnpm lint:secrets` | secretlint によるシークレット検出 |

---

## 📦 依存関係

### GitHub Actions 統合

- `@actions/core`: GitHub Actions コア機能
- `@actions/io`: ファイル操作ユーティリティ
- `@actions/tool-cache`: ツールキャッシュ管理

### 内部パッケージ

- `@esta-utils/get-platform`: プラットフォーム検出
- `@esta-utils/command-utils`: コマンド実行チェック
- `@agla-utils/ag-logger`: ログ出力機能
- `@shared`: 共通型定義・定数

### 外部依存

- `comment-json`: JSON with comments サポート

---

## 🔧 設定

### TypeScript 設定

- `@/` エイリアスは `src/` にマッピング
- ESM/CJS デュアルビルド対応
- 厳密型チェック有効

### パッケージエクスポート

- ESM: `./module/index.js`
- CJS: `./lib/index.cjs`
- 型定義: `./lib/index.d.ts`

### 開発環境

- Node.js >= 20
- pnpm >= 10
- monorepo 構成対応

---

## 🧪 テスト構成

### 単体テスト

- `ToolConfigManager.spec.ts`: 設定管理テスト
- `prepareInstallDirectory.spec.ts`: ディレクトリ準備テスト

### E2E テスト

- `EgetInitializer.spec.ts`: eget インストール実行テスト

---

## 📝 参考情報

- 設定ファイルの同期: `scripts/sync-configs.sh`
- 共通設定: `shared/configs/` 配下
- ベース設定: `tsconfig.base.json`, `eslint.config.base.js`
