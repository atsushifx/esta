---
header:
  - src: docs/.ccKiro/@esta-core/esta-config/esta-config.spec.md
  - "@(#)": ESTA unified user configuration specification
title: ESTA統合ユーザー設定管理仕様書（@esta-core/esta-config）
description: ESTAツール群のユーザー設定を統合管理するパッケージの機能仕様
version: 1.0.0
created: 2025-07-20
updated: 2025-07-20
authors:
  - 🤖 Claude（仕様設計・API定義）
  - 👤 atsushifx（仕様確認・承認）
changes:
  - 2025-07-20: 初回作成（要件定義書に基づく仕様設計）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## ESTA統合ユーザー設定管理仕様書

### 1. 概要

ESTA ツール群におけるユーザー設定の統合管理を行うパッケージです。ツールインストール設定以外のグローバル設定を扱い、CLI・GitHub Actions 間での一貫した設定共有を実現します。

### 2. API仕様

#### 2.1 getEstaConfig関数

ESTA 設定を取得するメイン関数です。

```typescript
export async function getEstaConfig(configPath?: string): Promise<EstaConfig>;
```

##### パラメータ

- `configPath` (optional): 設定ファイルのパス。未指定時は自動検索

##### 戻り値

- `Promise<EstaConfig>`: 完全な ESTA 設定オブジェクト

##### 動作

1. 設定ファイルパスが指定されている場合はそのファイルを読み込み
2. 未指定の場合は以下の順序で設定ファイルを検索
   - `.estarc`
   - `esta.config.js`
   - `esta.config.ts`
   - `esta.config.json`
   - `esta.config.yml`
   - `esta.config.yaml`
3. 読み込んだ設定とデフォルト設定をマージ
4. valibot により設定値を検証
5. 検証済み設定オブジェクトを返却

##### 例外処理

- 設定ファイルが存在しない場合: デフォルト設定を返却
- 設定ファイルの形式が不正な場合: パースエラーをスロー
- 設定値が無効な場合: バリデーションエラーをスロー

#### 2.2 defaultEstaConfig関数

デフォルト設定を取得する関数です。

```typescript
export function defaultEstaConfig(): EstaConfig;
```

##### `defaultEstaConfig`戻り値

- `EstaConfig`: デフォルト設定オブジェクト

##### 設定内容

```typescript
{
  toolsConfigPath: './tools.config.json',
  logLevel: 4 // AgLogLevelCode.INFO
}
```

### 3. データ構造仕様

#### 3.1 EstaConfig型

完全な ESTA 設定を表す型です。

```typescript
export type EstaConfig = {
  /** ツール設定ファイルへのパス */
  toolsConfigPath: string;
  /** ログレベル（@agla-utils/ag-loggerの0-6の数値） */
  logLevel: AgLogLevel;
};
```

##### フィールド詳細

- `toolsConfigPath`: `@esta-core/tools-config`で読み込むツール設定ファイルのパス
- `logLevel`: `@agla-utils/ag-logger`で使用するログレベル（0=OFF、1=FATAL、2=ERROR、3=WARN、4=INFO、5=DEBUG、6=TRACE）

#### 3.2 PartialEstaConfig型

部分的な ESTA 設定を表す型です。設定ファイルからの読み込み時に使用されます。

```typescript
export type PartialEstaConfig = {
  toolsConfigPath?: string;
  logLevel?: AgLogLevel;
};
```

### 4. 設定ファイル仕様

#### 4.1 対応形式

以下の形式の設定ファイルに対応します。

- `.estarc` (JSON 形式)
- `esta.config.js` (CommonJS/ES modules)
- `esta.config.ts` (TypeScript)
- `esta.config.json` (JSON)
- `esta.config.yml` (YAML)
- `esta.config.yaml` (YAML)

#### 4.2 設定ファイル例

##### JSON 形式 (`.estarc`, `*.json`)

```json
{
  "toolsConfigPath": "./custom-tools.config.json",
  "logLevel": 5
}
```

##### TypeScript 形式 (`*.ts`)

