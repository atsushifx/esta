---
title: Phase 1 - 基盤パッケージ作成
description: 新アーキテクチャの基盤となるパッケージの作成と統一エラーハンドリングの実現
sidebar_position: 1
---

# Phase 1: Foundation Packages

> **Note**: このフェーズの実装では **t-wad式TDD（Test-Driven Development）** を採用します。テストファーストで実装を進め、品質と設計の確実性を保証します。

# Phase 1: 基盤パッケージ作成

## 実行コマンド

```bash
/kiro "Execute Phase 1: Create foundation packages (@esta-runtime, @esta-error/error-handler, @esta-error/exit-code) with unified error handling and cross-runtime abstraction according to phase1-foundation.md"
```

## 目標

新アーキテクチャの基盤となるパッケージを作成し、統一エラーハンドリングとランタイム抽象化を実現する。

## 期間

Week 1-2 (推定10-14日)

## エラーハンドリング戦略

**基本方針**:

- **基本ユーティリティ**: タプル型 `[value, ErrorResult | undefined]` または混合型（システムエラーはthrow）
- **ESTA統合モジュール**: `EstaError` + throw パターン
- **Result<T,E>パターン**: 廃止（シンプル化のため）

## 成果物概要

### 1. @esta-error/error-handler パッケージ

**場所**: `packages/@esta-error/error-handler/`\
**責任**: EstaError + ErrorResult による統一エラーハンドリング

- EstaError クラス（Error を拡張）の実装
- ErrorResult クラス（基本ユーティリティ用）の実装
- 既存 @esta-core/error-handler との互換性
- 構造化されたエラー情報とコンテキスト

**詳細仕様**: [phase01-1-error-handling.spec.md](./phase01-1-error-handling.spec.md)

### 2. @esta-runtime パッケージ

**場所**: `packages/@esta-runtime/`\
**責任**: Node.js/Deno/Bun/GitHub Actions横断ランタイム抽象化

- 4つのランタイム(Node.js, Deno, Bun, GitHub Actions)の自動検出
- 統一されたファイルシステムAPI（混合型エラーハンドリング）
- 統一されたプロセスAPI（システムエラーはthrow）
- GitHub Actions専用機能の抽象化
- パフォーマンス最適化（各ランタイムのネイティブAPI活用）
- **@esta-error/error-handler との完全統合**

**詳細仕様**: [phase01-2-runtime.spec.md](./phase01-2-runtime.spec.md)

### 3. @esta-error/exit-code パッケージ

**場所**: `packages/@esta-error/exit-code/`\
**責任**: システム終了コード管理（@esta-system/exit-status からの移行・改名）

- 既存 @esta-system/exit-status の機能を保持
- 統一されたエラーコード体系
- プロセス終了管理
- エラーログ機能

### 4. @shared/types 拡張

**場所**: `shared/packages/types/base/index.ts`\
**責任**: プロジェクト全体の統一型定義

- ランタイム関連型
- エラーハンドリング関連型
- 設定関連型
- 共通設定型

### 5. @shared/constants 拡張

**場所**: `shared/packages/constants/base/index.ts`\
**責任**: プロジェクト全体の統一定数定義

- ランタイム識別子
- ログレベルマッピング
- 設定ファイル拡張子
- エラーコード定数

## 品質要件

### テスト要件

```bash
# 各パッケージで必須
pnpm run test:develop --filter="@esta-runtime"         # クロスランタイムテスト
pnpm run test:develop --filter="@esta-error/*"         # エラーハンドリングテスト

# 統合テスト
pnpm run test:integration # 新パッケージ間の統合確認
```

### 型安全性要件

```bash
# TypeScript厳格チェック
pnpm run check:types --filter="@esta-runtime"
pnpm run check:types --filter="@esta-error/*"
pnpm run check:types --filter="@shared/*"
```

### パフォーマンス要件

- **ビルド時間**: 各パッケージ5秒以内
- **テスト実行時間**: 各パッケージ10秒以内
- **ランタイムオーバーヘッド**: 既存比5%以内

## 成功基準

### 必須成功基準

1. **全テスト通過**: 単体・統合テストが100%通過
2. **型チェック通過**: TypeScript厳格モードでエラーなし
3. **ビルド成功**: CJS/ESM両方のビルドが成功
4. **循環依存なし**: madgeチェックで循環依存検出されない

### 機能確認基準

```typescript
// Phase 1 完了確認テスト
import { ErrorResult, EstaError } from '@esta-error/error-handler';
import { EXIT_CODES } from '@esta-error/exit-code';
import { createRuntime } from '@esta-runtime';

// エラーハンドリング確認
try {
  throw new EstaError('TEST_ERROR', 'Test message', { test: true });
} catch (error) {
  console.assert(error instanceof EstaError);
  console.assert(error.code === 'TEST_ERROR');
}

// Runtime抽象化確認
const runtime = createRuntime();
console.assert(['node', 'deno', 'bun', 'github-actions'].includes(runtime.name));

// ファイルシステム確認（タプル型）
const [exists, error] = await runtime.fs.exists('package.json');
if (error) {
  console.error('File check error:', error.message);
} else {
  console.assert(typeof exists === 'boolean');
}

// 終了コード確認
console.assert(EXIT_CODES.SUCCESS === 0);
console.assert(EXIT_CODES.CONFIG_ERROR === 10);
```

## 注意事項

### エラーハンドリング戦略の徹底

- **基本ユーティリティ**: タプル型またはthrowを適切に使い分け
- **ESTA統合モジュール**: EstaErrorで統一
- **システムエラー**: 即座にthrow（回復不可能）
- **ユーザー入力エラー**: タプル型で呼び出し側に判断を委ねる

### ランタイム互換性

- 各ランタイムでの条件付きimportの安全な実装
- 利用不可能な機能の適切なエラーハンドリング
- パフォーマンス最適化とポータビリティのバランス

### 依存関係管理

- 新パッケージ間の循環依存を避ける
- 既存パッケージへの影響を最小化
- @agla系パッケージとの依存関係は最小限に制限

## 次Phase準備

Phase 1完了後、以下が利用可能になる：

- `EstaError` + `ErrorResult` による統一エラーハンドリング
- タプル型による基本ユーティリティエラーハンドリング
- ランタイム横断でのファイル・プロセス操作
- 統一された型・定数定義
- システム終了コード管理

これらの基盤を使用してPhase 2で機能統合パッケージを作成する。
