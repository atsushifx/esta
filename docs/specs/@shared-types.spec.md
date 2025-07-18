---
header:
  - src: docs/specs/@shared--types.spec.md
  - @(#) : Shared types package specification
title: 🔷 共通型定義パッケージ仕様書（@shared/types）
version: 1.0.0
created: 2025-07-18
updated: 2025-07-18
authors:
  - 🤖 Claude（初期設計・API仕様策定）
  - 👤 atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-18: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# 🔷 共通型定義パッケージ仕様書

## 概要

`@shared/types`は、estaモノレポ全体で使用される共通型定義を集約したパッケージです。TypeScriptの型システムを活用し、アプリケーション全体での型安全性と一貫性を確保します。

## 主要機能

### 1. 型定義の統一管理

- モノレポ全体で使用される型の中央管理
- 型定義の重複排除
- 一箇所での変更による全体への反映

### 2. 型安全性の確保

- TypeScriptの型システムを活用
- コンパイル時の型チェック
- 実行時エラーの予防

### 3. 開発効率の向上

- 共通型による開発速度向上
- 型定義の再利用促進
- APIの一貫性確保

## 型定義カテゴリ

### 1. 基本型定義

- プリミティブ型の拡張
- 汎用的なユーティリティ型
- 標準的なデータ構造

### 2. 設定型定義

- 各種設定オブジェクトの型
- 設定ファイルの型
- 環境変数の型

### 3. API型定義

- リクエスト/レスポンスの型
- パラメータの型
- 戻り値の型

### 4. エラー型定義

- エラーオブジェクトの型
- 例外クラスの型
- エラーハンドリングの型

## API仕様

### エクスポート構造

```typescript
// メインエクスポート（現在は空）
export {}; // モジュールとして扱うための空エクスポート
```

### 型定義パターン

#### 1. 基本型定義

```typescript
// 文字列リテラル型
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// 数値リテラル型
export type ExitCode = 0 | 1 | 2 | 126 | 127;

// ブール型
export type FeatureFlag = boolean;
```

#### 2. オブジェクト型定義

```typescript
// 設定オブジェクト型
export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly debug: boolean;
  readonly timeout: number;
}

// 拡張可能な設定型
export interface ExtendableConfig {
  [key: string]: unknown;
}
```

#### 3. 関数型定義

```typescript
// コールバック関数型
export type LoggerFunction = (message: string) => void;
export type FormatterFunction = (data: unknown) => string;

// 非同期関数型
export type AsyncHandler<T> = (input: T) => Promise<void>;
```

#### 4. ユーティリティ型

```typescript
// 条件型
export type NonNullable<T> = T extends null | undefined ? never : T;

// マップ型
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// テンプレートリテラル型
export type EventName<T extends string> = `on${Capitalize<T>}`;
```

## 使用例

### 基本的な使用

```typescript
import type { AppConfig, LogLevel } from '@shared/types';

// 型安全な変数定義
const logLevel: LogLevel = 'info';
const config: AppConfig = {
  name: 'esta',
  version: '1.0.0',
  debug: false,
  timeout: 5000,
};
```

### 関数定義での使用

```typescript
import type { AsyncHandler, LoggerFunction } from '@shared/types';

// 型安全な関数定義
const logger: LoggerFunction = (message) => {
  console.log(message);
};

const handler: AsyncHandler<string> = async (input) => {
  await processInput(input);
};
```

### インターフェース拡張

```typescript
import type { AppConfig } from '@shared/types';

// 既存型の拡張
interface ExtendedConfig extends AppConfig {
  readonly customSetting: string;
  readonly features: string[];
}
```

## 型定義ガイドライン

### 1. 命名規則

- **PascalCase**: 型名・インターフェース名
- **camelCase**: プロパティ名
- **UPPER_SNAKE_CASE**: 定数型

### 2. 型定義の原則

- **不変性**: `readonly`修飾子の使用
- **型安全性**: `unknown`の適切な使用
- **拡張性**: 将来の変更に対応した設計

### 3. ドキュメント化

- **JSDoc**: 型の説明を記述
- **例**: 使用例を含める
- **制約**: 型の制約や条件を記述

### 4. 型の分離

- **責任の分離**: 機能別の型定義
- **依存関係**: 循環依存の回避
- **粒度**: 適切な抽象化レベル

## 設計原則

### 1. 型安全性

- 厳密な型定義
- `any`の使用回避
- 型ガードの活用

### 2. 再利用性

- 汎用的な型定義
- 組み合わせ可能な型
- 拡張しやすい設計

### 3. 可読性

- 自己文書化する型名
- 適切なコメント
- 論理的なグループ化

### 4. 保守性

- 変更に強い型定義
- 後方互換性の考慮
- 段階的な移行サポート

## 内部構造

### ディレクトリ構成

```
@shared/types/
├── base/
│   └── index.ts       # メインエクスポート
├── lib/               # CJS出力
├── module/            # ESM出力
└── package.json
```

### ビルドシステム

- **tsup**: CJS/ESM両対応
- **型定義**: `.d.ts`ファイル生成
- **型チェック**: 厳密な型チェック

## 依存関係

### 外部依存

- なし（TypeScriptの型システムのみ）

### 内部依存

- なし（他パッケージに依存しない）

## テスト仕様

### 型テスト

- 型の互換性検証
- 型推論の確認
- 型エラーの検証

### 統合テスト

- 他パッケージでの型使用テスト
- 循環依存の検証
- ビルド結果の検証

## 使用場面

### 1. API定義

```typescript
// リクエスト/レスポンス型
export interface ApiRequest<T> {
  readonly method: string;
  readonly url: string;
  readonly body?: T;
}

export interface ApiResponse<T> {
  readonly status: number;
  readonly data: T;
  readonly message?: string;
}
```

### 2. 設定管理

```typescript
// 設定型定義
export interface ToolConfig {
  readonly name: string;
  readonly version: string;
  readonly options: Record<string, unknown>;
}
```

### 3. エラーハンドリング

```typescript
// エラー型定義
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly cause?: Error;
}
```

## 今後の拡張予定

### 1. 型定義の拡充

- 各パッケージで使用される共通型の追加
- ユーティリティ型の拡張
- 条件型の活用

### 2. 型バリデーション

- 実行時型チェック機能
- スキーマ定義との連携
- 型安全なデータ変換

### 3. 型ドキュメント

- 型定義の自動ドキュメント生成
- 型使用例の自動生成
- 型依存関係の可視化

### 4. 開発ツール

- 型定義の自動生成
- 型互換性チェック
- 型カバレッジ測定

## 型定義例

### 基本的な型定義

```typescript
// 文字列リテラル型
export type Platform = 'win32' | 'linux' | 'darwin';

// 数値リテラル型
export type HttpStatus = 200 | 400 | 401 | 403 | 404 | 500;

// テンプレートリテラル型
export type CacheKey<T extends string> = `cache:${T}`;
```

### 高度な型定義

```typescript
// 条件型
export type ApiResult<T> = T extends string ? { type: 'text'; data: T }
  : T extends number ? { type: 'number'; data: T }
  : { type: 'object'; data: T };

// マップ型
export type ReadonlyRecord<K extends string | number | symbol, V> = {
  readonly [P in K]: V;
};

// 再帰型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```
