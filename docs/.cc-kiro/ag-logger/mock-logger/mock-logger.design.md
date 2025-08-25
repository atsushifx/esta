---
header:
  - src: mock-logger.design.md
  - "@(#)": MockLogger リファクタリング詳細設計書
title: MockLogger リファクタリング詳細設計書
description: ag-logger パッケージにおける MockLogger および E2eMockLogger のリファクタリング詳細設計
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

本詳細設計書は MockLogger リファクタリングの実装レベル設計を定義する。オブジェクト指向プログラミング（OOP）による明確な責務分離と、直感的な状態管理を重視した設計を採用する。

## 全体アーキテクチャ設計

### ディレクトリ構造

```
src/
├── core/
│   └── LogBufferManager.ts          # バッファ管理コアクラス
├── plugins/logger/
│   ├── MockLogger.ts                # リファクタリング後のMockLogger
│   ├── E2eMockLogger.ts             # 再設計されたE2eMockLogger
│   └── IntegrationMockLogger.ts     # 既存（変更なし）
├── utils/
│   └── validationUtils.ts           # 検証ユーティリティ
├── types/
│   └── mockLogger.types.ts          # 型定義とエラークラス
└── shared/constants/
    └── errorMessages.ts             # エラーメッセージ定数テーブル
```

### 依存関係設計

```
MockLogger → LogBufferManager → validationUtils → errorMessages
    ↓                                                     ↑
E2eMockLogger ──────────────────────────────────────────┘
```

## LogBufferManager 詳細設計

### クラス設計（外部非公開）

```typescript
class LogBufferManager {
  private static readonly MAX_BUFFER_SIZE = 1000;
  private readonly buffers = new Map<AgTLogLevel, string[]>();

  constructor() {
    this.initializeBuffers();
  }

  // バッファ初期化
  private initializeBuffers(): void {
    const levels: AgTLogLevel[] = [0, 1, 2, 3, 4, 5, 6];
    levels.forEach((level) => {
      this.buffers.set(level, []);
    });
  }

  // メッセージ追加
  addMessage(level: AgTLogLevel, message: string): void {
    const buffer = this.buffers.get(level);
    if (!buffer) {
      throw new MockLoggerValidationError(
        MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL,
        {
          level,
          validLevels: Object.keys(AG_LOGLEVEL),
          validValues: Object.values(AG_LOGLEVEL),
        },
      );
    }

    // バッファオーバーフローチェック
    if (buffer.length >= LogBufferManager.MAX_BUFFER_SIZE) {
      throw new MockLoggerResourceError(
        MOCK_LOGGER_ERROR_MESSAGES.RESOURCE.BUFFER_OVERFLOW,
        {
          level,
          currentSize: buffer.length,
          maxSize: LogBufferManager.MAX_BUFFER_SIZE,
          message: message.substring(0, 100), // 最初の100文字のみ
        },
      );
    }

    buffer.push(message);
  }

  // メッセージ取得
  getMessages(level: AgTLogLevel): readonly string[] {
    const buffer = this.buffers.get(level);
    if (!buffer) {
      throw new MockLoggerValidationError(
        MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL,
        {
          level,
          validLevels: Object.keys(AG_LOGLEVEL),
          validValues: Object.values(AG_LOGLEVEL),
        },
      );
    }
    return [...buffer]; // 防御的コピー
  }

  // 全メッセージ取得
  getAllMessages(): Record<AgTLogLevel, readonly string[]> {
    const result = {} as Record<AgTLogLevel, readonly string[]>;
    this.buffers.forEach((messages, level) => {
      result[level] = [...messages]; // 防御的コピー
    });
    return result;
  }

  // メッセージ検索
  findMessages(pattern: string | RegExp, level?: AgTLogLevel): string[] {
    const matcher = this.createMatcher(pattern);

    if (level !== undefined) {
      const buffer = this.buffers.get(level);
      return buffer ? buffer.filter(matcher) : [];
    }

    // 全レベル検索
    const results: string[] = [];
    this.buffers.forEach((messages) => {
      results.push(...messages.filter(matcher));
    });
    return results;
  }

  // メッセージ存在確認
  hasMessage(pattern: string | RegExp, level?: AgTLogLevel): boolean {
    const matcher = this.createMatcher(pattern);

    if (level !== undefined) {
      const buffer = this.buffers.get(level);
      return buffer ? buffer.some(matcher) : false;
    }

    // 全レベル検索
    for (const messages of this.buffers.values()) {
      if (messages.some(matcher)) {
        return true;
      }
    }
    return false;
  }

  // バッファクリア
  clear(level?: AgTLogLevel): void {
    if (level !== undefined) {
      const buffer = this.buffers.get(level);
      if (buffer) {
        buffer.length = 0; // 配列クリア
      }
    } else {
      // 全レベルクリア
      this.buffers.forEach((buffer) => {
        buffer.length = 0;
      });
    }
  }

  // メッセージ数取得
  getMessageCount(level: AgTLogLevel): number {
    const buffer = this.buffers.get(level);
    return buffer ? buffer.length : 0;
  }

  // リソース解放
  cleanup(): void {
    this.buffers.clear();
  }

  // ヘルパーメソッド
  private createMatcher(pattern: string | RegExp): (msg: string) => boolean {
    return typeof pattern === 'string'
      ? (msg: string) => msg.includes(pattern)
      : (msg: string) => pattern.test(msg);
  }
}
```

