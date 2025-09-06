---
header:
  - src: AGENTS.md
  - @(#): AI エージェント向け参照ハブ (@shared/types パッケージ)
title: AI Agents Guide for @shared/types Package
description: Claude Code, Codex, その他の AI エージェント向けの @shared/types パッケージガイド
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

@shared/types パッケージの AI エージェント向け総合ガイドです。
Claude Code, GitHub Codex, その他の AI 開発支援ツールが効率的に作業できるよう、
パッケージ構造、シンボル、ワークフローを整理しています。

## 参照階層

### プロジェクト全体の参照

- `../../../AGENTS.md`: ルートレベルの AI エージェントガイド
- `../../../docs/claude/`: プロジェクト全体のドキュメント体系

### パッケージ専用リソース

- `CLAUDE.md`: Claude Code 専用ガイド（本パッケージ）
- `temp/`: MCP ツール最適化ドキュメント群

## MCP ツール統合ドキュメント

### 効率的なコードナビゲーション

1. **`temp/symbol-analysis.md`**
   - 全シンボル詳細解析（クラス・型・関数・メソッド）
   - アーキテクチャパターン説明
   - 設計思想とメモリ管理戦略

2. **`temp/serena-mcp-navigation-guide.md`**
   - serena-mcp ツール最適化ワークフロー
   - シンボル階層ナビゲーション
   - 編集操作のベストプラクティス

3. **`temp/lsmcp-search-guide.md`**
   - lsmcp ツールのシンボル検索パターン
   - 横断検索・参照解析コマンド
   - 型システムナビゲーション

4. **`temp/test-structure-analysis.md`**
   - テスト構成の最適化提案
   - 削除候補・統合候補の特定
   - テスト種別分類とベストプラクティス

## パッケージアーキテクチャ

### 中核コンポーネント

```typescript
// 抽象ベースクラス
export abstract class AglaError extends Error {
  // エラーチェーン・コンテキスト管理・シリアライゼーション
}

// 重要度管理
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// 型安全性
export type AglaErrorContext = { [key: string]: unknown };
export function isValidAglaErrorContext(value: unknown): value is AglaErrorContext;
```

### 設計原則

1. **抽象化による拡張性**: AglaError を継承した具象実装
2. **不変性**: readonly プロパティで状態保護
3. **型安全性**: 実行時バリデーション + TypeScript 型推論
4. **フルエント API**: メソッドチェーンによる直感的操作

## AI エージェント用ワークフロー

### コード理解フェーズ

```bash
# 1. プロジェクト概要把握
cat CLAUDE.md AGENTS.md

# 2. シンボル全体像理解
cat temp/symbol-analysis.md

# 3. 詳細ナビゲーション
# serena-mcp の場合
get_symbols_overview --relative_path "types"
find_symbol --name_path "AglaError" --include_body true

# lsmcp の場合
search_symbols --kind Class --name "AglaError"
get_symbol_details --symbol "AglaError" --includeChildren true
```

### 開発・編集フェーズ

```bash
# 1. 型定義の編集
replace_symbol_body --name_path "AglaError/toString" --relative_path "types/AglaError.types.ts"

# 2. テスト追加・修正
insert_after_symbol --name_path "last_test_case" --relative_path "src/__tests__/unit-level/AglaError.spec.ts"

# 3. 検証
pnpm test
pnpm check:types
```

### テスト最適化フェーズ

```bash
# 1. 現状分析
cat temp/test-structure-analysis.md

# 2. 削除対象特定
search_for_pattern --substring_pattern "expect.*toBe.*undefined" --relative_path "src/__tests__"

# 3. 統合候補特定
find_symbol --name_path "describe" --substring_matching true
```

## AI エージェント固有の考慮事項

### Claude Code 用

- **MCP サーバー活用**: lsmcp, serena-mcp の併用推奨
- **段階的編集**: ファイル単位での変更後にテスト実行
- **型安全性重視**: TypeScript エラーの即座解決

### GitHub Codex 用

- **コンテキスト最適化**: `temp/` ドキュメント並行参照
- **パターン認識**: BDD テスト構造の理解
- **レガシー互換**: 既存 API を破壊しない変更

### 汎用 AI ツール用

- **シンボル索引**: `temp/symbol-analysis.md` を活用
- **アーキテクチャ理解**: 設計パターンの把握
- **テスト戦略**: 単体・機能・統合・E2E の区分

## 品質保証

### 自動検証

```bash
# 型チェック
pnpm check:types

# リント
pnpm lint

# テスト実行
pnpm test

# ビルド確認
pnpm build
```

### 手動検証項目

- エラーチェーンの動作確認
- シリアライゼーションの一貫性
- 型ガード関数の正確性
- テストカバレッジの妥当性

## 制約・注意事項

### 編集禁止領域

- `lib/`, `module/` ディレクトリ（生成物）
- `node_modules/`
- `.lsmcp/` （MCP キャッシュ）

### 必須遵守事項

- **ESM 優先**: import/export 構文の使用
- **型安全性**: any 型の回避
- **不変性**: 既存オブジェクトの変更禁止
- **テスト実行**: 変更後の検証必須

この参照ガイドにより、AI エージェントは効率的かつ安全に @shared/types パッケージでの作業を実行できます。
