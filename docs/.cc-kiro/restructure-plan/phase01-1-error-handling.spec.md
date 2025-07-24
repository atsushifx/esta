---
title: Phase 1.1 - エラーハンドリング仕様書
description: @esta-error/error-handler パッケージの詳細設計と統一エラーハンドリング戦略
sidebar_position: 1.1
---

# Phase 1.1: @esta-error/error-handler パッケージ仕様書

## 概要

@esta-error/error-handler は、ESTAシステム全体で統一されたエラーハンドリングを提供するパッケージです。EstaError と ErrorResult の2つのエラークラスにより、異なる用途に最適化されたエラー処理を実現します。

## パッケージ基本情報

- **パッケージ名**: `@esta-error/error-handler`
- **場所**: `packages/@esta-error/error-handler/`
- **責任**: 統一エラーハンドリングとエラー情報の構造化
- **依存関係**: 外部依存なし（標準Error クラスを拡張）

## エラーハンドリング戦略

### 基本方針

ESTAシステムでは、用途に応じて2つのエラーハンドリングパターンを使い分けます：

1. **基本ユーティリティ**: タプル型 `[value, ErrorResult | undefined]` または混合型
2. **ESTA統合モジュール**: `EstaError` + throw パターン

### 戦略の使い分け

```typescript
// 基本ユーティリティの例
export function validatePath(path: string): [string, ErrorResult | undefined] {
  if (!path) {
    return [undefined, new ErrorResult('INVALID_PATH', 'Path is required')];
  }

  const normalized = path.normalize();
  return [normalized, undefined];
}

// ESTA統合モジュールの例
export async function installTool(config: ToolConfig): Promise<InstallInfo> {
  const [validConfig, error] = validateToolConfig(config);
  if (error) {
    throw new EstaError('INVALID_CONFIG', error.message, { config });
  }

  return await performInstallation(validConfig);
}
```

## EstaError クラス仕様

### 基本定義

```typescript
export class EstaError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly severity: ErrorSeverity;

  constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
    options?: EstaErrorOptions,
  ) {
    super(message);

    this.name = 'EstaError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.severity = options?.severity ?? 'error';

    // スタックトレースの設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EstaError);
    }
  }

  /**
   * エラーのJSON表現を取得
   */
  toJSON(): EstaErrorJSON {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      severity: this.severity,
      stack: this.stack,
    };
  }

  /**
   * 人間が読みやすい形式での文字列表現
   */
  toString(): string {
    const contextStr = this.context
      ? ` (${JSON.stringify(this.context)})`
      : '';
    return `[${this.code}] ${this.message}${contextStr}`;
  }

  /**
   * エラーチェーンの作成
   */
  chain(cause: Error): EstaError {
    return new EstaError(
      this.code,
      `${this.message} -> ${cause.message}`,
      {
        ...this.context,
        cause: cause instanceof EstaError ? cause.toJSON() : {
          name: cause.name,
          message: cause.message,
          stack: cause.stack,
        },
      },
      { severity: this.severity },
    );
  }

  /**
   * コンテキスト情報の追加
   */
  withContext(additionalContext: Record<string, unknown>): EstaError {
    return new EstaError(
      this.code,
      this.message,
      { ...this.context, ...additionalContext },
      { severity: this.severity },
    );
  }
}
```

### 関連型定義

```typescript
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export interface EstaErrorOptions {
  severity?: ErrorSeverity;
}

export interface EstaErrorJSON {
  name: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  severity: ErrorSeverity;
  stack?: string;
}
```

### 静的メソッド

