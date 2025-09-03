---
header:
  - src: AGENTS.md
  - @(#): Agents向けリファレンスの読み込み指針と参照ハブ
title: Agents Guide
description: Codex/Claude等のエージェントがdocs/claude配下を正として参照・読込するためのガイド
version: 0.2.2
created: 2025-09-06
authors:
  - atsushifx
  - Claude Code
changes:
  - 2025-09-06: docs/claude参照ハブとして再構成 (H2起点・FM追加)
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 目的

本ドキュメントは、リポジトリ内の実作業ガイドを重複掲載せず、`docs/claude/` 配下のモジュラー文書を「正」として参照・読み込みするためのハブです。Codex CLI / Claude Code などのエージェントは、以降のリンクを優先的に読み込み、運用時の根拠資料としてください。

## 参照 (Canonical Docs)

- `docs/claude/project-overview.md`: プロジェクト概要・パッケージ構成
- `docs/claude/commands.md`: 開発コマンド総覧 (build/test/lint/format 等)
- `docs/claude/architecture.md`: アーキテクチャとビルド構成
- `docs/claude/development.md`: 開発フロー・実務手順 (BDD 含む)
- `docs/claude/testing.md`: テスト戦略とテスト階層
- `docs/claude/quality-assurance.md`: 品質保証・コード品質チェック
- `docs/claude/pending-tasks.md`: 未了タスク・優先度
- `docs/claude/conventions.md`: コーディング規約・重要リマインダー

## ドキュメント作成ルール (最小抜粋)

<!-- textlint-disable ja-technical-writing/sentence-length -->

- 新規 Markdown はフロントマター必須、見出しは H2から (本書は準拠済み) 。
- 生成器を優先: `pnpm run new:doc docs/<path>/<file>.md --title "..." --description "..." --tags tag1,tag2 --author <name>`
- テンプレート: `docs/_templates/template.md`

詳細は `docs/claude/conventions.md` を参照してください。

<!-- textlint-enable -->

## 開発・運用の即時参照

- ビルド/テスト/リント等: `docs/claude/commands.md`
- パッケージ構造とリファクタ状況: `docs/claude/project-overview.md`
- 開発フローと手順: `docs/claude/development.md`

## MCP (Codex CLI)

- 設定: ルートの `.mcp.json` でサーバー定義 (例: `lsmcp`, `serena-mcp`)。
- 利用: Codex はワークスペースの `.mcp.json` を自動読込。`/mcp` で状態・ツール確認。
- 追加: `.mcp.json` に `type`/`command`/`args` を追記 (可能な限り相対パス)。
- ローカル状態: `.lsmcp/` はキャッシュ/メモリ領域 (再生成され得る)。

## 注意事項

- 生成物 (`lib/`, `module/`) は編集禁止。`src/` を変更し、ビルドしてください。
- ESM を優先し、パスエイリアス `@/*` は `src/*` を指す。
- コミットは Conventional Commits に準拠。詳細は `docs/claude/conventions.md`。

## 参考 (作業ドキュメント)

`temp/` は Git 管理外の作業用資料です。必要時に直接参照可能です。

- `temp/README.md`: 作業用ノートと補足事項の索引
- `temp/project-structure-map.md`: プロジェクト/パッケージの構造マップ
- `temp/document-heading-map.md`: ドキュメント見出しの設計・構成マップ
- `temp/symbol-search-map.md`: シンボル検索パターンとガイド
- `temp/lsmcp-serena-search-guide.md`: 高度な検索ツール (lsmcp/serena) 利用ガイド
