---
title: ESTA システムリストラクチャリング実行ガイド
description: ESTAモノレポの段階的リストラクチャリング計画と実行手順
sidebar_position: 0
---

# ESTA System Restructuring - /kiro Execution Guide

# /kiro実行用 ESTAシステムリストラクチャリング計画

## 概要

ESTAモノレポの大規模リストラクチャリングを7つのPhaseに分けて実行します。各Phaseは独立して実行可能で、/kiroコマンドで段階的に実装できます。

## 実行方法

### 基本コマンド

```bash
/kiro "Execute [Phase名] according to specifications in docs/.cc-kiro/restructure-plan/[phase-file].md"
```

### Phase実行順序

```bash
# Phase 1: 基盤構築
/kiro "Execute Phase 1 according to docs/.cc-kiro/restructure-plan/phase1-foundation.md"

# Phase 2: 機能統合  
/kiro "Execute Phase 2 according to docs/.cc-kiro/restructure-plan/phase2-integration.md"

# Phase 3: アプリケーション統合
/kiro "Execute Phase 3 according to docs/.cc-kiro/restructure-plan/phase3-application-integration.md"

# Phase 4: システム・アクション強化
/kiro "Execute Phase 4 according to docs/.cc-kiro/restructure-plan/phase4-system-actions.md"

# Phase 5: 統合パッケージ作成
/kiro "Execute Phase 5 according to docs/.cc-kiro/restructure-plan/phase5-unified-packages.md"

# Phase 6: テスト強化・品質保証
/kiro "Execute Phase 6 according to docs/.cc-kiro/restructure-plan/phase6-testing-qa.md"

# Phase 7: パフォーマンス最適化・ドキュメント整備
/kiro "Execute Phase 7 according to docs/.cc-kiro/restructure-plan/phase7-optimization-docs.md"
```

## ドキュメント構成

### 実行用ドキュメント

- **README.ja.md** (このファイル) - 実行ガイド・目次
- **phase1-foundation.md** - Phase 1: 基盤パッケージ作成
- **phase2-integration.md** - Phase 2: 機能統合パッケージ作成
- **phase3-application-integration.md** - Phase 3: アプリケーション層統合
- **phase4-system-actions.md** - Phase 4: システム・アクション機能強化
- **phase5-unified-packages.md** - Phase 5: エンドユーザー向け統合パッケージ作成
- **phase6-testing-qa.md** - Phase 6: 包括的テスト体系・品質保証フレームワーク
- **phase7-optimization-docs.md** - Phase 7: パフォーマンス最適化・ドキュメント整備

### 詳細設計ドキュメント（参考）

- **phase-3-detailed-design.md** - Phase 3-4の詳細技術設計
- **phase-4-detailed-design.md** - Phase 5-6の詳細技術設計
- **phase-5-detailed-design.md** - Phase 7の詳細技術設計

### 参考ドキュメント

- **architecture-overview.md** - 新アーキテクチャの全体像
- **quality-standards.md** - 品質基準・テスト要件
- **migration-checklist.md** - 移行チェックリスト

## エラーハンドリング統一戦略

**基本方針**:

- **基本ユーティリティ**: タプル型 `[value, ErrorResult | undefined]` または混合型（システムエラーはthrow）
- **ESTA統合モジュール**: `EstaError` + throw パターン
- **Result<T,E>パターン**: 廃止（シンプル化のため）

```typescript
// 基本ユーティリティ例
export function validatePath(path: string): [string, ErrorResult | undefined] {
  if (!path) return [undefined, new ErrorResult('INVALID_PATH', 'Path required')];
  return [path.normalize(), undefined];
}

export function getPlatform(): string {
  // システムエラーは即座にthrow
  return process.platform || throw new Error('Platform detection failed');
}

// ESTA統合モジュール例  
export async function installTool(config: ToolConfig): Promise<InstallInfo> {
  const [validConfig, error] = validateToolConfig(config);
  if (error) {
    throw new EstaError('INVALID_CONFIG', error.message, { config });
  }
  return await actualInstall(validConfig);
}
```

## Phase概要

### Phase 1: 基盤構築 (Week 1-2)

**目標**: 新アーキテクチャの基盤となるパッケージを作成

**成果物**:

- `@esta-runtime` - ランタイム抽象化(Node.js/Deno/Bun/GitHub Actions)
- `@esta-error/error-handler` - EstaError + ErrorResult 統一エラーハンドリング
- `@esta-error/exit-code` - システム終了コード管理
- `@shared/types` 拡張 - 統一型定義
- `@shared/constants` 拡張 - 統一定数定義

**実行後状態**: 基盤パッケージが利用可能、他パッケージから参照可能

### Phase 2: 機能統合 (Week 3-4)

**目標**: 重複している機能パッケージを統合

**成果物**:

- `@esta-config` - 全設定処理統合 (3パッケージ→1パッケージ)
- `@esta-validation` - バリデーション・正規化統合
- `@esta-path-utils` - パス操作統合 (2パッケージ→1パッケージ)
- `@esta-fs-utils` - ファイル操作統合