```typescript
export class EstaError extends Error {
  // ... 既存の実装 ...

  /**
   * 既存のErrorからEstaErrorを作成
   */
  static from(
    error: Error,
    code?: string,
    context?: Record<string, unknown>,
  ): EstaError {
    if (error instanceof EstaError) {
      return context ? error.withContext(context) : error;
    }

    return new EstaError(
      code ?? 'UNKNOWN_ERROR',
      error.message,
      {
        originalName: error.name,
        originalStack: error.stack,
        ...context,
      },
    );
  }

  /**
   * 設定エラーの作成
   */
  static config(message: string, context?: Record<string, unknown>): EstaError {
    return new EstaError('CONFIG_ERROR', message, context);
  }

  /**
   * バリデーションエラーの作成
   */
  static validation(message: string, context?: Record<string, unknown>): EstaError {
    return new EstaError('VALIDATION_ERROR', message, context);
  }

  /**
   * ネットワークエラーの作成
   */
  static network(message: string, context?: Record<string, unknown>): EstaError {
    return new EstaError('NETWORK_ERROR', message, context);
  }

  /**
   * ファイルシステムエラーの作成
   */
  static filesystem(message: string, context?: Record<string, unknown>): EstaError {
    return new EstaError('FILESYSTEM_ERROR', message, context);
  }

  /**
   * インストールエラーの作成
   */
  static installation(message: string, context?: Record<string, unknown>): EstaError {
    return new EstaError('INSTALLATION_ERROR', message, context);
  }
}
```

## ErrorResult クラス仕様

### 基本定義

```typescript
export class ErrorResult extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;

  constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
    options?: ErrorResultOptions,
  ) {
    super(message);

    this.name = 'ErrorResult';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.recoverable = options?.recoverable ?? true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorResult);
    }
  }

  /**
   * エラーのJSON表現を取得
   */
  toJSON(): ErrorResultJSON {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
    };
  }

  /**
   * EstaErrorへの変換
   */
  toEstaError(): EstaError {
    return new EstaError(this.code, this.message, this.context);
  }

  /**
   * 回復可能性の判定
   */
  isRecoverable(): boolean {
    return this.recoverable;
  }
}
```

### 関連型定義

```typescript
export interface ErrorResultOptions {
  recoverable?: boolean;
}

export interface ErrorResultJSON {
  name: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  recoverable: boolean;
}
```

### 静的メソッド

```typescript
export class ErrorResult extends Error {
  // ... 既存の実装 ...

  /**
   * 回復不可能なエラーの作成
   */
  static fatal(code: string, message: string, context?: Record<string, unknown>): ErrorResult {
    return new ErrorResult(code, message, context, { recoverable: false });
  }

  /**
   * パスエラーの作成
   */
  static invalidPath(path: string, reason?: string): ErrorResult {
    return new ErrorResult(
      'INVALID_PATH',
      reason ?? 'Invalid path provided',
      { path },
    );
  }

  /**
   * ファイル未発見エラーの作成
   */
  static fileNotFound(path: string): ErrorResult {
    return new ErrorResult(
      'FILE_NOT_FOUND',
      'File not found',
      { path },
    );
  }

  /**
   * 権限エラーの作成
   */
  static permissionDenied(path: string, operation: string): ErrorResult {
    return new ErrorResult(
      'PERMISSION_DENIED',
      `Permission denied for ${operation}`,
      { path, operation },
    );
  }

  /**
   * 検証エラーの作成
   */
  static validationFailed(field: string, value: unknown, rule: string): ErrorResult {
    return new ErrorResult(
      'VALIDATION_FAILED',
      `Validation failed for field '${field}': ${rule}`,
      { field, value, rule },
    );
  }
}
```

## タプル型エラーハンドリング

### 基本パターン

```typescript
// タプル型の定義
export type TupleResult<T, E = ErrorResult> = [T, undefined] | [undefined, E];

// 使用例
export function parseJson<T>(jsonString: string): TupleResult<T> {
  try {
    const parsed = JSON.parse(jsonString);
    return [parsed, undefined];
  } catch (error) {
    return [undefined, ErrorResult.validationFailed('json', jsonString, 'valid JSON required')];
  }
}

// 呼び出し側
const [result, error] = parseJson<MyType>(jsonString);
if (error) {
  console.error('JSON parse failed:', error.message);
  return;
}

// result は確実に MyType 型
console.log(result.someProperty);
```

### ヘルパー関数

