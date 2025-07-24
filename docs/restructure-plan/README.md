# Esta Monorepo Restructuring Plan

このディレクトリには、estaモノレポのリストラクチャリング計画が含まれています。

## ドキュメント構成

| ファイル                                                 | 内容                                             | ステータス |
| -------------------------------------------------------- | ------------------------------------------------ | ---------- |
| [00-overview.md](./00-overview.md)                       | プロジェクト全体概要とリストラクチャリングの目的 | ✅ 完了    |
| [01-current-analysis.md](./01-current-analysis.md)       | 現在のアーキテクチャ分析と課題特定               | ✅ 完了    |
| [02-new-architecture.md](./02-new-architecture.md)       | 新しいパッケージ構成と設計                       | ✅ 完了    |
| [03-migration-strategy.md](./03-migration-strategy.md)   | 移行戦略と詳細手順                               | ✅ 完了    |
| [04-implementation-plan.md](./04-implementation-plan.md) | 実装プランと最終統合ガイド                       | ✅ 完了    |

## 実装フェーズ

### Phase 1: 基盤パッケージ統合 (進行中)

- **@esta-config**: 設定管理の統合パッケージ (🚧 実装中)
- **@shared**: 共有定数・型定義の統合

### Phase 2: ユーティリティ再編成 (予定)

- **@esta-utils**: ユーティリティパッケージの統合
- **@agla-utils**: esta-utilsへの移行

### Phase 3: システム・アクション整理 (予定)

- **@esta-actions**: GitHub Actions関連パッケージ
- **@esta-system**: システムレベルユーティリティ

## クイックスタート

リストラクチャリング計画の理解のため、以下の順序で読むことを推奨します：

1. **概要把握**: [00-overview.md](./00-overview.md) - なぜリストラクチャリングが必要か
2. **現状理解**: [01-current-analysis.md](./01-current-analysis.md) - 現在の課題は何か
3. **設計理解**: [02-new-architecture.md](./02-new-architecture.md) - どのような構成にするか
4. **移行理解**: [03-migration-strategy.md](./03-migration-strategy.md) - どのように移行するか
5. **実装理解**: [04-implementation-plan.md](./04-implementation-plan.md) - 具体的に何をするか

## 現在の進捗

```
Phase 1: 基盤パッケージ統合     ████████░░ 80%
├── esta-config             ████████░░ 80% (実装中)
└── shared packages         ░░░░░░░░░░  0% (計画中)

Phase 2: ユーティリティ再編成   ░░░░░░░░░░  0%
Phase 3: システム・アクション整理 ░░░░░░░░░░  0%
```

## 品質チェック

実装完了後は必ず以下のコマンドを実行してください：

```bash
# 基本チェック
pnpm run build
pnpm run check:types
pnpm run test:develop

# 品質チェック
pnpm run lint-all:types
pnpm run check:spells
pnpm run check:dprint
```

---

**更新日**: 2025-01-24\
**ステータス**: Phase 1 実装中