```typescript
import { AgLogLevelCode } from '@agla-utils/ag-logger';
import type { PartialEstaConfig } from '@esta-core/esta-config';

export default {
  toolsConfigPath: './custom-tools.config.ts',
  logLevel: AgLogLevelCode.DEBUG,
} satisfies PartialEstaConfig;
```

##### YAML 形式 (`*.yml`, `*.yaml`)

```yaml
toolsConfigPath: ./custom-tools.config.yaml
logLevel: 3
```

### 5. バリデーション仕様

#### 5.1 valibotスキーマ

設定値の検証には valibot ライブラリを使用します。

```typescript
import { number, object, optional, string, transform } from 'valibot';

const EstaConfigSchema = object({
  toolsConfigPath: string(),
  logLevel: pipe(
    number(),
    check((level) => level >= 0 && level <= 6, 'ログレベルは0-6の範囲で指定してください'),
  ),
});

const PartialEstaConfigSchema = object({
  toolsConfigPath: optional(string()),
  logLevel: optional(pipe(
    number(),
    check((level) => level >= 0 && level <= 6, 'ログレベルは0-6の範囲で指定してください'),
  )),
});
```

#### 5.2 検証ルール

- `toolsConfigPath`: 必須、文字列型
- `logLevel`: 必須、0-6の整数

### 6. エラーハンドリング仕様

#### 6.1 エラー種別

##### ConfigNotFoundError

- 発生条件: 指定された設定ファイルが存在しない
- 処理: デフォルト設定を使用して続行

##### ConfigParseError

- 発生条件: 設定ファイルの解析に失敗
- 処理: エラーをスローして処理を中断

##### ConfigValidationError

- 発生条件: 設定値がバリデーションに失敗
- 処理: エラーをスローして処理を中断

#### 6.2 エラーメッセージ例

```typescript
// パースエラー
throw new Error('設定ファイルの形式が正しくありません: esta.config.json');

// バリデーションエラー
throw new Error('ログレベルは0-6の範囲で指定してください: 実際の値 = 10');
```

### 7. パフォーマンス仕様

#### 7.1 実行時間

- 設定読み込み処理: 50ms 以内
- デフォルト設定取得: 1ms 以内

#### 7.2 メモリ使用量

- 設定オブジェクト: 1KB 以下
- 依存関係: 最小限に抑制

### 8. 依存関係仕様

#### 8.1 外部依存

- `@esta-utils/config-loader`: 設定ファイル読み込み
- `valibot`: 設定値検証
- `@agla-utils/ag-logger`: 型定義参照のみ

#### 8.2 内部依存

- `@shared/types`: 共通型定義（設定型に共通型定義が必要な場合）
- `@shared/constants`: 共通定数（デフォルト値や定数値が必要な場合）

### 9. 使用例

#### 9.1 基本的な使用

```typescript
import { getEstaConfig } from '@esta-core/esta-config';

// デフォルト設定で初期化
const config = await getEstaConfig();
console.log(config.toolsConfigPath); // './tools.config.json'
console.log(config.logLevel); // 4
```

#### 9.2 カスタム設定ファイル

```typescript
import { getEstaConfig } from '@esta-core/esta-config';

// カスタム設定ファイルを指定
const config = await getEstaConfig('./my-esta.config.json');
```

#### 9.3 他パッケージとの連携

```typescript
import { AgLogger } from '@agla-utils/ag-logger';
import { getEstaConfig } from '@esta-core/esta-config';
import { getToolsConfig } from '@esta-core/tools-config';

// ESTA設定を取得
const estaConfig = await getEstaConfig();

// ログレベルを設定
const logger = new AgLogger();
logger.setLogLevel(estaConfig.logLevel);

// ツール設定を取得
const toolsConfig = await getToolsConfig(estaConfig.toolsConfigPath);
```

### 10. 互換性

#### 10.1 Node.js

- 対応バージョン: 20.x 以上
- ES modules 対応

#### 10.2 TypeScript

- 対応バージョン: 5.0以上
- 厳密な型チェック対応

### 11. セキュリティ

#### 11.1 設定ファイル読み込み

- パストラバーサル攻撃の防止
- 実行可能ファイルの安全な読み込み

#### 11.2 設定値検証

- 入力値の厳密な検証
- SQL インジェクション等の防止