```typescript
/**
 * タプル結果の成功判定
 */
export function isSuccess<T, E>(result: TupleResult<T, E>): result is [T, undefined] {
  return result[1] === undefined;
}

/**
 * タプル結果の失敗判定
 */
export function isError<T, E>(result: TupleResult<T, E>): result is [undefined, E] {
  return result[1] !== undefined;
}

/**
 * タプル結果の値取得（throw版）
 */
export function unwrap<T, E extends Error>(result: TupleResult<T, E>): T {
  if (isError(result)) {
    throw result[1];
  }
  return result[0];
}

/**
 * タプル結果の値取得（デフォルト値版）
 */
export function unwrapOr<T, E>(result: TupleResult<T, E>, defaultValue: T): T {
  return isSuccess(result) ? result[0] : defaultValue;
}

/**
 * タプル結果のマッピング
 */
export function mapResult<T, U, E>(
  result: TupleResult<T, E>,
  mapper: (value: T) => U,
): TupleResult<U, E> {
  return isSuccess(result) ? [mapper(result[0]), undefined] : result;
}

/**
 * 複数のタプル結果の結合
 */
export function combineResults<T extends readonly unknown[], E>(
  ...results: { [K in keyof T]: TupleResult<T[K], E> }
): TupleResult<T, E> {
  const values: unknown[] = [];

  for (const result of results) {
    if (isError(result)) {
      return result;
    }
    values.push(result[0]);
  }

  return [values as T, undefined];
}
```

## 互換性レイヤー

### 既存 error-handler との互換性

```typescript
/**
 * 既存のerrorExit関数との互換性
 * @deprecated Use EstaError with proper error handling instead
 */
export function errorExit(
  exitCode: number,
  message: string,
  context?: Record<string, unknown>,
): never {
  const error = new EstaError('EXIT_ERROR', message, context);

  console.error(`Error: ${message}`);
  if (context) {
    console.error('Context:', JSON.stringify(context, null, 2));
  }

  process.exit(exitCode);
}

/**
 * 既存エラーハンドリングとの橋渡し
 */
export function handleLegacyError(error: unknown): EstaError {
  if (error instanceof EstaError) {
    return error;
  }

  if (error instanceof Error) {
    return EstaError.from(error);
  }

  return new EstaError(
    'UNKNOWN_ERROR',
    typeof error === 'string' ? error : 'Unknown error occurred',
    { originalError: error },
  );
}
```

### 段階的移行支援

```typescript
/**
 * Promise版ラッパー（既存のPromise<T>をTupleResult<T>に変換）
 */
export async function toTupleResult<T>(
  promise: Promise<T>,
): Promise<TupleResult<T>> {
  try {
    const result = await promise;
    return [result, undefined];
  } catch (error) {
    const errorResult = error instanceof ErrorResult
      ? error
      : ErrorResult.fatal('PROMISE_REJECTED', error instanceof Error ? error.message : String(error));
    return [undefined, errorResult];
  }
}

/**
 * コールバック版ラッパー
 */
export function wrapCallback<T>(
  fn: (callback: (error: Error | null, result?: T) => void) => void,
): Promise<TupleResult<T>> {
  return new Promise((resolve) => {
    fn((error, result) => {
      if (error) {
        const errorResult = ErrorResult.fatal('CALLBACK_ERROR', error.message);
        resolve([undefined, errorResult]);
      } else {
        resolve([result as T, undefined]);
      }
    });
  });
}
```

## エラーコード標準化

### エラーコード体系

```typescript
export const ERROR_CODES = {
  // システムエラー
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  PLATFORM_UNKNOWN: 'PLATFORM_UNKNOWN',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // 設定エラー
  CONFIG_ERROR: 'CONFIG_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PATH: 'INVALID_PATH',

  // ネットワーク・ファイルエラー
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // インストール・コマンドエラー
  COMMAND_NOT_FOUND: 'COMMAND_NOT_FOUND',
  INSTALLATION_FAILED: 'INSTALLATION_FAILED',
  COMMAND_EXECUTION_FAILED: 'COMMAND_EXECUTION_FAILED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

### エラーメッセージ国際化

```typescript
export const ERROR_MESSAGES = {
  ja: {
    VALIDATION_FAILED: '設定の検証に失敗しました',
    FILE_NOT_FOUND: 'ファイルが見つかりません',
    CONFIG_ERROR: '設定エラーが発生しました',
    PERMISSION_DENIED: 'アクセス権限がありません',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    COMMAND_NOT_FOUND: 'コマンドが見つかりません',
    INSTALLATION_FAILED: 'インストールに失敗しました',
  },
  en: {
    VALIDATION_FAILED: 'Configuration validation failed',
    FILE_NOT_FOUND: 'File not found',
    CONFIG_ERROR: 'Configuration error occurred',
    PERMISSION_DENIED: 'Permission denied',
    NETWORK_ERROR: 'Network error occurred',
    COMMAND_NOT_FOUND: 'Command not found',
    INSTALLATION_FAILED: 'Installation failed',
  },
} as const;

