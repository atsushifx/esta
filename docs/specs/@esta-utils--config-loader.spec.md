---
header:
  - src: docs/specs/@esta-utils--config-loader.spec.md
  - @(#): ユニバーサル設定ファイルローダー仕様書
title: 📂 ユニバーサル設定ファイルローダー仕様書（@esta-utils/config-loader）
description: 多様な設定ファイル形式に JSON、YAML、JavaScript/TypeScript に対応したユニバーサルローダーの技術仕様書
version: 1.0.0
authors:
  - atsushifx
changes:
  - 2025-09-04: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 📂 ユニバーサル設定ファイルローダー仕様書

## 概要

`@esta-utils/config-loader`は、多様な設定ファイル形式（JSON、YAML、JavaScript/TypeScript）に対応したユニバーサル設定ファイルローダーです。設定ファイルの検索、読み込み、パースを一元化し、アプリケーションの設定管理を簡素化します。

## 主要機能

### 1. 対応ファイル形式

- JSON: `.json`、`.jsonc`（コメント付き JSON）
- YAML: `.yaml`、`.yml`
- JavaScript/TypeScript: `.js`、`.ts`、`.mjs`、`.cjs`

### 2. 設定ファイル検索

- 指定ディレクトリからの設定ファイル自動検索
- 複数の設定ファイル名パターンに対応
- 階層的な設定ファイル検索（親ディレクトリまで遡る）

### 3. 設定ファイル解析

- ファイル拡張子に基づく自動パーサー選択
- エラーハンドリングと詳細なエラーメッセージ
- 型安全な設定データの返却

## API仕様

### 主要関数

#### `loadConfig<T>(options: LoadConfigOptions): Promise<T | null>`

設定ファイルを検索・読み込み・パースして返します。

**パラメータ:

- `options.configName`: 設定ファイル名（拡張子なし）
- `options.searchDirs`: 検索対象ディレクトリ配列
- `options.extensions`: 対応拡張子配列（省略可能）

**戻り値:

- 成功時: パースされた設定オブジェクト
- ファイルが見つからない場合: `null`
- エラー時: 例外をスロー

#### `parseConfig<T>(filePath: string): Promise<T>`

指定された設定ファイルを直接パースします。

**パラメータ:

- `filePath`: 設定ファイルの絶対パス

**戻り値:

- パースされた設定オブジェクト

#### `findConfigFile(options: FindConfigOptions): Promise<string | null>`

設定ファイルを検索してパスを返します。

**パラメータ:

- `options.configName`: 設定ファイル名
- `options.searchDirs`: 検索ディレクトリ配列
- `options.extensions`: 対応拡張子配列

**戻り値:

- 見つかった設定ファイルの絶対パス、または `null`

### 型定義

```typescript
type EstaSupportedExtensions = '.json' | '.jsonc' | '.yaml' | '.yml' | '.js' | '.ts' | '.mjs' | '.cjs';

type LoadConfigOptions = {
  configName: string;
  searchDirs: string[];
  extensions?: EstaSupportedExtensions[];
};

type FindConfigOptions = {
  configName: string;
  searchDirs: string[];
  extensions: EstaSupportedExtensions[];
};
```

## 使用例

### 基本的な使用例

```typescript
import { loadConfig } from '@esta-utils/config-loader';

// package.jsonを検索・読み込み
const packageConfig = await loadConfig({
  configName: 'package',
  searchDirs: [process.cwd()],
});

if (packageConfig) {
  console.log('Package name:', packageConfig.name);
}
```

### 複数形式対応

```typescript
import { loadConfig } from '@esta-utils/config-loader';

// 設定ファイルを複数形式で検索
const appConfig = await loadConfig({
  configName: 'app.config',
  searchDirs: [process.cwd(), './config'],
  extensions: ['.json', '.yaml', '.js'],
});
```

### 階層的検索

```typescript
import { loadConfig } from '@esta-utils/config-loader';

// 現在のディレクトリから親ディレクトリまで検索
const eslintConfig = await loadConfig({
  configName: '.eslintrc',
  searchDirs: [
    process.cwd(),
    path.join(process.cwd(), '..'),
    path.join(process.cwd(), '../..'),
  ],
});
```

## 内部実装

### パーサー

#### JSON/JSONCパーサー

- `strip-json-comments`によるコメント除去
- `JSON.parse()`による標準パース

#### YAMLパーサー

- `js-yaml`ライブラリによるパース
- セーフローディングによるセキュリティ確保

#### JavaScript/TypeScriptパーサー

- 動的インポートによる実行時読み込み
- ES モジュール・CommonJS モジュール両対応

### エラーハンドリング

- ファイル読み込みエラーの詳細メッセージ
- パースエラーの行番号・位置情報
- 型安全なエラー情報の提供

## 依存関係

### 外部依存

- `js-yaml`: YAML 形式のパース
- `strip-json-comments`: JSON コメント除去

### 内部依存

- `@shared/types`: 共通型定義
- `@shared/constants`: 共通定数

## テスト仕様

### ユニットテスト

- 各パーサーの動作確認
- エラーハンドリングの検証
- 型安全性の確認

### E2Eテスト

- 実際の設定ファイルによる統合テスト
- 複数形式の設定ファイル混在テスト
- 階層的検索の動作確認

## 設計原則

1. **ユニバーサル対応: 主要な設定ファイル形式すべてに対応
2. **型安全性: TypeScript の型システムを活用した安全な設定読み込み
3. **エラーハンドリング: 詳細で理解しやすいエラーメッセージ
4. **パフォーマンス: 必要時のみファイル読み込みを実行
5. **拡張性: 新しいファイル形式への対応が容易

## 今後の拡張予定

- TOML 形式サポート
- 設定ファイルの監視機能
- 設定値の検証機能
- キャッシュ機能の実装
