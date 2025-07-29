---
header:
- src: ag-logger-refactor.spec.md
- @(#): AgLogger リファクタリング仕様書
title: AgLogger リファクタリング仕様書
description: AgLoggerアーキテクチャの責任分担を明確化し、SOLID原則に基づいた設計にリファクタリングする仕様書
version: 1.0.0
created: 2025-07-27
updated: 2025-07-29
authors:
  - atsushifx
changes:
  - 2025-07-27: 初回作成（SOLID原則に基づく責任分担設計）
  - 2025-07-29: Phase1-4設計を反映（4段階のリファクタリング計画）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# AgLogger リファクタリング仕様書

## 概要

AgLoggerアーキテクチャの責任分担を明確化し、SOLID原則に基づいた設計にリファクタリングする。
現在のAgLoggerManagerインスタンス依存を削除し、設定管理を専用クラスに委譲することで、保守性と拡張性を向上させる。

## 現在の問題点

### 1. 責任の混在

- AgLoggerがAgLoggerManagerのインスタンスを保持
- 設定管理の責任がAgLoggerとAgLoggerManagerで分散
- ログ出力処理と設定管理が密結合

### 2. パフォーマンスの問題

- 毎回のログ出力時に静的アクセス`AgLoggerManager.getManager().getXxx()`が発生
- 不要なインスタンス参照によるメモリ使用量増加

### 3. テストの困難さ

- 設定とログ出力処理が密結合でテストが複雑
- モック化が困難

## 4段階リファクタリング設計

### 設計原則

- **Single Responsibility Principle**: 各クラスが単一の責任を持つ
- **Dependency Inversion**: 具象クラスではなく抽象に依存
- **Composition over Inheritance**: 継承よりも委譲を優先
- **既存API互換性**: 破壊的変更なしでリファクタリング実行

### Phase 1: AgLoggerConfig作成（内部クラス）

**AgLoggerConfig**の責任:

- ログレベル別ロガー関数の管理
- デフォルトロガー関数の管理
- フォーマッター管理
- ログレベル制御
- Verbose制御
- 設定値の検証と出力制御判定

### Phase 2: AgLogger内部リファクタリング

**AgLogger**の内部実装変更:

- AgLoggerConfigインスタンスの組み込み
- 全ログメソッドがAgLoggerConfig経由で動作
- AgLoggerManagerインスタンス依存の完全削除
- `setAgLoggerOptions()`による統一された設定適用
- 既存APIの完全な互換性維持

### Phase 3: AgLogger APIリストラクチャ

**API責任の明確化**:

- `createLogger(options?)`: 設定付きインスタンス作成専用（既存のgetLogger(options?)から変更）
- `getLogger()`: インスタンス取得専用（パラメータなし、新規追加）
- `setLoggerOptions(options)`: 設定適用専用
- `getVerbose()` / `setVerbose(value)`: 責任分離
- 既存の`getLogger(options?)`は deprecation warning 付きで`createLogger(options?)`に移行推奨

### Phase 4: AgLoggerManager簡素化

**AgLoggerManager**の新しい責任:

- シングルトンAgLoggerインスタンスの保持・管理
- `createLogger(options)`: 初期設定付きロガー作成
- `getLogger()`: 内部保持インスタンス返却
- 設定適用の仲介役（低レベルAPI活用）
- 既存APIの互換性維持

## 段階的リファクタリングの利点

### Phase 1-2: 内部アーキテクチャ改善

- AgLoggerManagerインスタンス依存削除によるパフォーマンス向上
- 設定管理の一元化による保守性向上
- 既存APIの完全互換性維持

### Phase 3-4: API設計改善

- Single Responsibility Principleに基づく明確な責任分離
- 新旧APIの段階的移行による破壊的変更回避
- 将来の拡張性を考慮したクリーンな設計

## API仕様

### 既存APIの完全互換性維持

**全フェーズ共通**:

- 全ログメソッド（fatal, error, warn, info, debug, trace, log, verbose）の動作維持
- AgLoggerManager.getManager()の仕様維持
- 設定メソッド（setLogLevel, setVerbose）の仕様維持

**API変更（Phase 3）**:

- 既存の`AgLogger.getLogger(options?)`は`createLogger(options?)`にリネーム
- 新しい`getLogger()`はインスタンス取得専用（パラメータなし）
- 既存APIはdeprecation warning付きで互換性維持

### 新しいAPI（段階的追加）

**Phase 2で追加**:

- `setAgLoggerOptions(options)`: 統一された設定適用メソッド
- `getCurrentSettings()`: 現在の設定状態取得メソッド

**Phase 3で追加/変更**:

- `createLogger(options?)`: 設定付きインスタンス作成専用（既存getLogger(options?)をリネーム）
- `getLogger()`: インスタンス取得専用（パラメータなし、新規追加）
- `setLoggerOptions(options)`: 設定適用専用
- `getVerbose()`: Verbose状態取得専用
- 既存`getLogger(options?)`はdeprecated扱いで`createLogger(options?)`への移行推奨

**Phase 4で追加**:

- `AgLoggerManager.createLogger(options?)`: 初期設定付きロガー作成
- `AgLoggerManager.getLogger()`: 内部保持インスタンス返却

## 互換性保証

### 破壊的変更なし

- 既存の`AgLogger.getLogger()`API維持
- 既存の`AgLoggerManager.getManager()`API維持
- 既存のログメソッド（`fatal`, `error`, `warn`等）API維持

## 4段階移行戦略

### Phase 1: AgLoggerConfig作成

**目標**: 内部設定管理クラスの実装

- AgLoggerConfigクラスの実装
- 設定管理・検証・出力制御判定の全機能
- 包括的な単体テストの作成
- t-wada式TDDによるexpectレベル実装

### Phase 2: AgLogger内部リファクタリング

**目標**: 既存機能の内部アーキテクチャ移行

- AgLoggerConfigの組み込み
- 全メソッドのAgLoggerConfig経由への変更
- AgLoggerManagerインスタンス依存の完全削除
- `setAgLoggerOptions()`による統一設定適用
- 既存APIの完全互換性維持

### Phase 3: AgLogger APIリストラクチャ

**目標**: Single Responsibility Principleに基づくAPI改善

- `createLogger()` / `getLogger()`の責任分離
- `setVerbose()` / `getVerbose()`の責任分離
- `setLoggerOptions()`の責任明確化
- 既存APIはdeprecation warning付きで維持
- 新旧API混在での動作保証

### Phase 4: AgLoggerManager簡素化

**目標**: 設定管理の仲介役としてのManager再構成

- シングルトンAgLoggerインスタンスの内部保持
- `createLogger()`メソッドによる初期設定付きロガー作成
- 低レベルAPIの内部実装化
- 設定適用の仲介機能実装
- 既存APIの完全互換性維持

## テスト戦略

### t-wada式TDDアプローチ

**各フェーズ共通**:

- expect文レベルでのRed-Green-Refactorサイクル
- 1小タスク = 1つのexpect文として細分化
- テストファーストによる実装進行

### テスト範囲

**継続的検証**:

- 全既存テストが全フェーズで通過し続けること
- 新機能のテストカバレッジ100%維持
- 既存API互換性の網羅的テスト
- E2Eテストによる統合動作確認

**品質保証**:

- パフォーマンス改善の検証
- メモリ使用量削減の確認
- エラーハンドリングの網羅的テスト
- 境界値テストによる安定性確保

## 品質基準

### 各フェーズ共通成功基準

- [ ] 全既存テストが通過し続ける
- [ ] 新機能のテストカバレッジ100%
- [ ] パフォーマンス劣化なし
- [ ] 既存APIの完全互換性
- [ ] TypeScript型安全性の維持・強化

### フェーズ別追加基準

**Phase 2完了時**:

- [ ] AgLoggerManagerインスタンス依存完全削除
- [ ] メモリ使用量削減の確認
- [ ] ログ出力パフォーマンス維持

**Phase 3完了時**:

- [ ] 新旧API混在動作の確認
- [ ] deprecation警告の適切な表示
- [ ] API責任分離の完了

**Phase 4完了時**:

- [ ] AgLoggerManager簡素化完了
- [ ] 設定適用仲介機能の正常動作
- [ ] 低レベルAPIの適切な内部化

### 品質ゲート

**各フェーズ完了時**:

- [ ] `pnpm run test:develop` - 全単体テスト通過
- [ ] `pnpm run test:ci` - 全統合テスト通過
- [ ] `pnpm run test:e2e` - 全E2Eテスト通過
- [ ] `pnpm run lint:all` - コード品質チェック通過
- [ ] `pnpm run check:types` - 型安全性チェック通過

## 期待効果

### 段階的改善による利点

**Phase 1-2: 内部アーキテクチャ改善**

- AgLoggerManagerインスタンス依存削除によるパフォーマンス向上
- 設定管理の一元化による保守性向上
- メモリ使用量の最適化
- テスト容易性の大幅向上

**Phase 3-4: API設計改善**

- Single Responsibility Principleによる責任明確化
- 新機能追加の簡易化
- API予測可能性の向上
- 将来の拡張性確保

### 互換性保証による利点

**破壊的変更回避**:

- 既存コードへの影響なし
- 段階的移行による安全性
- deprecation warningによる適切な移行誘導
- 新旧API混在での動作保証

### 長期的メリット

**保守性・拡張性**:

- 新ログレベル追加の容易性
- カスタムフォーマッター実装の簡素化
- プラグインアーキテクチャの強化
- TypeScript型安全性の最大化