/**
 * ローカライズされたエラーメッセージの取得
 */
export function getErrorMessage(
  code: ErrorCode,
  locale: 'ja' | 'en' = 'en',
): string {
  return ERROR_MESSAGES[locale][code] || ERROR_MESSAGES.en[code] || code;
}
```

## パッケージ構成

```
packages/@esta-error/error-handler/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                     # メインエクスポート
│   ├── errors/
│   │   ├── EstaError.ts            # EstaError クラス
│   │   ├── ErrorResult.ts          # ErrorResult クラス
│   │   └── types.ts                # エラー関連型定義
│   ├── handlers/
│   │   ├── TupleResult.ts          # タプル型ヘルパー
│   │   ├── compatibility.ts        # 既存API互換性
│   │   └── migration.ts            # 移行支援ユーティリティ
│   ├── constants/
│   │   ├── error-codes.ts          # エラーコード定数
│   │   └── error-messages.ts       # エラーメッセージ定義
│   ├── utils/
│   │   ├── formatting.ts           # エラーフォーマット
│   │   ├── logging.ts              # エラーログ
│   │   └── debugging.ts            # デバッグ支援
│   └── __tests__/
│       ├── EstaError.spec.ts
│       ├── ErrorResult.spec.ts
│       ├── TupleResult.spec.ts
│       ├── compatibility.spec.ts
│       └── integration/
│           └── error-handling.spec.ts
├── lib/                             # CJS ビルド出力
├── module/                          # ESM ビルド出力
└── configs/
    ├── tsconfig.json
    ├── vitest.config.ts
    └── eslint.config.js
```

## 使用例とベストプラクティス

### 基本ユーティリティでの使用例

```typescript
// ファイル読み込みユーティリティ
export async function readConfigFile(path: string): Promise<TupleResult<string>> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return [content, undefined];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [undefined, ErrorResult.fileNotFound(path)];
    }
    if (error.code === 'EACCES') {
      return [undefined, ErrorResult.permissionDenied(path, 'read')];
    }
    return [undefined, ErrorResult.fatal('FILESYSTEM_ERROR', error.message, { path })];
  }
}

// 使用例
const [config, error] = await readConfigFile('/path/to/config.json');
if (error) {
  if (error.isRecoverable()) {
    console.warn('Config file issue (recoverable):', error.message);
    // デフォルト設定で続行
  } else {
    console.error('Fatal config error:', error.message);
    return;
  }
}
```

### ESTA統合モジュールでの使用例

```typescript
// ツールインストーラー
export class ToolInstaller {
  async install(config: ToolConfig): Promise<InstallResult> {
    // バリデーション
    const [validatedConfig, validationError] = this.validateConfig(config);
    if (validationError) {
      throw EstaError.validation(
        'Tool configuration validation failed',
        { config, errors: validationError.toJSON() },
      );
    }

    try {
      // インストール実行
      const result = await this.performInstallation(validatedConfig);
      return result;
    } catch (error) {
      // エラーチェーンの作成
      const estaError = EstaError.installation(
        `Failed to install tool: ${config.name}`,
        { config },
      );

      if (error instanceof Error) {
        throw estaError.chain(error);
      }

      throw estaError;
    }
  }
}
```

### エラー処理のベストプラクティス

```typescript
// 1. 適切なエラー分類
function createError(type: 'user' | 'system', code: string, message: string) {
  if (type === 'user') {
    // ユーザーエラーはErrorResultでタプル型
    return ErrorResult.validationFailed(code, message, 'user input');
  } else {
    // システムエラーはEstaErrorでthrow
    throw EstaError.config(message);
  }
}

// 2. エラーコンテキストの充実
function enhancedError() {
  try {
    // 何らかの処理
  } catch (error) {
    throw new EstaError(
      'PROCESS_FAILED',
      'Process execution failed',
      {
        processId: process.pid,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        platform: process.platform,
        originalError: error instanceof Error ? error.message : error,
      },
    );
  }
}

