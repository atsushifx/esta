# 04. Implementation Plan & Final Integration

## 実装手順概要

このドキュメントは、リストラクチャリング計画の最終統合版として、段階的な実装手順を提供します。

## Phase 1: 基盤パッケージの統合 (Priority: Critical)

### 1.1 @esta-config パッケージの完成

- **現在のステータス**: 実装中
- **ターゲット**: `packages/@esta-core/esta-config/`
- **統合対象**:
  - `@esta-core/tools-config` の機能を統合
  - 設定の正規化とバリデーション機能
  - logLevel とパス正規化ユーティリティ

**実装アクション**:

```bash
# 1. 既存のtools-configから機能移行
cd packages/@esta-core/esta-config
pnpm run build
pnpm run test:develop

# 2. 型定義とエクスポートの整理
pnpm run check:types
pnpm run lint-all:types
```

### 1.2 @shared パッケージの統合

- **ターゲット**: `shared/packages/`
- **統合内容**:
  - `constants`: 全パッケージ共通の定数
  - `types`: 共有型定義
  - `configs`: 共有設定

## Phase 2: ユーティリティパッケージの再編成 (Priority: High)

### 2.1 @esta-utils統合パッケージ

- **新規作成**: `packages/@esta-utils/utils/`
- **統合対象**:
  - `config-loader`
  - `command-runner`
  - `get-platform`
  - 新規: file-utils, string-utils

### 2.2 @agla-utils の@esta-utilsへの移行

- **移行対象**: `ag-logger` → `@esta-utils/logger`
- **破壊的変更**: import パスの変更が必要

## Phase 3: アクション・システムパッケージの整理 (Priority: Medium)

### 3.1 @esta-actions の強化

- **tools-installer**: より汎用的なツールインストーラーとして拡張
- **新規**: workflow-helpers, action-utils

### 3.2 @esta-system の拡張

- **現在**: `exit-status`
- **追加予定**: environment-manager, process-manager

## 実装チェックリスト

### Pre-Implementation

- [ ] 現在のテストが全て通ることを確認
- [ ] 依存関係マップの作成
- [ ] Breaking changes の影響範囲調査

### Phase 1 実装

- [ ] esta-config パッケージの完成
  - [ ] normalizeConfig の統合
  - [ ] logLevel, pathNormalize の統合
  - [ ] テストカバレージ 90%以上
  - [ ] 型安全性の確保
- [ ] @shared パッケージ移行
  - [ ] constants の集約
  - [ ] types の集約
  - [ ] 既存パッケージでの import 更新

### Phase 2 実装

- [ ] @esta-utils/utils 統合パッケージ作成
  - [ ] 既存4パッケージの統合
  - [ ] 新規ユーティリティの追加
  - [ ] 統一されたAPIの設計
- [ ] @agla-utils から @esta-utils への移行
  - [ ] ag-logger の移行
  - [ ] 全ての import パス更新
  - [ ] 後方互換性の確保

### Phase 3 実装

- [ ] @esta-actions の拡張
- [ ] @esta-system の拡張
- [ ] E2E テストの更新

### Post-Implementation

- [ ] 全パッケージのビルド確認
- [ ] E2E テストスイートの実行
- [ ] パフォーマンステスト
- [ ] ドキュメント更新

## 品質保証

### 各フェーズ完了時の確認事項

```bash
# ビルド確認
pnpm run build

# 型チェック
pnpm run check:types

# リント確認
pnpm run lint-all:types

# テスト実行
pnpm run test:develop
pnpm run test:ci

# スペルチェック
pnpm run check:spells

# フォーマット確認
pnpm run check:dprint
```

### 継続的インテグレーション

- 各プルリクエストでの自動テスト
- 依存関係チェック
- パフォーマンス回帰テスト

## リスク管理

### 高リスク項目

1. **Breaking Changes**: 特に@agla-utilsの移行
   - 緩和策: 段階的移行とdeprecation期間の設定

2. **複雑な依存関係**: パッケージ間の循環依存
   - 緩和策: 依存関係グラフの事前分析

3. **テストカバレージ**: 統合時のテスト不足
   - 緩和策: 各フェーズでのテスト強化

### 緩和戦略

- **段階的実装**: フェーズ分けによる影響範囲の限定
- **ロールバック計画**: 各フェーズでのコミットポイント設定
- **並行開発**: 機能ブランチでの独立開発

## 成功指標

### 技術指標

- [ ] ビルド時間: 現在比20%短縮
- [ ] バンドルサイズ: 10%削減
- [ ] テストカバレージ: 90%以上維持
- [ ] 型安全性: strict モード完全対応

### 開発体験指標

- [ ] パッケージ検索時間の短縮
- [ ] import パスの簡素化
- [ ] 開発環境セットアップ時間の短縮

## Next Steps

1. **Phase 1 開始**: esta-config パッケージの完成
2. **並行作業**: @shared パッケージの準備
3. **チームレビュー**: 実装計画の最終確認
4. **実装開始**: 段階的な実装の開始

---

このプランに従って、系統的かつ安全にリストラクチャリングを実行します。各フェーズの完了時に、品質保証チェックを必ず実行してください。