## MockLogger 詳細設計

### クラス設計

```typescript
class MockLogger {
  private readonly bufferManager: LogBufferManager;

  constructor() {
    this.bufferManager = new LogBufferManager();
  }

  // ログ出力メソッド
  fatal(message: string): void {
    this.bufferManager.addMessage(AG_LOGLEVEL.FATAL, message);
  }

  error(message: string): void {
    this.bufferManager.addMessage(AG_LOGLEVEL.ERROR, message);
  }

  warn(message: string): void {
    this.bufferManager.addMessage(AG_LOGLEVEL.WARN, message);
  }

  info(message: string): void {
    this.bufferManager.addMessage(AG_LOGLEVEL.INFO, message);
  }

  debug(message: string): void {
    this.bufferManager.addMessage(AG_LOGLEVEL.DEBUG, message);
  }

  trace(message: string): void {
    this.bufferManager.addMessage(AG_LOGLEVEL.TRACE, message);
  }

  // メッセージアクセスメソッド（既存API互換）
  getMessages(level: AgTLogLevel): readonly string[] {
    return this.bufferManager.getMessages(level);
  }

  getAllMessages(): Record<AgTLogLevel, readonly string[]> {
    return this.bufferManager.getAllMessages();
  }

  // 検索メソッド（既存API互換）
  findMessages(pattern: string | RegExp, level?: AgTLogLevel): string[] {
    return this.bufferManager.findMessages(pattern, level);
  }

  hasMessage(pattern: string | RegExp, level?: AgTLogLevel): boolean {
    return this.bufferManager.hasMessage(pattern, level);
  }

  // バッファ管理メソッド（既存API互換）
  clearMessages(level?: AgTLogLevel): void {
    this.bufferManager.clear(level);
  }

  getMessageCount(level: AgTLogLevel): number {
    return this.bufferManager.getMessageCount(level);
  }

  // リソース管理
  cleanup(): void {
    this.bufferManager.cleanup();
  }
}
```

## E2eMockLogger 詳細設計

### クラス設計

