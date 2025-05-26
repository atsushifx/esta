# 📦 @aglabo-actions/tool-installer

`tool-installer` は、GitHub Actions 向けに外部CLIツールを柔軟にセットアップするユーティリティです。
pnpm環境・マルチパッケージ構成に最適化されています。

---

#### 📌 pnpm 利用時の注意

- **sub-package間の依存解決は workspace: 指定**で行います
- `pnpm install` 時に `node_modules` が未作成の場合は 必ずルートで実行
- `tool-installer` の `@/` エイリアスは `./src` にマッピング（`baseUrl` 設定）

#### 📋 テストの実行

| コマンド名               | 内容                               |
| ------------------------ | ---------------------------------- |
| `pnpm check:dprint`      | dprintによるフォーマットチェック   |
| `pnpm check:types`       | tscによる型チェック                |
| `pnpm check:spells **/*` | cSpellによるスペルチェック         |
| `pnpm test`              | 単体&総合テスト                    |
| `pnpm test:develop`      | 単体テスト（src/ 以下）            |
| `pnpm test:ci`           | 統合テスト（tests/ 以下）          |
| `pnpm lint`              | ESLint チェック（型なし）          |
| `pnpm lint:type`         | 型情報を伴うESLintチェック（slow） |

#### 📦 依存モジュール構成 (簡易)

| パッケージ名       | 用途                                    |
| ------------------ | --------------------------------------- |
| `@ag-utils/common` | getPlatform等の共通ユーティリティを集約 |
| `@shared/*`        | 型定義、定数                            |

#### 📝 その他

- monorepo構成のため、`/shared/configs/`下の `tsconfig.base.json` / `eslint.config.base.js` を確認
- エイリアス (`@/`) は `tsconfig.json` で `baseUrl: ./src` に対応
