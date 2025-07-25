---
header:
  - src: mock-logger.requirement.md
  - "@(#)": MockLogger リファクタリング要件定義
title: MockLogger リファクタリング要件定義
description: ag-logger パッケージにおける MockLogger および E2eMockLogger のリファクタリング要件定義
version: 1.0.0
created: 2025-07-25
updated: 2025-07-25
authors:
  - atsushifx
changes:
  - 2025-07-25: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

`@agla-utils/ag-logger` パッケージにおける `MockLogger` および `E2eMockLogger` の構造改善を実施し、単一責務の原則に基づく責務分離と保守性向上を図る。

## 要件定義

### 機能要件

#### MockLogger の責務分離

- MockLogger はログ出力 API（info, warn, error 等）の提供に特化する
- ログ記録、検索、バッファ管理は専用の LogBufferManager に委譲する
- 外部 API インターフェースの後方互換性を維持する

#### LogBufferManager の新設

- ログレベルごとのバッファ保持機能を提供する
- 最大バッファサイズ制御と循環バッファ機能を実装する
- メッセージの検索、クリア、部分削除機能を提供する
- cleanup() メソッドによる明示的なバッファ破棄を実装する

#### E2eMockLogger の再設計

- testId をコンストラクタで受け取り内部保持する構造に変更する
- 各 testId に対して LogBufferManager を割り当てる設計とする
- startTest/endTest による状態管理を廃止する
- Map<testId, LogBufferManager> による内部バッファ管理を実装する

### 非機能要件

#### パフォーマンス要件

- 現行のログ出力パフォーマンスを維持または向上させる
- 並列テスト実行時のメモリ使用量を最適化する
- バッファアクセスのオーバーヘッドを最小化する

#### 可用性要件

- テスト実行時の安定性を確保する
- メモリリークを防止する機能を実装する
- 例外処理による堅牢性を確保する

#### 保守性要件

- 単一責務の原則に基づく明確な責務分離を実現する
- テスト容易性を向上させる
- コードの可読性と理解しやすさを向上させる

#### 拡張性要件

- 新しいログレベルの追加に対応可能な構造とする
- 追加のバッファ管理機能を実装しやすい設計とする
- プラグイン的な機能拡張に対応可能な構造とする

### 技術的制約

#### 設計原則

- ag-logger 全体の「外部 API はクラスベース、内部構造は関数型」設計方針を継続する
- TypeScript の型安全性を最大限活用する
- ESLint、Prettier等の既存コード品質ツールに準拠する

#### 開発手法

- t-wada式BDDによる開発を実施する
- Describe/It を使用したBDD形式のテスト記述を行う
- Red → Green → Refactoring サイクルによるTDD開発を実践する

#### 互換性

- 既存テストコードへの影響を最小化する
- 段階的な移行が可能な構造とする
- 廃止予定機能には明確な非推奨警告を実装する

### ユーザー要件

#### テスト開発者要件

- 簡潔で直感的なロガー初期化を実現する
- testId の明示的指定を不要にする
- afterEach での明示的なクリーンアップを可能にする

#### API 使用者要件

- 従来の MockLogger API との互換性を維持する
- エラーハンドリングの改善により使いやすさを向上させる
- ドキュメント化された明確な使用パターンを提供する

### 品質要件

#### テスト要件

- MockLogger の統合テスト実装
- LogBufferManager のユニットテスト実装
- E2eMockLogger の隔離性テスト実装
- メモリリーク防止機能のテスト実装

#### コード品質要件

- 関数型プログラミングの原則に基づく内部実装
- 純粋関数による処理の実装
- 副作用の明確な管理と分離

### 実装フェーズ

#### Phase 1: LogBufferManager の新設

- ログバッファ管理機能の実装
- 基本的な記録・検索・削除機能の実装
- ユニットテストの作成

#### Phase 2: MockLogger の委譲構造化

- LogBufferManager への責務移行
- 外部 API の互換性維持
- 統合テストの実装

#### Phase 3: E2eMockLogger の再構築

- testId ベースの新構造実装
- メモリ管理機能の実装
- 隔離性テストの実装

### 受入条件

- 既存テストがすべて成功すること
- 新規テストがすべて成功すること
- メモリリークが発生しないこと
- 型チェックとリンターがエラーなく成功すること
- 外部 API の後方互換性が維持されること
