---
header:
  - src: esta-error.plan.md
  - "@(#)": EstaError リストラクチャプラン
title: EstaError リストラクチャプラン
description: EstaError の統合エラーデザインへの整備プラン
version: 1.0.0
created: 2025-08-28
updated: 2025-08-28
authors:
  - atsushifx
changes:
  - 2025-08-28: 初回作成（統合エラーデザイン基盤整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

本プランは、EstaError を統合エラーデザインの基盤として整備し、Mock-Logger エラーデザインをベースとしたプロジェクト全体の統一エラーハンドリング基盤を構築する。

## 現状分析

### 重複するEstaError実装の問題

現在、プロジェクト内に 2つの異なる EstaError 実装が存在している。

#### 1. @esta-core/esta-error 実装

```typescript
export class EstaError extends AglaError {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly severity: ErrorSeverity;

  constructor(
    errorType: string,
    message: string,
    code: string,
    severity: ErrorSeverity,
    context?: Record<string, unknown>,
  );
  toJSON(): object;
  toString(): string;
  chain(cause: Error): EstaError;
}
```

**特徴:

- AglaError 継承（`errorType`, `context`）
- 高機能（`toJSON()`, `chain()`, `timestamp`, `severity`）
- 複雑なコンストラクタ引数

#### 2. @esta-error/error-handler 実装

```typescript
export class EstaError extends Error {
  readonly code: string;
  readonly severity: TErrorSeverity;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>);
}
```

特徴:

- Error 直接継承
- シンプルな構造
- 機能が限定的

### 既存エラーデザインの優秀な基盤

#### AglaLogger エラーデザイン

```typescript
export abstract class AglaError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>);
  toString(): string;
}

// 専用エラークラス群

// エラーメッセージ定数テーブル
export const MOCK_LOGGER_ERROR_MESSAGES = {
  VALIDATION: { INVALID_LOG_LEVEL: 'Invalid log level specified' },
  STATE: { BUFFER_NOT_FOUND: 'Buffer not found for testId...' },
  RESOURCE: { BUFFER_OVERFLOW: 'Buffer overflow: Maximum buffer size exceeded...' },
} as const;
```

#### ag-logger エラーデザイン

```typescript
export abstract class AglaError extends Error {
  public readonly errorType: string;
  public readonly context?: Record<string, unknown>;
}

export class AgLoggerError extends AglaError {
  constructor(errorType: TErrorType, message: string, context?: Record<string, unknown>);
}

export const AG_LOGGER_ERROR_MESSAGES = {
  VALIDATION: { INVALID_LOG_LEVEL: 'Invalid log level' },
  CONFIG: { INVALID_FORMATTER: 'formatter must be a valid function' },
  INITIALIZATION: { LOGGER_NOT_CREATED: 'Logger instance not created...' },
  STATE: { BUFFER_NOT_FOUND: 'Buffer not found for testId...' },
  RESOURCE: { BUFFER_OVERFLOW: 'Buffer overflow: Maximum buffer size exceeded...' },
} as const;
```

## 統合エラーデザイン目標

### 統一基盤エラークラス設計

Mock-Logger と ag-logger の優秀なパターンを統合し、以下の統一基盤を `/shared/types/` に構築:

```typescript
// 統合基底エラークラス
export abstract class AglaError extends Error {
  public readonly errorType: string;
  public readonly code?: string;
  public readonly severity?: ErrorSeverity;
  public readonly timestamp?: Date;
  public readonly context?: Record<string, unknown>;

  constructor(errorType: string, message: string, options?: {
    code?: string;
    severity?: ErrorSeverity;
    context?: Record<string, unknown>;
  });

  toString(): string;
  toJSON?(): object;
  chain?(cause: Error): AglaError;
}

// EstaError統一実装
export class EstaError extends AglaError {
  constructor(errorType: string, message: string, code: string, options?: {
    severity?: ErrorSeverity;
    context?: Record<string, unknown>;
  });
}
```

### エラーメッセージ定数設計

```typescript
// EstaError専用メッセージ定数
export const ESTA_ERROR_MESSAGES = {
  // 設定エラー
  CONFIG: {
    INVALID_CONFIG_FORMAT: 'Configuration format is invalid',
    MISSING_REQUIRED_FIELD: 'Required configuration field is missing',
    CONFIG_FILE_NOT_FOUND: 'Configuration file not found',
    CONFIG_VALIDATION_FAILED: 'Configuration validation failed',
  },

  // システムエラー
  SYSTEM: {
    RESOURCE_EXHAUSTED: 'System resources exhausted',
    PERMISSION_DENIED: 'Operation permission denied',
    TIMEOUT_EXCEEDED: 'Operation timeout exceeded',
    INITIALIZATION_FAILED: 'System initialization failed',
  },

  // 実行時エラー
  RUNTIME: {
    INVALID_STATE: 'Invalid application state',
    OPERATION_FAILED: 'Operation execution failed',
    DEPENDENCY_ERROR: 'Dependency operation failed',
    EXECUTION_TIMEOUT: 'Execution timeout occurred',
  },

  // 検証エラー
  VALIDATION: {
    INVALID_INPUT_TYPE: 'Invalid input type provided',
    INVALID_INPUT_FORMAT: 'Invalid input format',
    REQUIRED_FIELD_MISSING: 'Required field is missing',
    VALUE_OUT_OF_RANGE: 'Value is out of acceptable range',
  },
} as const;

// エラーメッセージ取得ヘルパー
export const getEstaErrorMessage = (category: keyof typeof ESTA_ERROR_MESSAGES, key: string): string => {
  const messages = ESTA_ERROR_MESSAGES[category];
  return (messages as Record<string, string>)[key] || 'Unknown error';
};
```