**実行後状態**: 重複機能が解消、統一APIで利用可能

### Phase 3: アプリケーション層統合 (Week 5)

**目標**: コアアプリケーション機能を統合

**成果物**:

- `@esta-tools/installer` - 統合ツールインストーラー (eget/npm/script/GitHub対応)
- `@esta-tools/command` - 統合コマンド実行 (詳細エラー情報、並列実行対応)

**実行後状態**: アプリケーション層の基本機能が統合・最適化

### Phase 4: システム・アクション機能強化 (Week 6)

**目標**: GitHub Actions・システムレベル機能を強化

**成果物**:

- `@esta-actions/workflow-helpers` - ワークフロー支援ユーティリティ
- `@esta-actions/action-utils` - アクション開発ユーティリティ
- `@esta-system/environment-manager` - 環境変数管理
- `@esta-system/process-manager` - プロセス管理

**実行後状態**: GitHub Actions・システム機能が大幅強化

### Phase 5: 統合パッケージ作成 (Week 7-8)

**目標**: エンドユーザー向け統合パッケージを作成

**成果物**:

- `@esta-cli` - CLI開発者向け完全統合パッケージ
  - CLIBuilder, CLIApplication クラス
  - プリセットシステム (TypeScript, Node.js, DevTools)
  - 高レベル統合API
- `@esta-github-actions` - GitHub Actions向け特化パッケージ
  - ActionBuilder クラス
  - 型安全な入力検証・出力管理
  - セキュリティチェック機能

**実行後状態**: 開発者が利用する統合インターフェースが完成

### Phase 6: テスト強化・品質保証 (Week 9)

**目標**: 包括的テスト体系と品質保証フレームワークを構築

**成果物**:

- **統合テストフレームワーク**: パッケージ間統合テスト、API統合テスト
- **E2Eテストフレームワーク**: CLIシナリオ、GitHub Actionsワークフローテスト
- **パフォーマンステストスイート**: ビルド時間、実行時間、メモリ使用量測定
- **品質保証フレームワーク**: 自動化品質チェック、継続的品質監視

**実行後状態**: 全システムが包括的テスト・品質保証でカバー

### Phase 7: パフォーマンス最適化・ドキュメント整備 (Week 10)

**目標**: 最終的なパフォーマンス最適化と包括的ドキュメント整備

**成果物**:

- **パフォーマンス最適化**:
  - ビルド時間20%改善 (依存関係最適化、キャッシュ強化、並列ビルド)
  - 実行時間最適化 (遅延読み込み、インテリジェントキャッシュ)
  - バンドルサイズ10%削減 (Tree shaking、コード分割)
- **包括的ドキュメント**:
  - ユーザーガイド (クイックスタート、開発ガイド、APIリファレンス)
  - 開発者ドキュメント (アーキテクチャ、コントリビューション)
  - 自動ドキュメント生成システム
- **最終品質監査**:
  - 成功指標達成確認
  - 包括的品質チェック
  - パフォーマンス回帰テスト

**実行後状態**: 新アーキテクチャ完全稼働、最適化完了

## 最終パッケージ構成 (15パッケージ)

### 現在 → 新構成

```
削除パッケージ (12個):
├── @esta-actions/tools-installer     → 削除 (新規: @esta-tools/installer)
├── @esta-core/esta-config           → 削除 (新規: @esta-config)
├── @esta-utils/config-loader        → 削除 (統合: @esta-config)
├── @esta-core/tools-config          → 削除 (分割統合: @esta-config + @esta-tools/installer)
├── @esta-utils/command-runner       → 削除 (新規: @esta-tools/command)
├── @esta-utils/get-platform         → 削除 (統合: @esta-runtime)
├── @esta-core/error-handler         → 削除 (新規: @esta-error/error-handler)
├── @esta-system/exit-status         → 削除 (新規: @esta-error/exit-code)
└── その他重複パッケージ 4個            → 削除

保持パッケージ (3個):
├── @shared/constants/               # 拡張して保持
├── @shared/types/                   # 拡張して保持
└── @agla-* パッケージ 6個             # そのまま保持

新規作成パッケージ (12個):
├── @esta-runtime/                   # 新規: ランタイム抽象化
├── @esta-error/error-handler/       # 新規: EstaError + ErrorResult
├── @esta-error/exit-code/           # 新規: システム終了コード管理
├── @esta-config/                    # 新規: 設定管理統合
├── @esta-validation/                # 新規: バリデーション統合
├── @esta-path-utils/                # 新規: パス操作統合
├── @esta-fs-utils/                  # 新規: ファイル操作統合
├── @esta-tools/installer/           # 新規: ツールインストーラー
├── @esta-tools/command/             # 新規: コマンド実行
├── @esta-cli/                       # 新規: CLI開発者向け統合
├── @esta-github-actions/            # 新規: GitHub Actions特化
├── @esta-actions/workflow-helpers/  # 新規: ワークフロー支援
└── @esta-actions/action-utils/      # 新規: アクション開発支援
```

