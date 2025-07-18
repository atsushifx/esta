---
header:
  - src: docs/specs/@esta-core-error-handler.spec.md
  - @(#) : ESTA Core error handling framework
title: 📘 エラーハンドリング統一仕様書（@esta-core/error-handler）
version: 1.2.0
created: 2025-07-09
updated: 2025-07-14
authors:
  - 🧠 つむぎ（設計統一・exec 分離提案）
  - 🧁 小紅（例示＆分岐設計）
  - ⚙️ エルファ（FeatureFlag 実装＆fatal 設計）
  - 👤 atsushifx（全体設計・仕様確定）
changes:
  - 2025-07-14: フロントマター追加とドキュメント統一
  - 2025-07-11: ExitCode定数を共通定数(@shared/constants/exitCode)に移動
  - 2025-07-09: POSIX準拠の終了コード体系を統一、ExitCodeErrorMessage定数を追加
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

GitHub Actions と CLI の統一されたエラーハンドリングを提供するパッケージです。

### 主要機能

- ExitError クラス - 終了コードと致命性フラグを持つ統一エラー
- errorExit 関数 - 的エラー終了（ログ記録 + ExitError スロー）
- fatalExit 関数 - 致命的エラー終了（ログ記録 + 致命的 ExitError スロー）
- handleExitError 関数 - ExitError を適切に処理する共通ハンドラ
- 統一された終了コード - POSIX 準拠の終了コード体系

---

## パッケージ情報

- パッケージ名: `@esta-core/error-handler`
- バージョン: 0.0.0
- ライセンス: MIT
- 依存関係:
  - `@actions/core` - GitHub Actions 統合
  - `@agla-utils/ag-logger` - ログ機能
  - `@esta-core/feature-flags` - 実行環境判定
  - `@shared/constants` - 共通定数 (ExitCode 等)

---

## 基本方針

### エラー分類

| エラー種別     | 説明                        | 使用関数      | 特徴                          |
| -------------- | --------------------------- | ------------- | ----------------------------- |
| 致命的エラー   | 即時中断すべき重大な異常    | `fatalExit()` | fatal=true, ログレベル=FATAL  |
| 制御可能エラー | catchで処理可能な業務エラー | `errorExit()` | fatal=false, ログレベル=ERROR |

### 終了コード体系

**共通定数の場所**: `@shared/constants`

詳細は [Exit Code 仕様書](../detailed-design/exit-codes.md) を参照。

| ExitCode                  | 数値 | 説明                       | エラーメッセージ                 |
| ------------------------- | ---- | -------------------------- | -------------------------------- |
| `SUCCESS`                 | 0    | 正常終了                   | Operation completed successfully |
| `EXEC_FAILURE`            | 1    | 一般的な実行失敗           | General execution failure        |
| `CONFIG_NOT_FOUND`        | 11   | 設定ファイルが見つからない | Configuration file not found     |
| `COMMAND_EXECUTION_ERROR` | 12   | コマンド実行エラー         | Command execution failed         |
| `INVALID_ARGS`            | 13   | 無効な引数                 | Invalid command line arguments   |
| `VALIDATION_FAILED`       | 14   | バリデーション失敗         | Input validation failed          |
| `FILE_IO_ERROR`           | 15   | ファイルI/Oエラー          | File I/O operation failed        |
| `INTERNAL_LOGIC_ERROR`    | 16   | 内部ロジックエラー         | Internal logic error occurred    |
| `UNKNOWN_ERROR`           | 99   | 未定義のエラー             | Unknown error                    |

**定数の定義場所**:

- 共通定数: `@shared/constants` - POSIX 準拠の統一定義
- インポート: `import { ExitCode } from '@shared/constants'` で使用

---

## API仕様

### ExitError クラス

統一されたエラー処理のためのカスタムエラークラス。

```typescript
export class ExitError extends Error {
  readonly code: TExitCode;
  readonly fatal: boolean;

  constructor(code: TExitCode, message: string, fatal = false);
  isFatal(): boolean;
}
```

**プロパティ:**

- `code`: 終了コード（readonly）
- `fatal`: 致命的エラーフラグ（readonly）

**メソッド:**

- `isFatal()`: 致命的エラーかどうかを判定

### errorExit 関数

非致命的エラーでアプリケーションを終了します。

```typescript
export const errorExit = (
  code: TExitCode,
  message: string,
): never => {
  const logger = getLogger();
  const formattedMessage = formatErrorMessage('ERROR', code, message);
  logger.error(formattedMessage);
  throw new ExitError(code, message);
};
```

**パラメータ:**

- `code`: 終了コード
- `message`: エラーメッセージ

**動作:**

1. ログメッセージをフォーマット
2. ERROR レベルでログ記録
3. ExitError（fatal=false）をスロー

### fatalExit 関数

致命的エラーでアプリケーションを終了します。

```typescript
export const fatalExit = (
  message: string,
  code: TExitCode = ExitCode.EXEC_FAILURE,
): never => {
  const logger = getLogger();
  const formattedMessage = formatErrorMessage('FATAL', code, message);
  logger.fatal(formattedMessage);
  throw new ExitError(code, message, true);
};
```

**パラメータ:**

- `message`: エラーメッセージ
- `code`: 終了コード（デフォルト: EXEC_FAILURE）

**動作:**

1. ログメッセージをフォーマット
2. FATAL レベルでログ記録
3. ExitError（fatal=true）をスロー

### handleExitError 関数

ExitError を適切に処理して終了します。

```typescript
export const handleExitError = (err: ExitError): void => {
  const prefix = err.isFatal() ? 'FATAL' : 'ERROR';
  const message = `[${prefix} ${err.code}] ${err.message}`;

  if (estaFeatures.executionMode === TEstaExecutionMode.GITHUB_ACTIONS) {
    core.setFailed(message);
  } else {
    process.exit(err.code);
  }
};
```

**パラメータ:**

- `err`: 処理する ExitError インスタンス

**動作:**

- GitHub Actions 環境: `core.setFailed()`でエラー報告
- CLI 環境: `process.exit()`で終了

---

## 内部実装

### ユーティリティ関数

#### formatErrorMessage

統一されたエラーメッセージフォーマットを作成します。

```typescript
export const formatErrorMessage = (
  logLevel: 'ERROR' | 'FATAL',
  code: TExitCode,
  userMessage: string,
): string => {
  const caller = getCaller();
  const systemMessage = getExitCodeMessage(code);
  return `[${logLevel}(${code})] ${systemMessage}: ${userMessage} in ${caller}`;
};
```

**フォーマット例:**

```bash
[ERROR(13)] Invalid command line arguments: 引数が必要です in main
[FATAL(11)] Configuration file not found: CONFIG_PATHが未設定です in validateConfig
```

#### getExitCodeMessage

終了コードに対応するシステムメッセージを取得します。

```typescript
export const getExitCodeMessage = (code: TExitCode): string => {
  return ExitCodeErrorMessage[code] ?? ExitCodeErrorMessage[ExitCode.UNKNOWN_ERROR];
};
```

> 注意:
> `ExitCodeErrorMessage` は `@shared/constants` から提供されます。

### 呼び出し元情報の取得

スタックトレースを解析して呼び出し元の情報を取得し、デバッグを支援します。

---

## ファイル構成

```bash
packages/@esta-core/error-handler/
├── package.json
├── src/
│   ├── index.ts                    # エクスポート定義
│   ├── errorExit.ts                # 非致命的エラー終了
│   ├── fatalExit.ts                # 致命的エラー終了
│   ├── handleExitError.ts          # ExitErrorハンドラ
│   ├── error/
│   │   ├── ExitError.ts            # ExitErrorクラス
│   │   └── __tests__/
│   │       └── ExitError.spec.ts
│   ├── utils/
│   │   └── exitCodeUtils.ts        # ユーティリティ関数
│   └── __tests__/
│       ├── errorExit.spec.ts
│       ├── fatalExit.spec.ts
│       └── handleExitError.spec.ts
└── tests/
    └── e2e/
        ├── errorExit.spec.ts
        └── fatalExit.spec.ts
```

---

## 使用例

### CLIアプリケーションでの使用

```typescript
import { errorExit, ExitError, handleExitError } from '@esta-core/error-handler';
import { ExitCode } from '@shared/constants';

const main = async (argv: string[]) => {
  if (!argv.length) {
    errorExit(ExitCode.INVALID_ARGS, '引数が必要です');
  }
  // 処理続行
  return ExitCode.SUCCESS;
};

// エラーハンドリング
try {
  const result = await main(process.argv.slice(2));
  process.exit(result);
} catch (error) {
  if (error instanceof ExitError) {
    handleExitError(error);
  } else {
    console.error('Unexpected error:', error);
    process.exit(ExitCode.UNKNOWN_ERROR);
  }
}
```

### GitHub Actionsでの使用

```typescript
import { ExitError, fatalExit, handleExitError } from '@esta-core/error-handler';
import { ExitCode } from '@shared/constants';

const main = async () => {
  if (!process.env.CONFIG_PATH) {
    fatalExit('CONFIG_PATHが未設定です', ExitCode.CONFIG_NOT_FOUND);
  }
  // 処理続行
  return ExitCode.SUCCESS;
};

// GitHub Actions統合
try {
  await main();
} catch (error) {
  if (error instanceof ExitError) {
    handleExitError(error);
  } else {
    core.setFailed(`Unexpected error: ${error}`);
  }
}
```

### エラーの段階的処理

```typescript
import { errorExit, fatalExit } from '@esta-core/error-handler';
import { ExitCode } from '@shared/constants';

const processFile = async (filePath: string) => {
  // 設定ファイルの検証（回復可能）
  if (!fs.existsSync(filePath)) {
    errorExit(ExitCode.CONFIG_NOT_FOUND, `設定ファイルが見つかりません: ${filePath}`);
  }

  // 重要なリソースの検証（回復不可能）
  if (!process.env.REQUIRED_TOKEN) {
    fatalExit('必須のトークンが設定されていません', ExitCode.VALIDATION_FAILED);
  }
};
```

---

## テスト構成

### 単体テスト

- ExitError.spec.ts: ExitError クラスのテスト
- errorExit.spec.ts: errorExit 関数のテスト
- fatalExit.spec.ts: fatalExit 関数のテスト
- handleExitError.spec.ts: handleExitError 関数のテスト

### E2Eテスト

- errorExit.spec.ts: errorExit 関数の統合テスト
- fatalExit.spec.ts: fatalExit 関数の統合テスト
