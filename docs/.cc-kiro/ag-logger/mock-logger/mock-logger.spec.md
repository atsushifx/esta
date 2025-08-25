---
header:
  - src: mock-logger.spec.md
  - "@(#)": MockLogger リファクタリング仕様書
title: MockLogger リファクタリング仕様書
description: ag-logger パッケージにおける MockLogger および E2eMockLogger のリファクタリング仕様定義
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

本仕様書は `@agla-utils/ag-logger` パッケージにおける MockLogger および E2eMockLogger のリファクタリング仕様を定義する。単一責務の原則に基づく責務分離により、保守性と拡張性を向上させる構造を実現する。

## アーキテクチャ仕様

### システム構成

リファクタリング後の構成は以下の 3 つの主要コンポーネントで構成される：

- LogBufferManager: ログバッファ管理専用クラス
- MockLogger: ログ出力 API 提供クラス（リファクタリング対象）
- E2eMockLogger: 並列テスト対応ロガークラス（再設計対象）

### 設計原則

- オブジェクト指向プログラミング（OOP）による明確なクラス設計
- 単一責務の原則による明確な責務分離
- 型安全性を最大限活用した TypeScript 実装

## LogBufferManager 仕様

### クラス概要

ログメッセージのバッファ管理を専門に行うクラス。ログレベルごとのメッセージ保存、検索、削除機能を提供する。

### インターフェース仕様

```typescript
class LogBufferManager {
  constructor();

  // メッセージ操作
  addMessage(level: AgTLogLevel, message: string): void;
  getMessages(level: AgTLogLevel): readonly string[];
  getAllMessages(): Record<AgTLogLevel, readonly string[]>;

  // バッファ管理
  clear(level?: AgTLogLevel): void;
  getMessageCount(level: AgTLogLevel): number;

  // 検索機能
  findMessages(pattern: string | RegExp, level?: AgTLogLevel): string[];
  hasMessage(pattern: string | RegExp, level?: AgTLogLevel): boolean;

  // リソース管理
  cleanup(): void;
}
```

### 機能仕様

#### バッファ管理機能

- 各ログレベル（OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE）ごとの独立したバッファ
- 固定バッファサイズ（1000件）による メモリ使用量制限
- バッファオーバーフロー時の ResourceError による問題検出

#### メッセージ操作機能

- 型安全なログレベル指定によるメッセージ追加
- 読み取り専用配列による外部からの安全なアクセス
- レベル指定または全レベル対象のメッセージ取得

#### 検索機能

- 文字列または正規表現によるメッセージ検索
- 特定レベルまたは全レベル対象の検索
- 存在確認機能による効率的な条件判定

## MockLogger 仕様

### クラス概要

ログ出力 API の提供に特化したクラス。バッファ管理は LogBufferManager に委譲し、外部 API の互換性を維持する。

### インターフェース仕様

```typescript
class MockLogger {
  constructor();

  // ログ出力 API（既存互換）
  fatal(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  trace(message: string): void;

  // バッファアクセス API（既存互換）
  getMessages(level: AgTLogLevel): readonly string[];
  getAllMessages(): Record<AgTLogLevel, readonly string[]>;
  clearMessages(level?: AgTLogLevel): void;

  // 検索 API（既存互換）
  findMessages(pattern: string | RegExp, level?: AgTLogLevel): string[];
  hasMessage(pattern: string | RegExp, level?: AgTLogLevel): boolean;

  // リソース管理
  cleanup(): void;
}
```

### 機能仕様

#### ログ出力機能

- 各ログレベルに対応したメソッド提供
- 内部的に LogBufferManager への委譲
- 既存 API との完全な後方互換性

#### バッファアクセス機能

- LogBufferManager の機能をそのまま公開
- 読み取り専用配列による安全なアクセス
- 既存のテストコードとの互換性維持

## E2eMockLogger 仕様

### クラス概要

testId ベースの構造に再設計された並列テスト対応ログ管理クラス。各テストに専用の LogBufferManager を割り当て、明示的なクリーンアップを提供する。

### インターフェース仕様

```typescript
class E2eMockLogger {
  constructor(testId: string);

  // ログ出力 API
  fatal(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  trace(message: string): void;

  // メッセージアクセス API
  getMessages(level: AgTLogLevel): readonly string[];
  getAllMessages(): Record<AgTLogLevel, readonly string[]>;
  clearMessages(level?: AgTLogLevel): void;

  // 検索 API
  findMessages(pattern: string | RegExp, level?: AgTLogLevel): string[];
  hasMessage(pattern: string | RegExp, level?: AgTLogLevel): boolean;

  // テスト管理 API
  getTestId(): string;
  cleanup(): void;

  // 静的メソッド
  static getAllActiveTestIds(): readonly string[];
  static cleanupAll(): void;
  static getActiveTestCount(): number;
}
```

### 機能仕様

#### テスト分離機能

- testId をコンストラクタで直接受け取り内部保持
- 各テストに専用の LogBufferManager インスタンス割り当て
- 静的 Map<testId, LogBufferManager> による内部管理

#### ライフサイクル管理

- コンストラクタでバッファの自動生成・登録
- cleanup() による明示的なバッファ破棄
- 静的メソッドによる全テストの一括管理

#### API 簡素化

- startTest/endTest による状態管理の廃止
- コンストラクタでの testId 直接指定によるシンプルな API
- beforeEach/afterEach パターンでの使用を想定

## 外部 API 互換性仕様

### 後方互換性保証

現行の MockLogger および E2eMockLogger の外部 API は完全に維持される。

### 移行仕様

#### 段階的移行サポート

- 既存コードは変更なしで動作継続
- 新機能を段階的に採用可能
- 非推奨機能には警告メッセージ表示

#### 非推奨 API 仕様

- E2eMockLogger の startTest/endTest メソッド
- 非推奨警告メッセージの表示
- 次のメジャーバージョンで削除予定

## パフォーマンス仕様

### 実行性能要件

- 現行実装と同等以上のログ出力性能
- バッファアクセスのオーバーヘッド最小化
- 並列テスト実行時の性能劣化防止

### メモリ使用量要件

- LogBufferManager による効率的なメモリ管理
- 循環バッファによるメモリ使用量制限
- 明示的クリーンアップによるメモリリーク防止

## エラーハンドリング仕様

### 例外処理方針

- 型安全な引数検証による事前エラー防止
- 明確なエラーメッセージによる問題特定支援
- 堅牢な例外処理による安定性確保

### エラー分類

- ValidationError: 引数の型や値の検証エラー
- StateError: 不正な状態でのメソッド呼び出し
- ResourceError: メモリ不足等のリソース関連エラー

## テスト仕様

### テスト分類

- MockLogger: 統合テストによる外部 API 検証
- LogBufferManager: ユニットテストによる詳細機能検証
- E2eMockLogger: 並列実行での隔離性テスト

### テスト観点

- 機能正常性: 各機能の期待動作確認
- 性能: 現行実装との性能比較
- 互換性: 既存テストコードの動作確認
- メモリ安全性: リークやオーバーフローの防止確認
