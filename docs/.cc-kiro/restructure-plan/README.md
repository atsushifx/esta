# ESTA System Restructuring - /kiro Execution Guide

# /kiro実行用 ESTAシステムリストラクチャリング計画

## 概要

ESTAモノレポの大規模リストラクチャリングを5つのPhaseに分けて実行します。各Phaseは独立して実行可能で、/kiroコマンドで段階的に実装できます。

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
/kiro "Execute Phase 3 according to docs/.cc-kiro/restructure-plan/phase3-application.md"

# Phase 4: 統合レイヤー
/kiro "Execute Phase 4 according to docs/.cc-kiro/restructure-plan/phase4-unified.md"

# Phase 5: クリーンアップ
/kiro "Execute Phase 5 according to docs/.cc-kiro/restructure-plan/phase5-cleanup.md"
```

## ドキュメント構成

### 実行用ドキュメント

- **README.md** (このファイル) - 実行ガイド・目次
- **phase1-foundation.md** - Phase 1: 基盤パッケージ作成
- **phase2-integration.md** - Phase 2: 機能統合パッケージ作成
- **phase3-application.md** - Phase 3: アプリケーション層作成
- **phase4-unified.md** - Phase 4: 統合パッケージ作成
- **phase5-cleanup.md** - Phase 5: 旧パッケージクリーンアップ

### 参考ドキュメント

- **architecture-overview.md** - 新アーキテクチャの全体像
- **quality-standards.md** - 品質基準・テスト要件
- **migration-checklist.md** - 移行チェックリスト

## Phase概要

### Phase 1: 基盤構築 (Week 1-2)

**目標**: 新アーキテクチャの基盤となるパッケージを作成

**成果物**:

- `@esta-error-result` - Result<T,E>統一エラーハンドリング
- `@esta-runtime` - ランタイム抽象化(Node.js/Deno/Bun/GitHub Actions)
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

### Phase 3: アプリケーション統合 (Week 5-6)

**目標**: 高レベルアプリケーション機能を統合

**成果物**:

- `@esta-tools/installer` - 統合ツールインストーラー
- `@esta-tools/command` - 統合コマンド実行

**実行後状態**: アプリケーション層の機能が統合・最適化

### Phase 4: 統合レイヤー (Week 7)

**目標**: エンドユーザー向け統合パッケージを作成

**成果物**:

- `@esta-cli` - CLI開発者向け完全統合パッケージ
- `@esta-github-actions` - GitHub Actions向け特化パッケージ

**実行後状態**: 開発者が利用する統合インターフェースが完成

### Phase 5: クリーンアップ (Week 8)

**目標**: 旧パッケージの廃止と最終整理

**成果物**:

- 旧パッケージの段階廃止
- 依存関係の整理
- ドキュメント更新

**実行後状態**: リストラクチャリング完了、27→16パッケージに削減

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

### パフォーマンス基準

- ビルド時間: 現在の90%以下
- テスト実行時間: 現在の90%以下
- バンドルサイズ: パッケージあたり20%削減

## トラブルシューティング

### Phase実行が失敗した場合

1. **品質チェック実行**: `pnpm run test:develop`でエラー箇所特定
2. **依存関係確認**: `pnpm list`で依存関係の状態確認
3. **ロールバック**: `git reset --hard HEAD~1`で前の状態に戻す
4. **再実行**: 問題修正後に再度/kiroコマンド実行

### 依存関係エラーの場合

```bash
# パッケージ再インストール
pnpm install

# キャッシュクリア
pnpm store prune

# ビルドキャッシュクリア
rm -rf packages/*/lib packages/*/module packages/*/.cache
```

## 成功指標

### 定量目標

- **パッケージ数**: 27個 → 16個 (42%削減)
- **重複コード**: 40-50%削減
- **ビルド時間**: 現在の90%以下
- **テスト実行時間**: 現在の90%以下

### 定性目標

- **統一API**: Result<T,E>による一貫したエラーハンドリング
- **ランタイム対応**: Node.js/Deno/Bun/GitHub Actions完全対応
- **型安全性**: 包括的なTypeScript型定義
- **保守性**: 明確な責任境界と理解しやすいアーキテクチャ

## 参考情報

- **元ドキュメント**: `docs/restructure-plan/` - 詳細設計・分析資料
- **現在の構成**: `packages/` - 既存パッケージ構成
- **共有リソース**: `shared/packages/` - 共有パッケージ
- **設定管理**: `base/configs/` - 共有設定ファイル

---

**注意**: 各Phaseは前のPhaseの完了を前提としています。Phase 1から順番に実行してください。