## 段階的統合プラン

### Phase 1: /shared/types/ 統合基本エラーデザイン構築

#### 1.1 統合基底エラークラス実装

ファイル: `shared/packages/types/types/AglaError.types.ts`

<!-- textlint-disable ja-technical-writing/max-comma -->

- Mock-Logger の `AglaError` をベースとした統合基底クラス
- `errorType`, `code`, `severity`, `timestamp`, `context` フィールド統合
- `toString()`, `toJSON()`, `chain()` メソッド実装

<!-- textlint-enable -->

#### 1.2 EstaError統一実装

ファイル: `shared/packages/types/types/EstaError.types.ts`

- 統合基底クラス継承の新 EstaError 実装
- 2つの既存実装の機能を統合
- API 互換性を保持した設計

#### 1.3 エラーメッセージ定数実装

ファイル: `shared/packages/types/constants/EstaErrorMessages.ts`

- `ESTA_ERROR_MESSAGES` 定数テーブル
- カテゴリ別エラーメッセージ管理
- ヘルパー関数実装

#### 1.4 ErrorSeverity 型定義統合

ファイル: `shared/packages/types/types/ErrorSeverity.types.ts`

- 既存 ErrorSeverity 定義の統合
- 標準化された重要度レベル定義

### Phase 2: 既存EstaError実装の統一

#### 2.1 @esta-core/esta-error パッケージ更新

影響範囲:

- `packages/@esta-core/esta-error/shared/types/EstaError.types.ts`
- 既存のテストファイル群
- 依存パッケージでの import 文

実装内容:

- 統合 `/shared/types/` からの import に変更
- 既存 API 互換性維持のためのラッパー実装
- テスト修正とバリデーション

#### 2.2 @esta-error/error-handler パッケージ更新

影響範囲:

- `packages/@esta-error/error-handler/src/error/EstaError.ts`
- 関連するテストとドキュメント

実装内容:

- 統合実装への移行
- 機能強化（`toJSON()`, `chain()` メソッド追加）
- 後方互換性保持

#### 2.3 重複排除とパッケージクリーンアップ

- 重複実装ファイルの削除
- 依存関係の整理
- パッケージ間の import 文統一

### Phase 3: 全パッケージでの統一エラーデザイン採用

#### 3.1 AgLoggerError との統合

目標: ag-logger の `AgLoggerError` を統合基盤ベースに移行。

実装内容:

- `packages/@agla-utils/ag-logger/shared/types/AgLoggerError.types.ts` 更新
- 統合基底クラス継承への変更
- 既存エラーメッセージ定数テーブル保持

#### 3.2 Mock-Logger エラーデザイン移行

目標: Mock-Logger を統合基盤ベースに移行。

実装内容:

- 現在の設計パターンを統合基盤に適用
- `LogBufferManager` での統一エラー使用
- テストでの一貫したエラーハンドリング

#### 3.3 他パッケージでの統一適用

対象パッケージ:

- `@esta-actions/*` パッケージ群
- `@esta-core/*` パッケージ群
- `@esta-system/*` パッケージ群
- `@esta-utils/*` パッケージ群

## API互換性保持戦略

### 段階的移行アプローチ

#### 1. ラッパー実装による互換性維持

```typescript
// 既存API互換性のためのラッパー
export class LegacyEstaError extends EstaError {
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super('LEGACY_ERROR', message, code, { context });
  }
}

// 既存コンストラクタパターン対応
export function createEstaError(
  errorTypeOrCode: string,
  message: string,
  codeOrSeverity?: string | ErrorSeverity,
  severityOrContext?: ErrorSeverity | Record<string, unknown>,
  context?: Record<string, unknown>,
): EstaError {
  // 引数パターン判定とマッピング処理
}
```

#### 2. 段階的deprecation警告

```typescript
/**
 * @deprecated Use new EstaError constructor pattern. Will be removed in v2.0.0
 */
export function createLegacyEstaError(/* ... */) {
  console.warn('Legacy EstaError constructor is deprecated');
  return new EstaError(/* ... */);
}
```

### 移行期間の並行サポート

- 旧実装と新実装の並行サポート（3リリース期間）
- 移行ガイドとサンプルコードの提供
- 自動移行ツールの提供（可能な範囲で）

## 各パッケージへの影響評価

### 高影響パッケージ

