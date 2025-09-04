---
header:
  - src: docs/restructuring/01-current-analysis.md
  - @(#): 現状分析とパッケージ課題の特定
title: 現状分析とパッケージ課題（01-current-analysis）
description: ESTAモノレポの現状分析と既存パッケージ構成の課題特定
version: 1.0.0
created: 2025-09-04
authors:
  - atsushifx
changes:
  - 2025-09-04: 標準化対応（フロントマター統一・見出し調整）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 現在のパッケージ構成分析

### パッケージ分布

#### @esta-actions/ (1パッケージ)

```bash
@esta-actions/tools-installer
├── 責務: GitHub Actions用ツールインストール
├── 依存: @actions/core, @actions/io, @actions/tool-cache
└── 課題: eget以外のインストーラー未対応、エラーハンドリング不統一
```

#### @esta-core/ (4パッケージ)

```bash
@esta-core/error-handler        # 重複1
├── 責務: エラーハンドリングとexit管理
├── 重複: @esta-error/error-handler と機能重複
└── 課題: エラーパターン不統一

@esta-core/esta-error           # 重複2
├── 責務: コアエラーハンドリング
├── 重複: error-handler と統合が必要
└── 課題: Result<T,E>パターン未実装

@esta-core/feature-flags
├── 責務: 機能フラグ管理
└── 状態: 実装途中、使用箇所少

@esta-core/tools-config         # 80%完了
├── 責務: ツール設定管理、バリデーション、マージ
├── 進捗: 80%実装完了
└── 残課題: logLevel統合、テストカバレージ90%達成
```

#### @esta-system/ (2パッケージ)

```bash
@esta-system/exit-status
├── 責務: システム終了ステータス管理
└── 課題: エラーハンドリングとの重複

@esta-system/runtime
├── 責務: ランタイム検出（Node/Deno/Bun/GHA）
├── 実装: 基本的な検出のみ
└── 課題: GitHub Actions判定強化、Deno/Bun対応拡張必要
```

#### @esta-utils/ (3パッケージ)

```bash
@esta-utils/command-runner
├── 責務: コマンド存在確認、実行ユーティリティ
├── 実装: Windows/Linux対応
└── 課題: Deno/Bun対応、エラーハンドリング統一

@esta-utils/config-loader
├── 責務: JSON/YAML/JS/TS設定ファイル読み込み
├── 実装: 多形式対応済み
└── 課題: バリデーション統合、エラー統一

@esta-utils/get-platform
├── 責務: プラットフォーム検出（OS/アーキテクチャ）
├── 実装: クロスプラットフォーム対応済み
└── 移行予定: @esta-system/platform へ統合
```

#### @agla-utils/ (1パッケージ)

```bash
@agla-utils/ag-logger
├── 責務: 構造化ログフレームワーク
├── 実装: 多様なフォーマッター、MockLogger
├── 課題: MockLoggerリファクタリング必要、名前空間不統一
└── 計画: @esta-utils/logger へ移行
```

#### @agla-e2e/ (1パッケージ)

```bash
@agla-e2e/fileio-framework
├── 責務: E2E testingのファイルI/Oフレームワーク
├── 状態: 安定実装
└── 移行予定: @esta-utils/testing または統合検討
```

#### @shared/ (2パッケージ)

```bash
@shared/constants
├── 責務: 共通定数（終了コード、デフォルト、ディレクトリ）
├── 重複課題: 各パッケージで定数再定義
└── 統合必要: LogLevel, PlatformType, ExitCode

@shared/types
├── 責務: 共通TypeScript型定義
├── 現状: 最小限の実装
└── 拡張必要: 統一型定義として機能強化
```

### 重複・問題分析

#### 1. 型・定数重複問題

| 定義          | 重複箇所                              | 統一先            |
| ------------- | ------------------------------------- | ----------------- |
| LogLevel      | ag-logger/shared/types, tools-config  | @shared/types     |
| PlatformType  | get-platform, command-runner          | @shared/types     |
| ExitCode      | error-handler, exit-status, constants | @shared/constants |
| ErrorSeverity | esta-error, error-handler             | @shared/types     |

#### 2. エラーハンドリング不統一

| パッケージ     | エラーパターン | 課題               |
| -------------- | -------------- | ------------------ |
| command-runner | boolean返却    | 詳細エラー情報なし |
| config-loader  | null/undefined | エラー理由不明     |
| get-platform   | throw Error    | 例外キャッチ必須   |
| error-handler  | exit()         | プロセス強制終了   |

#### 3. ランタイム対応状況

| ランタイム     | 対応状況    | 制限・問題                   |
| -------------- | ----------- | ---------------------------- |
| Node.js        | ✅ 完全対応 |                              |
| Deno           | ⚠️ 部分対応  | Node.js固有APIの使用箇所あり |
| Bun            | ⚠️ 未検証    | 互換性テスト未実施           |
| GitHub Actions | ✅ 基本対応 | runtime判定の精度向上必要    |

## 🎯 具体的課題詳細

### 課題1: パッケージ断片化

**現状**:

- 機能別に細分化された 25+パッケージ
- 関連性のある機能が複数パッケージに分散
- 依存関係の複雑化

**影響**:

- 学習コスト: 新規開発者が全体像を把握困難
- 保守コスト: 変更時の影響範囲把握が困難
- 開発効率: import 文の複雑化、パッケージ間移動頻度増加

**定量評価**:

- パッケージ数: 25+ (目標: ~10)
- 平均 import 数/ファイル: 8-12 (目標: 4-6)
- 関連機能の分散度: 高 (目標: 低)

### 課題2: 型・定数重複

**重複詳細**:

#### LogLevel

```typescript
// @agla-utils/ag-logger/shared/types/AgLogLevel.types.ts
export enum AgLogLevel {
  VERBOSE = -99,
  OFF = 0,
  FATAL = 1,
  ERROR = 2,
  WARN = 3,
  INFO = 4,
  DEBUG = 5,
  TRACE = 6,
}

// @esta-core/esta-config/src/logLevel.ts
export enum LogLevel {
  OFF = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}
```

#### PlatformType

```typescript
// @esta-utils/get-platform/shared/types/platform.ts
export type TPlatform = 'win32' | 'linux' | 'darwin' | 'unknown';

// 他の箇所でも類似定義が散在
```

**影響**:

- 型の不一致によるランタイムエラー
- 変更時の同期漏れ
- IDE 支援の効果低下

### 課題3: エラーハンドリング不統一

**現在のパターン分析**:

#### パターン1: boolean返却

```typescript
// @esta-utils/command-runner
export function commandExists(command: string): boolean {
  // エラー詳細が失われる
}
```

#### パターン2: null/undefined返却

```typescript
// @esta-utils/config-loader
export function loadConfig(path: string): Config | null {
  // エラー理由が不明
}
```

#### パターン3: 例外スロー

```typescript
// @esta-utils/get-platform
export function getPlatform(): Platform {
  throw new Error('Unsupported platform');
  // 処理の中断
}
```

#### パターン4: プロセス終了

```typescript
// @esta-core/error-handler
export function fatalError(message: string): never {
  process.exit(1); // プロセス強制終了
}
```

**統一目標**:

Result<T,E> パターン:

```typescript
export type Result<T, E> = Ok<T> | Err<E>;
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
```

### 課題4: ランタイム依存問題

**Node.js固有API使用箇所**:

- `process.platform` (プラットフォーム判定)
- `process.env` (環境変数アクセス)
- `child_process` (外部コマンド実行)
- `fs.promises` (ファイルシステムアクセス)

**Deno対応課題**:

- Deno.env の使用必要
- Deno.Command による実行
- Web API 優先の設計必要

**GitHub Actions対応課題**:

- GITHUB_ACTIONS 環境変数による判定精度向上
- @actions/* モジュールとの統合

### 課題5: CLI/GHA整合不足

**エラー報告の不整合**:

#### CLI実行時

```bash
Error: Invalid configuration file
Exit code: 1
```

#### GitHub Actions実行時

```yaml
Error: Configuration validation failed
::error::Invalid tool configuration
Exit code: 1
```

**ログ形式の不整合**:

- CLI: プレーンテキスト形式
- GHA: GitHub Actions annotation 形式
- 構造化ログの欠如

## 📈 改善の必要性定量評価

### 複雑度指標

<!-- textlint-disable ja-hiraku -->

| 指標                  | 現在値 | 目標値 | 改善必要度 |
| --------------------- | ------ | ------ | ---------- |
| Cyclomatic Complexity | 高     | 中     | 🔴 高      |
| Package Coupling      | 高     | 低     | 🔴 高      |
| Code Duplication      | 25%+   | <5%    | 🔴 高      |
| API Consistency       | 低     | 高     | 🟡 中      |

### 保守性指標

| 指標           | 現在値 | 目標値 | 改善必要度 |
| -------------- | ------ | ------ | ---------- |
| Change Impact  | 高     | 低     | 🔴 高      |
| Test Coverage  | ~80%   | 90%+   | 🟡 中      |
| Documentation  | 分散   | 統一   | 🟡 中      |
| Learning Curve | 急     | 緩やか | 🔴 高      |

<!-- textlint-enable -->

## 🚀 リストラクチャリングの必要性

### 緊急度評価

1. **Critical**: 型・定数重複、エラーハンドリング不統一
   - 開発効率に直接影響
   - バグの温床となっている

2. **High**: パッケージ断片化、ランタイム依存
   - 将来的な拡張性に影響
   - 新機能追加のボトルネック

3. **Medium**: CLI/GHA 整合不足
   - ユーザー体験に影響
   - 運用面での改善効果

### ROI (投資対効果) 評価

#### 投資 (コスト)

- 設計・実装工数: 約 40-60人日
- テスト・検証工数: 約 20-30人日
- ドキュメント整備: 約 10-15人日

#### 効果 (リターン)

- 開発効率向上: 30-40%
- バグ減少: 50-60%
- 学習コスト削減: 40-50%
- 保守コスト削減: 35-45%

**結論**: 中長期的な ROI は非常に高く、早期実施が推奨される。

---

この現状分析に基づき、次章では具体的な目標アーキテクチャを設計します。
