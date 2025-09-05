---
header:
  - src: docs/user-guides/quick-start.guide.md
  - @(#): AgLogger クイックスタートガイド
title: AgLogger クイックスタートガイド
description: AgLoggerを5分で使い始めるための最小限ガイド
version: 0.3.0
created: 2025-09-05
authors:
  - atsushifx
changes:
  - 2025-09-05: 初版作成（パッケージドキュメント標準化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

AgLogger は、TypeScript/JavaScript 向けの強力で柔軟な構造化ログライブラリです。シングルトンパターンベースの設計により、アプリケーション全体で一貫したログ管理を提供し、豊富なカスタマイズオプションとテスト支援機能を備えています。

## インストール

```bash
npm install @agla-utils/ag-logger
# または
pnpm add @agla-utils/ag-logger
```

## 30秒で始める基本例

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

// 最小設定でロガーを作成
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// すぐに使用開始
logger.info('アプリケーション開始');
logger.warn('注意: 設定ファイルが見つかりません');
logger.error('エラーが発生しました', { code: 500, path: '/api/users' });
```

**出力例:**

```bash
2025-08-24T10:30:45Z [INFO] アプリケーション開始
2025-08-24T10:30:45Z [WARN] 注意: 設定ファイルが見つかりません
2025-08-24T10:30:45Z [ERROR] エラーが発生しました {"code":500,"path":"/api/users"}
```

### 必須知識

#### ログレベル

| レベル | 用途         | 使用例                               |
| ------ | ------------ | ------------------------------------ |
| ERROR  | エラー状況   | API呼び出し失敗、データベースエラー  |
| WARN   | 警告・注意   | 非推奨API使用、リソース不足警告      |
| INFO   | 一般情報     | アプリケーション開始、重要な処理完了 |
| DEBUG  | デバッグ情報 | 変数値、処理フロー確認               |

#### フォーマッター

```typescript
// PlainFormatter (人間が読みやすい)
PlainFormatter; // → 2025-08-24T10:30:45Z [INFO] メッセージ

// JsonFormatter (機械処理向け)
JsonFormatter; // →  { "timestamp":"2025-08-24T10:30:45.123Z", "level":"INFO", "message":"メッセージ" }
```

### よく使うパターン

#### 開発環境

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter, // 読みやすい形式
  logLevel: AG_LOGLEVEL.DEBUG, // 詳細情報まで出力
});
```

#### 本番環境

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter, // ログ解析ツール向け
  logLevel: AG_LOGLEVEL.WARN, // 警告以上のみ
});
```

#### テスト環境

```typescript
import { createMockFormatter, MockLogger } from '@agla-utils/ag-logger';

const mockLogger = new MockLogger();
const logger = AgLogger.createLogger({
  defaultLogger: mockLogger.logger,
  formatter: createMockFormatter(),
});

// テストでログ出力を検証
logger.info('テストメッセージ');
expect(mockLogger.hasBeenCalled('info')).toBe(true);
expect(mockLogger.getCallCount('info')).toBe(1);
```

### マネージャー経由の使用

アプリケーション全体でロガーを共有したい場合:

```typescript
import { AgLoggerManager, getLogger } from '@agla-utils/ag-logger';

// アプリケーション開始時に1回だけ初期化
AgLoggerManager.createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

// 任意のファイルから使用可能
const logger = getLogger();
logger.info('マネージャー経由でのログ出力');
```

#### 実用的な使用例

```typescript
// user-service.ts
import { getLogger } from '@agla-utils/ag-logger';

export class UserService {
  private logger = getLogger();

  async createUser(userData: { email: string }) {
    this.logger.info('ユーザー作成開始', { email: userData.email });

    try {
      const user = await this.userRepository.create(userData);
      this.logger.info('ユーザー作成成功', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('ユーザー作成失敗', {
        email: userData.email,
        error: error.message,
      });
      throw error;
    }
  }
}
```