| パッケージ                  | 影響レベル | 主な変更内容               |
| --------------------------- | ---------- | -------------------------- |
| `@esta-core/esta-error`     | **高**     | 完全な実装変更、API統合    |
| `@esta-error/error-handler` | **高**     | 実装変更、機能強化         |
| `@agla-utils/ag-logger`     | **中**     | 基底クラス変更、互換性維持 |

### 中影響パッケージ

| パッケージ                      | 影響レベル | 主な変更内容                         |
| ------------------------------- | ---------- | ------------------------------------ |
| `@esta-actions/tools-installer` | **中**     | import文変更、エラーハンドリング統一 |
| `@esta-core/*` その他           | **中**     | 統一エラー採用、テスト更新           |

### 低影響パッケージ

| パッケージ       | 影響レベル | 主な変更内容           |
| ---------------- | ---------- | ---------------------- |
| `@esta-utils/*`  | **低**     | import文変更のみ       |
| `@esta-system/*` | **低**     | 新規エラーパターン適用 |

## テスト戦略

### 統合テスト計画

#### 1. 基底クラステスト

```typescript
describe('AglaError unified base class', () => {
  describe('when creating error with all options', () => {
    it('then should contain all specified properties', () => {
      const error = new TestError('TEST_ERROR', 'Test message', {
        code: 'TEST_001',
        severity: ErrorSeverity.ERROR,
        context: { testData: 'value' },
      });

      expect(error.errorType).toBe('TEST_ERROR');
      expect(error.code).toBe('TEST_001');
      expect(error.severity).toBe(ErrorSeverity.ERROR);
      expect(error.context).toEqual({ testData: 'value' });
    });
  });
});
```

#### 2. API互換性テスト

```typescript
describe('EstaError API compatibility', () => {
  describe('when using legacy constructor pattern', () => {
    it('then should work with existing code without modification', () => {
      // 既存コードパターンのテスト
    });
  });

  describe('when using new unified constructor pattern', () => {
    it('then should provide enhanced functionality', () => {
      // 新機能テスト
    });
  });
});
```

#### 3. 移行テスト

```typescript
describe('Migration from legacy EstaError implementations', () => {
  describe('when migrating @esta-core/esta-error usage', () => {
    it('then should maintain existing behavior', () => {
      // 移行前後の動作一致確認
    });
  });

  describe('when migrating @esta-error/error-handler usage', () => {
    it('then should provide backward compatibility', () => {
      // 後方互換性確認
    });
  });
});
```

### パフォーマンステスト

- エラー作成パフォーマンスの回帰テスト
- メモリ使用量の監視
- 大量エラーハンドリング時の動作確認

## 実装チェックリスト

### Phase 1: 統合基盤構築

- [ ] `/shared/types/types/AglaError.types.ts` 実装
- [ ] `/shared/types/types/EstaError.types.ts` 実装
- [ ] `/shared/types/types/ErrorSeverity.types.ts` 実装
- [ ] `/shared/types/constants/EstaErrorMessages.ts` 実装
- [ ] 統合基盤のユニットテスト実装
- [ ] ドキュメント作成（API 仕様、使用例）

### Phase 2: 既存実装統一

- [ ] `@esta-core/esta-error` パッケージ更新
- [ ] `@esta-error/error-handler` パッケージ更新
- [ ] 既存テスト修正とバリデーション
- [ ] API 互換性テスト実装
- [ ] 移行ガイド作成

### Phase 3: 全体適用

- [ ] `@agla-utils/ag-logger` 統合
- [ ] Mock-Logger エラーデザイン移行
- [ ] 他パッケージでの統一エラー採用
- [ ] E2E テストでの統合動作確認
- [ ] ドキュメント更新（全体アーキテクチャ）

## 成功基準

### 技術的成功基準

1. **統合性: すべてのエラークラスが統一基盤を使用
2. **互換性: 既存コードが無修正で動作
3. **一貫性: エラーメッセージとハンドリングパターンが統一
4. **拡張性: 新規パッケージでの容易な採用が可能

### 品質基準

1. **テストカバレッジ: 95%以上のカバレッジ維持
2. **パフォーマンス: エラー作成オーバーヘッド 10%以内
3. **メモリ使用量: 既存実装比較で増加 15%以内
4. **ドキュメント完備: API 仕様、移行ガイド、サンプル完備

## 今後の展望

### 長期的目標

- **多言語対応: エラーメッセージの国際化基盤
- **構造化ログ統合: ログシステムとの連携強化
- **監視システム統合: エラー監視・アラート機能
- **自動復旧機能: 特定エラーでの自動復旧メカニズム

### 拡張可能性

- **プラグインシステム: カスタムエラーハンドラープラグイン
- **エラー分析機能: エラーパターン分析とレポート
- **開発者ツール: エラーデバッグ支援ツール
- **CI/CD 統合: エラーハンドリング品質の自動チェック

---

このプランに基づき、EstaError を統合エラーデザインの基盤として整備し、プロジェクト全体の一貫したエラーハンドリング基盤を構築する。
