---
header:
- src: immutable-config.spec.md
- @(#): ag-logger イミュータブル設定管理仕様書
title: ag-logger イミュータブル設定管理仕様書
description: ag-loggerパッケージを現代的な関数型プログラミングパターンを用いてリファクタリングする仕様書
version: 1.0.0
created: 2025-07-22
updated: 2025-07-22
authors:
  - atsushifx
changes:
  - 2025-07-22: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

ag-loggerの設定管理を完全にイミュータブルに設計し、予測可能で型安全な設定変更システムを構築する。現在の可変状態による副作用を排除し、関数型パターンによる設定管理を実現する。

---

## LoggerConfig 型定義

### 基本設計原則

1. **完全イミュータブル**: すべてのプロパティが `readonly`
2. **ディープイミュータブル**: ネストしたオブジェクトも変更不可
3. **型安全性**: 不正な設定値の代入を型レベルで防止
4. **デフォルト値**: 安全なデフォルト設定の保証

### 型定義

```typescript
// 核となる設定型
interface LoggerConfig {
  readonly level: AgTLogLevel;
  readonly verbose: boolean;
  readonly formatter: AgFormatFunction;
  readonly loggers: LoggerMap;
}

// ログレベル毎のロガーマッピング（イミュータブル）
interface LoggerMap {
  readonly [AG_LOG_LEVEL.FATAL]: AgLoggerFunction;
  readonly [AG_LOG_LEVEL.ERROR]: AgLoggerFunction;
  readonly [AG_LOG_LEVEL.WARN]: AgLoggerFunction;
  readonly [AG_LOG_LEVEL.INFO]: AgLoggerFunction;
  readonly [AG_LOG_LEVEL.DEBUG]: AgLoggerFunction;
  readonly [AG_LOG_LEVEL.TRACE]: AgLoggerFunction;
}

// 部分的な設定更新用型
type PartialLoggerConfig = {
  readonly [K in keyof LoggerConfig]?: LoggerConfig[K];
};

// ユーザー設定型（より柔軟な入力を許可）
interface UserLoggerConfig {
  readonly level?: AgTLogLevel | string;
  readonly verbose?: boolean;
  readonly formatter?: AgFormatFunction;
  readonly defaultLogger?: AgLoggerFunction;
  readonly loggerMap?: Partial<LoggerMap>;
}
```

### ディープイミュータブル実装

```typescript
// 再帰的なReadonly型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[] ? readonly DeepReadonly<U>[]
    : T[P] extends Record<string, any> ? DeepReadonly<T[P]>
    : T[P];
};

// 完全にイミュータブルな設定型
type ImmutableLoggerConfig = DeepReadonly<LoggerConfig>;

// ランタイムでのイミュータブル化
const freezeConfig = <T>(config: T): T => {
  if (typeof config !== 'object' || config === null) {
    return config;
  }

  Object.freeze(config);

  Object.values(config).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      freezeConfig(value);
    }
  });

  return config;
};
```

---

## デフォルト設定管理

### デフォルト値定義

```typescript
// デフォルトロガーマップ
const createDefaultLoggerMap = (): LoggerMap =>
  Object.freeze({
    [AG_LOG_LEVEL.FATAL]: ConsoleLogger,
    [AG_LOG_LEVEL.ERROR]: ConsoleLogger,
    [AG_LOG_LEVEL.WARN]: ConsoleLogger,
    [AG_LOG_LEVEL.INFO]: ConsoleLogger,
    [AG_LOG_LEVEL.DEBUG]: ConsoleLogger,
    [AG_LOG_LEVEL.TRACE]: ConsoleLogger,
  });

// デフォルト設定
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = Object.freeze({
  level: AG_LOG_LEVEL.INFO,
  verbose: false,
  formatter: PlainFormat,
  loggers: createDefaultLoggerMap(),
});

// コンソール用のデフォルト設定
export const CONSOLE_LOGGER_CONFIG: LoggerConfig = Object.freeze({
  level: AG_LOG_LEVEL.INFO,
  verbose: false,
  formatter: PlainFormat,
  loggers: Object.freeze({
    [AG_LOG_LEVEL.FATAL]: console.error,
    [AG_LOG_LEVEL.ERROR]: console.error,
    [AG_LOG_LEVEL.WARN]: console.warn,
    [AG_LOG_LEVEL.INFO]: console.info,
    [AG_LOG_LEVEL.DEBUG]: console.debug,
    [AG_LOG_LEVEL.TRACE]: console.debug,
  }),
});
```

### プリセット設定

```typescript
// よく使われる設定のプリセット
export const CONFIG_PRESETS = Object.freeze({
  // 開発環境用（詳細ログ）
  DEVELOPMENT: Object.freeze({
    level: AG_LOG_LEVEL.DEBUG,
    verbose: true,
    formatter: PlainFormat,
    loggers: CONSOLE_LOGGER_CONFIG.loggers,
  } as LoggerConfig),

  // 本番環境用（エラーのみ）
  PRODUCTION: Object.freeze({
    level: AG_LOG_LEVEL.ERROR,
    verbose: false,
    formatter: JsonFormat,
    loggers: CONSOLE_LOGGER_CONFIG.loggers,
  } as LoggerConfig),

  // テスト環境用（出力抑制）
  TESTING: Object.freeze({
    level: AG_LOG_LEVEL.OFF,
    verbose: false,
    formatter: NullFormat,
    loggers: createNullLoggerMap(),
  } as LoggerConfig),

  // JSON構造化ログ用
  JSON_LOGGING: Object.freeze({
    level: AG_LOG_LEVEL.INFO,
    verbose: false,
    formatter: JsonFormat,
    loggers: CONSOLE_LOGGER_CONFIG.loggers,
  } as LoggerConfig),
});

// ヘルパー関数
const createNullLoggerMap = (): LoggerMap =>
  Object.freeze({
    [AG_LOG_LEVEL.FATAL]: NullLogger,
    [AG_LOG_LEVEL.ERROR]: NullLogger,
    [AG_LOG_LEVEL.WARN]: NullLogger,
    [AG_LOG_LEVEL.INFO]: NullLogger,
    [AG_LOG_LEVEL.DEBUG]: NullLogger,
    [AG_LOG_LEVEL.TRACE]: NullLogger,
  });
```

---

## 設定更新関数群

### 基本更新関数

```typescript
/**
 * イミュータブルな設定更新
 * 元の設定を変更せず、新しい設定オブジェクトを返す
 */
export const updateConfig = (
  current: LoggerConfig,
  updates: PartialLoggerConfig,
): LoggerConfig => {
  const newConfig = {
    ...current,
    ...updates,
  };

  // ログレベル毎のロガー設定のマージ
  if (updates.loggers && current.loggers) {
    newConfig.loggers = Object.freeze({
      ...current.loggers,
      ...updates.loggers,
    });
  }

  return freezeConfig(newConfig);
};
```

### 特化した更新関数群

```typescript
// ログレベル設定
export const setLogLevel = (
  config: LoggerConfig,
  level: AgTLogLevel,
): LoggerConfig => updateConfig(config, { level });

// verbose フラグ設定
export const setVerbose = (
  config: LoggerConfig,
  verbose: boolean,
): LoggerConfig => updateConfig(config, { verbose });

// フォーマッター設定
export const setFormatter = (
  config: LoggerConfig,
  formatter: AgFormatFunction,
): LoggerConfig => updateConfig(config, { formatter });

// ロガーマップ設定
export const setLoggers = (
  config: LoggerConfig,
  loggers: Partial<LoggerMap>,
): LoggerConfig => updateConfig(config, { loggers });

// 特定レベルのロガー設定
export const setLoggerForLevel = (
  config: LoggerConfig,
  level: AgTLogLevel,
  logger: AgLoggerFunction,
): LoggerConfig =>
  updateConfig(config, {
    loggers: { [level]: logger },
  });
```

### 関数型設定ビルダー

```typescript
// 関数型の設定構築パターン
type ConfigBuilder = (config: LoggerConfig) => LoggerConfig;

export const withLogLevel = (level: AgTLogLevel): ConfigBuilder => (config) => setLogLevel(config, level);

export const withVerbose = (verbose: boolean = true): ConfigBuilder => (config) => setVerbose(config, verbose);

export const withFormatter = (formatter: AgFormatFunction): ConfigBuilder => (config) =>
  setFormatter(config, formatter);

export const withConsoleOutput = (): ConfigBuilder => (config) => setLoggers(config, CONSOLE_LOGGER_CONFIG.loggers);

export const withJsonFormat = (): ConfigBuilder => (config) => setFormatter(config, JsonFormat);

export const withPlainFormat = (): ConfigBuilder => (config) => setFormatter(config, PlainFormat);

// 使用例
const developmentConfig = pipe(
  withLogLevel(AG_LOG_LEVEL.DEBUG),
  withVerbose(true),
  withPlainFormat(),
  withConsoleOutput(),
)(DEFAULT_LOGGER_CONFIG);
```

---

## バリデーション機能

### 設定値検証

```typescript
// 設定値の検証関数
interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export const validateLoggerConfig = (
  config: Partial<LoggerConfig>,
): ValidationResult => {
  const errors: string[] = [];

  // ログレベル検証
  if (config.level !== undefined) {
    const validLevels = Object.values(AG_LOG_LEVEL);
    if (!validLevels.includes(config.level)) {
      errors.push(`Invalid log level: ${config.level}`);
    }
  }

  // フォーマッター検証
  if (config.formatter && typeof config.formatter !== 'function') {
    errors.push('Formatter must be a function');
  }

  // ロガー関数検証
  if (config.loggers) {
    Object.entries(config.loggers).forEach(([level, logger]) => {
      if (logger && typeof logger !== 'function') {
        errors.push(`Logger for level ${level} must be a function`);
      }
    });
  }

  return Object.freeze({
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  });
};

// 安全な設定作成
export const createSafeConfig = (
  userConfig: UserLoggerConfig,
): LoggerConfig | Error => {
  // 型変換
  const partialConfig: PartialLoggerConfig = {
    level: typeof userConfig.level === 'string'
      ? parseLogLevel(userConfig.level)
      : userConfig.level,
    verbose: userConfig.verbose,
    formatter: userConfig.formatter,
  };

  // バリデーション
  const validation = validateLoggerConfig(partialConfig);
  if (!validation.isValid) {
    return new Error(`Invalid config: ${validation.errors.join(', ')}`);
  }

  // 安全な設定作成
  let config = updateConfig(DEFAULT_LOGGER_CONFIG, partialConfig);

  // デフォルトロガー適用
  if (userConfig.defaultLogger) {
    const loggerMap: Partial<LoggerMap> = {};
    Object.values(AG_LOG_LEVEL).forEach((level) => {
      if (typeof level === 'number') {
        loggerMap[level] = userConfig.defaultLogger!;
      }
    });
    config = updateConfig(config, { loggers: loggerMap });
  }

  // 個別ロガーマップ適用
  if (userConfig.loggerMap) {
    config = updateConfig(config, { loggers: userConfig.loggerMap });
  }

  return config;
};
```

### ログレベル文字列解析

```typescript
// 文字列からログレベルへの変換
const LOG_LEVEL_MAP: Record<string, AgTLogLevel> = Object.freeze({
  'OFF': AG_LOG_LEVEL.OFF,
  'FATAL': AG_LOG_LEVEL.FATAL,
  'ERROR': AG_LOG_LEVEL.ERROR,
  'WARN': AG_LOG_LEVEL.WARN,
  'INFO': AG_LOG_LEVEL.INFO,
  'DEBUG': AG_LOG_LEVEL.DEBUG,
  'TRACE': AG_LOG_LEVEL.TRACE,
});

export const parseLogLevel = (levelString: string): AgTLogLevel => {
  const normalized = levelString.toUpperCase();
  const level = LOG_LEVEL_MAP[normalized];

  if (level === undefined) {
    throw new Error(`Unknown log level: ${levelString}`);
  }

  return level;
};
```

---

## 設定の合成と継承

### 設定マージ戦略

```typescript
// ディープマージ関数（イミュータブル）
export const mergeConfigs = (
  base: LoggerConfig,
  override: PartialLoggerConfig,
): LoggerConfig => {
  const merged: LoggerConfig = {
    level: override.level ?? base.level,
    verbose: override.verbose ?? base.verbose,
    formatter: override.formatter ?? base.formatter,
    loggers: override.loggers
      ? Object.freeze({ ...base.loggers, ...override.loggers })
      : base.loggers,
  };

  return freezeConfig(merged);
};

// 複数設定の合成
export const composeConfigs = (
  ...configs: readonly PartialLoggerConfig[]
): LoggerConfig => {
  return configs.reduce(
    (acc, config) => mergeConfigs(acc, config),
    DEFAULT_LOGGER_CONFIG,
  );
};
```

### 環境ベースの設定

```typescript
// 環境変数からの設定読み込み
export const createConfigFromEnv = (): Partial<LoggerConfig> => {
  const config: Partial<LoggerConfig> = {};

  // LOG_LEVEL 環境変数
  const logLevelEnv = process.env.LOG_LEVEL;
  if (logLevelEnv) {
    try {
      config.level = parseLogLevel(logLevelEnv);
    } catch {
      console.warn(`Invalid LOG_LEVEL: ${logLevelEnv}`);
    }
  }

  // VERBOSE 環境変数
  const verboseEnv = process.env.VERBOSE;
  if (verboseEnv) {
    config.verbose = verboseEnv.toLowerCase() === 'true';
  }

  return Object.freeze(config);
};

// プロファイル別設定
export const createConfigForProfile = (
  profile: 'development' | 'production' | 'test',
): LoggerConfig => {
  const baseConfig = CONFIG_PRESETS[profile.toUpperCase() as keyof typeof CONFIG_PRESETS];
  const envConfig = createConfigFromEnv();

  return mergeConfigs(baseConfig, envConfig);
};
```

---

## テスト仕様

### 設定更新のテスト

```typescript
describe('updateConfig', () => {
  it('should return new config without modifying original', () => {
    const original = DEFAULT_LOGGER_CONFIG;
    const updated = updateConfig(original, { level: AG_LOG_LEVEL.DEBUG });

    expect(updated).not.toBe(original);
    expect(original.level).toBe(AG_LOG_LEVEL.INFO);
    expect(updated.level).toBe(AG_LOG_LEVEL.DEBUG);
  });

  it('should freeze returned config object', () => {
    const updated = updateConfig(DEFAULT_LOGGER_CONFIG, { verbose: true });

    expect(Object.isFrozen(updated)).toBe(true);
    expect(Object.isFrozen(updated.loggers)).toBe(true);
  });
});
```

### バリデーションテスト

```typescript
describe('validateLoggerConfig', () => {
  it('should validate correct config', () => {
    const result = validateLoggerConfig({
      level: AG_LOG_LEVEL.INFO,
      formatter: PlainFormat,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should detect invalid log level', () => {
    const result = validateLoggerConfig({
      level: 999 as AgTLogLevel,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid log level: 999');
  });
});
```

### 関数型ビルダーテスト

```typescript
describe('config builders', () => {
  it('should compose multiple builders', () => {
    const config = pipe(
      withLogLevel(AG_LOG_LEVEL.DEBUG),
      withVerbose(true),
      withJsonFormat(),
    )(DEFAULT_LOGGER_CONFIG);

    expect(config.level).toBe(AG_LOG_LEVEL.DEBUG);
    expect(config.verbose).toBe(true);
    expect(config.formatter).toBe(JsonFormat);
  });

  it('should maintain immutability through composition', () => {
    const original = DEFAULT_LOGGER_CONFIG;

    const modified = pipe(
      withLogLevel(AG_LOG_LEVEL.ERROR),
      withVerbose(true),
    )(original);

    expect(original.level).toBe(AG_LOG_LEVEL.INFO);
    expect(original.verbose).toBe(false);
    expect(modified.level).toBe(AG_LOG_LEVEL.ERROR);
    expect(modified.verbose).toBe(true);
  });
});
```

---

## パフォーマンス考慮事項

### メモリ効率

1. **オブジェクト再利用**: 変更がない場合は同一オブジェクトを返す
2. **Shallow vs Deep Freeze**: パフォーマンスと安全性のバランス
3. **設定キャッシュ**: 頻繁に使用される設定の事前計算

### 実行速度

```typescript
// 最適化された更新関数
export const updateConfigOptimized = (
  current: LoggerConfig,
  updates: PartialLoggerConfig,
): LoggerConfig => {
  // 変更がない場合は元のオブジェクトを返す
  const hasChanges = Object.keys(updates).some(
    (key) => updates[key as keyof PartialLoggerConfig] !== current[key as keyof LoggerConfig],
  );

  if (!hasChanges) {
    return current;
  }

  return updateConfig(current, updates);
};
```

### メモリリーク防止

```typescript
// WeakMap を使った設定キャッシュ
const configCache = new WeakMap<object, LoggerConfig>();

export const getCachedConfig = (
  key: object,
  factory: () => LoggerConfig,
): LoggerConfig => {
  const cached = configCache.get(key);
  if (cached) {
    return cached;
  }

  const newConfig = factory();
  configCache.set(key, newConfig);
  return newConfig;
};
```