### 最終構成

```
packages/
# 基盤レイヤー (3パッケージ)
├── @esta-runtime/                    # 新規: ランタイム抽象化
├── @shared/constants/                # 拡張: 共有定数
└── @shared/types/                    # 拡張: 共有型定義

# エラー処理レイヤー (2パッケージ)
├── @esta-error/error-handler/        # 新規: EstaError + ErrorResult
└── @esta-error/exit-code/            # 新規: システム終了コード管理

# 機能レイヤー (4パッケージ)
├── @esta-config/                     # 新規: 設定管理統合
├── @esta-validation/                 # 新規: バリデーション統合
├── @esta-path-utils/                 # 新規: パス操作統合
└── @esta-fs-utils/                   # 新規: ファイル操作統合

# アプリケーションレイヤー (2パッケージ)
├── @esta-tools/installer/            # 新規: ツールインストーラー
└── @esta-tools/command/              # 新規: コマンド実行

# 統合レイヤー (2パッケージ)
├── @esta-cli/                        # 新規: CLI開発者向け統合
└── @esta-github-actions/             # 新規: GitHub Actions特化

# 強化パッケージ (2パッケージ)
├── @esta-actions/workflow-helpers/   # 新規: ワークフロー支援
└── @esta-actions/action-utils/       # 新規: アクション開発支援
```

## 品質基準

各Phase完了時に以下の基準をクリアする必要があります：

### 必須チェック

```bash
# テスト通過
pnpm run test:develop
pnpm run test:integration  
pnpm run test:e2e

# 型チェック通過
pnpm run check:types

# コード品質チェック通過
pnpm run lint-all
pnpm run lint-all:types
pnpm run check:dprint

# ビルド成功
pnpm run build

# 循環依存なし
pnpm exec madge --circular packages
```

### Phase別追加チェック

```bash
# Phase 1: 基盤パッケージチェック
pnpm run test:develop --filter="@esta-runtime"
pnpm run test:develop --filter="@esta-error/*"

# Phase 2: 機能統合パッケージチェック
pnpm run test:develop --filter="@esta-config"
pnpm run test:develop --filter="@esta-validation"
pnpm run test:develop --filter="@esta-*-utils"

# Phase 3-4: アプリケーション機能チェック
pnpm run test:develop --filter="@esta-tools/*"
pnpm run test:develop --filter="@esta-actions/*"

# Phase 5: 統合パッケージチェック
pnpm run test:develop --filter="@esta-cli"
pnpm run test:develop --filter="@esta-github-actions"

# Phase 6: 包括的テストチェック
pnpm run test:integration
pnpm run test:e2e
pnpm run test:performance

# Phase 7: 最終品質監査
pnpm exec tsx scripts/quality-assurance/final-quality-audit.sh
```

### パフォーマンス基準

- **Phase 7目標**:
  - ビルド時間: 現在比20%改善
  - 実行時間: 主要操作の体感速度向上
  - バンドルサイズ: パッケージあたり10%削減
  - テストカバレッジ: 90%以上維持

## 成功指標

### 定量目標

- **パッケージ数**: 27個 → 15個 (44%削減)
- **重複コード**: 40-50%削減
- **ビルド時間**: 現在比20%改善 (Phase 7)
- **バンドルサイズ**: パッケージあたり10%削減 (Phase 7)
- **テストカバレッジ**: 90%以上維持

### 定性目標

- **統一エラーハンドリング**: EstaError + タプル型による一貫したパターン
- **ランタイム対応**: Node.js/Deno/Bun/GitHub Actions完全対応
- **型安全性**: 包括的なTypeScript型定義
- **保守性**: 明確な責任境界と理解しやすいアーキテクチャ
- **開発者体験**: 統合レイヤーによる使いやすいAPI
- **品質保証**: 自動化された包括的テスト・品質チェック体系

## Phase間の依存関係

```
Phase 1 (基盤) → Phase 2 (機能統合) → Phase 3 (アプリ統合)
                                        ↓
Phase 7 (最適化) ← Phase 6 (テスト) ← Phase 5 (統合) ← Phase 4 (強化)
```

**注意**: Phase 1-2は順次実行必須。Phase 3-4は並行実行可能。Phase 5-7は順次実行推奨。

## 参考情報

- **元ドキュメント**: `docs/restructure-plan/` - 詳細設計・分析資料
- **詳細設計**: `docs/.cc-kiro/restructure-plan/phase-*-detailed-design.md` - 技術詳細設計
- **現在の構成**: `packages/` - 既存パッケージ構成
- **共有リソース**: `shared/packages/` - 共有パッケージ
- **設定管理**: `base/configs/` - 共有設定ファイル

---

**注意**: Phase 1-2は順番に実行必須。Phase 3-4は並行可能。Phase 5以降は順次実行推奨。
