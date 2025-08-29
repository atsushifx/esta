# Repository Guidelines

このドキュメントは、本リポジトリに貢献する際の最小限かつ実践的なガイドです。変更前に一読し、CI が緑になることをローカルで確認してください。

## Project Structure & Module Organization

- `src/`: TypeScript 本体。コア (`AgLogger.class.ts`, `AgLoggerManager.class.ts`)、`plugins/{logger,formatter}/`、`utils/`、ユニットテストは `__tests__/`。
- `shared/`: パッケージが公開する共通型・定数。
- `tests/`: 統合 `tests/integration/`、E2E `tests/e2e/`。
- `configs/`: Vitest, ESLint, tsup などの設定。
- ビルド成果物: `lib/`(CJS), `module/`(ESM) — 直接編集しないこと。
- `docs/`: 設計ノート・仕様。

## Build, Test, and Development Commands

- `pnpm build`: tsup で CJS/ESM をビルド。
- `pnpm clean`: ビルド生成物とキャッシュ削除。
- `pnpm test:develop | test:ci | test:e2e | test:all`: Vitest 実行（ユニット/CI/E2E/全て）。
- `pnpm check:types`: `tsc` の型チェック（noEmit）。
- `pnpm lint | lint:types | lint:fix`: ESLint の通常/型対応/自動修正。
- `pnpm format:dprint | check:dprint`: dprint で整形/検証。
- `pnpm lint:secrets`: Secretlint による秘匿情報スキャン。

## Docs & Handover

- **`handover.md`**: 完全な引き継ぎ資料・実装ガイド
- **`TODO.md`**: 実行計画書（Markdownチェックボックス形式）
- **`TODO.optimized.md`**: 詳細実装チェックリスト（Red-Green-Refactor組み込み）
- **`docs/refactor.plan.md`**: テスト構造リファクタリング計画
- （任意）`docs/test-optimization.plan.md`: 最適化の参考資料（軽量化は必須要件ではない）
- **`README.md`**: パッケージ概要・使用方法・開発ガイド
- **`./temp/*.md`**: 開発時の分析資料（参考用）

## Execution Method: atsushifx式BDD

- 概要: t-wada の TDD を AI 向けに具体化。実行タスクをユニットテストの `it`/`expect` 単位まで細分化。
- ToDo 記法: フェーズ/タスク種別でグルーピングし、タスクIDを付与して `todo.md` に列挙（例: `PH1-API-003: logger JSON 出力を検証`）。
- 進め方: 1 タスクずつ Red-Green-Refactor を厳守。最初に失敗テスト（Red）→最小実装でグリーン→安全にリファクタ。
- 品質担保: 中途半端な変更を残さず、常に全テスト緑を維持してコミット/PR。
- 補助: 仕様要約や差分抽出は `lsmcp`/`serena-mcp` を活用し、長文貼付を避けプロンプトのトークンを節約。

## Coding Style & Naming Conventions

- ランタイム: Node ≥ 20, ESM（CJSはビルド出力）。
- 命名: クラスは `PascalCase` + `*.class.ts`、ユーティリティは `camelCase`。
- インポート: ESM を優先。パスエイリアス `@/*` → `src/*`。
- 静的解析: ESLint（`configs/eslint.config.js`/typed）、フォーマッタは dprint。PR 前に整形→Lint を実行。

## Testing Guidelines

### テスト構成・方針

- **BDD構造**: Given/When/Then の3階層で統一し、共通操作の下に正常系/異常系/エッジケースを集約。
- **テスト増減方針**: 必要な正常/異常/エッジの追加は許容（品質優先、重複・冗長は排除）。
- **品質指標**: カバレッジ90%以上を維持、実行時間は実用性能を確保。

### テスト分類

- **ユニットテスト** (`src/__tests__/`): 単一機能・クラス・メソッド
- **ファンクショナルテスト** (`src/__tests__/functional/`): 機能統合・ワークフロー
- **インテグレーションテスト** (`tests/integration/`): システム統合
- **E2Eテスト** (`tests/e2e/`): エンドユーザー視点（必要に応じて）

### 実行・開発

- フレームワーク: Vitest、命名: `*.spec.ts`
- Red-Green-Refactorサイクル: 🔴失敗確認 → 🟢最小実装 → 🔄リファクタリング
- Given/When/Then構造、Markdownチェックボックス形式
- 実行例: `pnpm test:all` をPR前必須実行

## Commit & Pull Request Guidelines

- コミット: Conventional Commits。例: `feat(logger): add JSON formatter`、`fix(core): handle null options`。
- PR 要件: 目的の説明、関連 Issue、テスト証跡（出力や E2E スクリーンショット）、型やドキュメント影響の記載。ローカルで build / type-check / lint / tests をすべて緑に。

## Security & Configuration Tips

- 秘密情報: 事前に `pnpm lint:secrets` を実行。資格情報はコミット禁止。
- 設定同期: 一部設定はワークスペース継承。独自変更は理由を明記。
- MCP (Codex CLI): ルートの `.mcp.json` で `lsmcp`/`serena-mcp` を有効化。`/mcp` で状態・ツール確認。仕様要約や検索は MCP ツールを使い、長文貼り付けを避けてプロンプトのトークンを削減する。`.lsmcp/` はローカルキャッシュ（再生成される場合あり）。