```typescript
class E2eMockLogger {
  private static readonly testBuffers = new Map<string, LogBufferManager>();
  private readonly testId: string;

  constructor(testId: string) {
    this.testId = this.validateTestId(testId);
    this.initializeTestBuffer();
  }

  // testId 検証
  private validateTestId(testId: string): string {
    if (typeof testId !== 'string' || testId.trim() === '') {
      throw new MockLoggerValidationError(
        MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_TESTID_TYPE,
        { testId, type: typeof testId },
      );
    }

    if (testId.length > 255) {
      throw new MockLoggerValidationError(
        MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_TESTID_LENGTH,
        { testId: testId.substring(0, 50) + '...', length: testId.length, maxLength: 255 },
      );
    }

    return testId.trim();
  }

  // テスト用バッファ初期化
  private initializeTestBuffer(): void {
    if (!E2eMockLogger.testBuffers.has(this.testId)) {
      E2eMockLogger.testBuffers.set(this.testId, new LogBufferManager());
    }
  }

  // バッファマネージャー取得
  private getBufferManager(): LogBufferManager {
    const manager = E2eMockLogger.testBuffers.get(this.testId);
    if (!manager) {
      throw new MockLoggerStateError(
        MOCK_LOGGER_ERROR_MESSAGES.STATE.BUFFER_NOT_FOUND,
        {
          testId: this.testId,
          activeTestIds: [...E2eMockLogger.testBuffers.keys()],
          activeTestCount: E2eMockLogger.testBuffers.size,
        },
      );
    }
    return manager;
  }

  // ログ出力メソッド
  fatal(message: string): void {
    this.getBufferManager().addMessage(AG_LOGLEVEL.FATAL, message);
  }

  error(message: string): void {
    this.getBufferManager().addMessage(AG_LOGLEVEL.ERROR, message);
  }

  warn(message: string): void {
    this.getBufferManager().addMessage(AG_LOGLEVEL.WARN, message);
  }

  info(message: string): void {
    this.getBufferManager().addMessage(AG_LOGLEVEL.INFO, message);
  }

  debug(message: string): void {
    this.getBufferManager().addMessage(AG_LOGLEVEL.DEBUG, message);
  }

  trace(message: string): void {
    this.getBufferManager().addMessage(AG_LOGLEVEL.TRACE, message);
  }

  // メッセージアクセスメソッド
  getMessages(level: AgTLogLevel): readonly string[] {
    return this.getBufferManager().getMessages(level);
  }

  getAllMessages(): Record<AgTLogLevel, readonly string[]> {
    return this.getBufferManager().getAllMessages();
  }

  // 検索メソッド
  findMessages(pattern: string | RegExp, level?: AgTLogLevel): string[] {
    return this.getBufferManager().findMessages(pattern, level);
  }

  hasMessage(pattern: string | RegExp, level?: AgTLogLevel): boolean {
    return this.getBufferManager().hasMessage(pattern, level);
  }

  // バッファ管理メソッド
  clearMessages(level?: AgTLogLevel): void {
    this.getBufferManager().clear(level);
  }

  getMessageCount(level: AgTLogLevel): number {
    return this.getBufferManager().getMessageCount(level);
  }

  // テスト管理メソッド
  getTestId(): string {
    return this.testId;
  }

  // リソース管理（個別テスト）
  cleanup(): void {
    const manager = E2eMockLogger.testBuffers.get(this.testId);
    if (manager) {
      manager.cleanup();
      E2eMockLogger.testBuffers.delete(this.testId);
    }
  }

  // 静的メソッド：全テスト管理
  static getAllActiveTestIds(): readonly string[] {
    return [...E2eMockLogger.testBuffers.keys()];
  }

  static cleanupAll(): void {
    E2eMockLogger.testBuffers.forEach((manager) => manager.cleanup());
    E2eMockLogger.testBuffers.clear();
  }

  static getActiveTestCount(): number {
    return E2eMockLogger.testBuffers.size;
  }
}
```

## エラーメッセージ定数設計

### shared/constants/errorMessages.ts