// 3. 段階的エラー処理
async function robustOperation(): Promise<TupleResult<string>> {
  // 第一段階: 設定確認
  const [config, configError] = await loadConfig();
  if (configError) {
    return [undefined, configError];
  }

  // 第二段階: 環境確認
  const [env, envError] = await checkEnvironment();
  if (envError) {
    return [undefined, envError];
  }

  // 第三段階: 実際の処理
  try {
    const result = await performOperation(config, env);
    return [result, undefined];
  } catch (error) {
    const errorResult = ErrorResult.fatal(
      'OPERATION_FAILED',
      error instanceof Error ? error.message : String(error),
    );
    return [undefined, errorResult];
  }
}
```

## テスト戦略

### 単体テスト

```typescript
describe('EstaError', () => {
  it('should create error with code and message', () => {
    const error = new EstaError('TEST_ERROR', 'Test message');

    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('EstaError');
    expect(error instanceof Error).toBe(true);
  });

  it('should include context in JSON representation', () => {
    const context = { userId: 123, action: 'test' };
    const error = new EstaError('TEST_ERROR', 'Test message', context);
    const json = error.toJSON();

    expect(json.context).toEqual(context);
    expect(json.code).toBe('TEST_ERROR');
  });

  it('should create error chain', () => {
    const original = new Error('Original error');
    const esta = new EstaError('WRAPPER_ERROR', 'Wrapper message');
    const chained = esta.chain(original);

    expect(chained.message).toContain('Original error');
    expect(chained.context?.cause).toBeDefined();
  });
});
```

### 統合テスト

```typescript
describe('Error Handling Integration', () => {
  it('should handle error flow in real scenario', async () => {
    // エラーが発生するシナリオをシミュレート
    const [result, error] = await readConfigFile('/nonexistent/path');

    expect(error).toBeInstanceOf(ErrorResult);
    expect(error?.code).toBe('FILE_NOT_FOUND');
    expect(result).toBeUndefined();
  });

  it('should maintain error information through the call stack', () => {
    expect(() => {
      try {
        throw new Error('Base error');
      } catch (e) {
        const estaError = EstaError.from(e, 'CAUGHT_ERROR', { layer: 'service' });
        const wrappedError = new EstaError('WRAPPER_ERROR', 'Wrapped', { layer: 'controller' });
        throw wrappedError.chain(estaError);
      }
    }).toThrow(EstaError);
  });
});
```

## パフォーマンス考慮事項

### メモリ効率

```typescript
// エラーオブジェクトの再利用
const COMMON_ERRORS = {
  INVALID_PATH: new ErrorResult('INVALID_PATH', 'Invalid path provided'),
  FILE_NOT_FOUND: new ErrorResult('FILE_NOT_FOUND', 'File not found'),
  PERMISSION_DENIED: new ErrorResult('PERMISSION_DENIED', 'Permission denied'),
} as const;

// コンテキスト固有の情報のみ新規作成
export function fileNotFound(path: string): ErrorResult {
  return new ErrorResult(
    'FILE_NOT_FOUND',
    'File not found',
    { path },
  );
}
```

### スタックトレース最適化

```typescript
// 本番環境でのスタックトレース制限
export class EstaError extends Error {
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);

    // 開発環境でのみ詳細なスタックトレース
    if (process.env.NODE_ENV === 'development') {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, EstaError);
      }
    }
  }
}
```

## セキュリティ考慮事項

### 機密情報の保護

```typescript
// 機密情報のマスキング
export class EstaError extends Error {
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);

    // 機密情報のマスキング
    this.context = this.sanitizeContext(context);
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) { return context; }

    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
```

## 実装優先順位

### Phase 1a: 基本クラス実装

1. EstaError クラス基本実装
2. ErrorResult クラス基本実装
3. 基本的なテスト

### Phase 1b: ヘルパー・ユーティリティ

1. タプル型ヘルパー関数
2. エラーコード標準化
3. 互換性レイヤー

### Phase 1c: 高度な機能

1. エラーチェーン機能
2. 国際化対応
3. パフォーマンス最適化
4. セキュリティ強化
