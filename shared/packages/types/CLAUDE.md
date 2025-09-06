---
header:
  - src: CLAUDE.md
  - @(#): Claude Code 向け参照ハブ (@shared/types パッケージ)
title: Claude Guide for @shared/types Package
description: Claude Code 向けの @shared/types パッケージガイドと参照資料
version: 0.1.0
created: 2025-09-06
authors:
  - atsushifx
  - Claude Code
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 目的

@shared/types パッケージ専用の Claude Code 向けガイドです。
統合型エラーハンドリングライブラリとして、AglaError クラス階層と ErrorSeverity 列挙型を提供します。

## 参照 (Package-Specific Docs)

### プロジェクト全体の参照

- `../../../CLAUDE.md`: ルートレベルの Claude ガイド
- `../../../docs/claude/`: プロジェクト全体のドキュメント

### パッケージ固有の参照

- `temp/symbol-analysis.md`: コアシンボル・設計パターン・アーキテクチャ概要
- `temp/test-structure-analysis.md`: テスト構成分析と最適化提案
- `temp/lsmcp-search-guide.md`: lsmcp ツールのシンボル検索パターンとコマンド
- `temp/serena-mcp-navigation-guide.md`: serena-mcp ツールのナビゲーション・ワークフロー

## パッケージ構成

### 型定義 (types/)

```
types/
├── AglaError.types.ts     # 抽象エラークラス・型定義
├── ErrorSeverity.types.ts # 重要度列挙型・バリデーション
└── index.ts              # パブリック API エクスポート
```

### テスト (src/**tests**/)

```
src/__tests__/
├── unit-level/           # 単体テスト (コンストラクタ・プロパティ)
├── validation-tests/     # バリデーション・型ガード
├── functional/           # 機能テスト (エラーチェーン・シリアライゼーション)
└── helpers/             # TestAglaError ユーティリティ
```

### 統合・E2E テスト (tests/)

```
tests/
├── integration/         # パッケージ間互換性テスト
└── e2e/                # 実世界使用シナリオ
```

## 主要シンボル

### クラス階層

- **AglaError** (抽象ベースクラス): エラーチェーン・シリアライゼーション機能
- **TestAglaError** (テストユーティリティ): AglaError の具象実装
- **_AglaErrorOptions** (内部クラス): コンストラクタパラメータ管理

### 型定義

- **AglaErrorContext**: `{ [key: string]: unknown }` - 柔軟なコンテキスト型
- **AglaErrorOptions**: コンストラクタオプション
- **AglaErrorConstructor**: ファクトリーメソッド用型

### 列挙型

- **ErrorSeverity**: FATAL, ERROR, WARNING, INFO (文字列値)

### バリデーション関数

- **isValidAglaErrorContext**: 型ガード関数
- **guardAglaErrorContext**: バリデーションガード
- **isValidErrorSeverity**: 列挙型バリデーション

## 開発コマンド

### ビルド・テスト

```bash
# パッケージ単体テスト
pnpm test

# 型チェック
pnpm check:types

# リント・フォーマット
pnpm lint
pnpm format

# ビルド
pnpm build
```

### MCP ツール統合

- **lsmcp**: シンボルインデックス・検索・リファレンス解析
- **serena-mcp**: プロジェクトナビゲーション・シンボル編集

## 重要な実装パターン

### 抽象ベースクラスパターン

AglaError は抽象クラスで具象実装が必要。TestAglaError が標準実装。

### フルエントインターフェース

`chain()` メソッドで不変なエラーチェーンを構築。

### 型安全性

実行時型チェックと TypeScript 型推論の組み合わせ。

### シリアライゼーション戦略

- `toString()`: 人間可読形式
- `toJSON()`: 構造化データ形式

## 注意事項

- **ESM ファーストアプローチ**: import/export を優先
- **不変データ構造**: readonly プロパティで状態保護
- **レガシー互換性**: 旧パラメータ形式もサポート
- **メモリ管理**: 循環参照を避ける設計

詳細な技術情報は `temp/` ディレクトリの各ドキュメントを参照してください。