```typescript
// MockLogger用エラーメッセージ定数
export const MOCK_LOGGER_ERROR_MESSAGES = {
  // 検証エラー
  VALIDATION: {
    INVALID_LOG_LEVEL: 'Invalid log level specified',
    INVALID_MESSAGE_TYPE: 'Message must be a string',
    INVALID_TESTID_TYPE: 'testId must be a non-empty string',
    INVALID_TESTID_LENGTH: 'testId must be 255 characters or less',
  },

  // 状態エラー
  STATE: {
    BUFFER_NOT_FOUND: 'Buffer not found for testId. The logger may have been cleaned up or not properly initialized.',
  },

  // リソースエラー
  RESOURCE: {
    BUFFER_OVERFLOW:
      'Buffer overflow: Maximum buffer size exceeded. This may indicate a test design issue with excessive logging.',
  },
} as const;

// エラーメッセージ取得ヘルパー
export const getErrorMessage = (category: keyof typeof MOCK_LOGGER_ERROR_MESSAGES, key: string): string => {
  const messages = MOCK_LOGGER_ERROR_MESSAGES[category];
  return (messages as Record<string, string>)[key] || 'Unknown error';
};
```

## ユーティリティ設計

### validationUtils.ts

```typescript
// ログレベル検証
export const validateLogLevel = (level: unknown): AgTLogLevel => {
  if (typeof level !== 'number' || !Number.isInteger(level)) {
    throw new ValidationError('Log level must be an integer');
  }

  if (level < 0 || level > 6) {
    throw new ValidationError('Log level must be between 0 and 6');
  }

  return level as AgTLogLevel;
};

// メッセージ検証
export const validateMessage = (message: unknown): string => {
  if (typeof message !== 'string') {
    throw new ValidationError('Message must be a string');
  }

  return message;
};

// testId 検証
export const validateTestId = (testId: unknown): string => {
  if (typeof testId !== 'string' || testId.trim() === '') {
    throw new ValidationError('testId must be a non-empty string');
  }

  if (testId.length > 255) {
    throw new ValidationError('testId must be 255 characters or less');
  }

  return testId.trim();
};
```

## 型定義設計

### mockLogger.types.ts

```typescript
// ベースエラークラス
export abstract class AglaError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // スタックトレースの調整
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // エラー情報の文字列化
  toString(): string {
    const contextStr = this.context
      ? ` [${JSON.stringify(this.context)}]`
      : '';
    return `${this.name} (${this.code}): ${this.message}${contextStr}`;
  }
}

// 検証エラー：入力値や引数の問題
export class MockLoggerValidationError extends AglaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

// 状態エラー：オブジェクトの状態に関する問題
export class MockLoggerStateError extends AglaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'STATE_ERROR', context);
  }
}

// リソースエラー：メモリやバッファ容量の問題
export class MockLoggerResourceError extends AglaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'RESOURCE_ERROR', context);
  }
}
```

## パフォーマンス最適化設計

### メモリ効率化

- 直接的な配列操作による効率的なメモリ使用
- バッファオーバーフロー検出によるメモリ使用量監視
- 明示的なcleanup()によるメモリリーク防止

### 計算効率化

- 検索処理における早期終了の実装
- バッファアクセスのキャッシュ化
- 正規表現の事前コンパイル

## 実装順序設計

### Phase 1: 基盤関数群の実装

1. validationUtils.ts の検証関数群
2. bufferUtils.ts のバッファ操作関数群
3. messageUtils.ts のメッセージ処理関数群

### Phase 2: LogBufferManager の実装

1. 基本的なバッファ管理機能
2. メッセージ追加・取得機能
3. 検索・削除機能

### Phase 3: MockLogger のリファクタリング

1. 委譲構造への変更
2. 既存 API の互換性確保
3. テストによる動作確認

### Phase 4: E2eMockLogger の再設計

1. testId ベース構造への変更
2. 静的管理システムの実装
3. クリーンアップ機能の実装

## テスト設計戦略

### ユニットテスト設計

- 各純粋関数の独立テスト
- エラーケースの網羅的テスト
- パフォーマンステスト

### 統合テスト設計

- クラス間の相互作用テスト
- API 互換性テスト
- メモリリークテスト

### E2E テスト設計

- 並列実行での隔離性テスト
- 実際の使用パターンでのテスト
- パフォーマンス回帰テスト
