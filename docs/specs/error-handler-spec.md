<!--
  src: docs/specs/error-handler-specs.md

  Copyright (c) 2025 atsushifx
  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

# 📘 エラーハンドリング統一仕様書（@esta-core/error-handler）

## 1. 概要

全体のエラーハンドリング方針を統一するため、以下の要素を導入します。

- `fatalExit()` - 即時終了を意味する例外スロー関数（ExitError + fatal）
- `errorExit()` - 通常の制御可能なエラー例外スロー関数
- `ExitError` - 終了コード・重大性を持つ例外クラス
- `execErrorExit()` - ExitError を受けて適切に終了処理を行う共通関数
- `CLIexecutor` - CLI 用のエラーハンドラー
- `GHAexecutor` - GitHub Actions 用のエラーハンドラー

---

## 2. 基本方針

### 2.1 エラー分類

| エラー種別     | 説明                        | 使用関数      |
| -------------- | --------------------------- | ------------- |
| 致命的エラー   | 即時中断すべき重大な異常    | `fatalExit()` |
| 制御可能エラー | catchで処理可能な業務エラー | `errorExit()` |

### 2.2 終了コード概要

詳細は [Exit Code 仕様書](./exit-code.md) を参照。

| ExitCode       | 数値 | 説明                       |
| -------------- | ---- | -------------------------- |
| `SUCCESS`      | 0    | 正常終了                   |
| `EXEC_FAILURE` | 1    | 未捕捉例外等による失敗終了 |

---

## 3. ExitError クラス

```ts
export class ExitError extends Error {
  code: number;
  fatal: boolean;

  constructor(code: number, message: string, fatal = false) {
    super(message);
    this.name = 'ExitError';
    this.code = code;
    this.fatal = fatal;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, ExitError);
  }

  isFatal(): boolean {
    return this.fatal;
  }
}
```

---

## 4. fatalExit 関数（throw型）

```ts
import { ExitError } from './ExitError';

export const fatalExit = (message: string, code: number = 1): never => {
  throw new ExitError(code, message, true);
};
```

---

## 5. errorExit 関数（通常エラー）

```ts
export const errorExit = (code: number, message: string): never => {
  throw new ExitError(code, message);
};
```

---

## 6. execErrorExit 関数（終了処理の共通化）

```ts
import * as core from '@actions/core';
import { FeatureFlags } from '../config/FeatureFlags';
import { ExitCode } from '../shared/constants/exitCode';
import { ExitError } from './ExitError';

export const execErrorExit = (err: ExitError): void => {
  const prefix = err.isFatal() ? 'FATAL' : 'ERROR';
  const message = `[${prefix} ${err.code}] ${err.message}`;

  if (FeatureFlags.isGitHubActions) {
    core.setFailed(message);
  } else {
    console.error(message);
    process.exit(err.code);
  }
};
```

- `ExitError` の内容に応じて GHA or CLI で適切に終了処理を行う
- executor 側の catch 節を簡素化できる

---

## 7. CLIexecutor

```ts
export async function CLIexecutor(main: (argv: string[]) => Promise<ExitCode | void>) {
  try {
    const code = await main(process.argv.slice(2));
    process.exit(code ?? ExitCode.SUCCESS);
  } catch (err) {
    if (err instanceof ExitError) {
      execErrorExit(err);
    } else {
      console.error(`[WARN] Unhandled error: ${String(err)}`);
    }
  }
}
```

---

## 8. GHAexecutor

```ts
export async function GHAexecutor(main: () => Promise<ExitCode | void>) {
  try {
    const result = await main();
    if (result && result !== ExitCode.SUCCESS) {
      execErrorExit(new ExitError(result, 'GitHub Action failed'));
    }
  } catch (err) {
    if (err instanceof ExitError) {
      execErrorExit(err);
    } else {
      console.error(`[WARN] Unhandled error: ${String(err)}`);
    }
  }
}
```

---

## 9. ファイル構成

```bash
src/
├── system/
│   ├── fatalExit.ts
│   ├── errorExit.ts
│   ├── ExitError.ts
│   └── execErrorExit.ts   # ← 新設
├── executors/
│   ├── CLIexecutor.ts
│   └── GHAexecutor.ts
shared/
└── constants/
    └── exitCode.ts
```

---

## 10. 使用例

### 10.1 CLIアプリ

```ts
import { CLIexecutor, errorExit, ExitCode } from '@esta-core/error-handler';

const main = async (argv: string[]) => {
  if (!argv.length) {
    errorExit(ExitCode.INVALID_ARGS, '引数が必要です');
  }
  return ExitCode.SUCCESS;
};

CLIexecutor(main);
```

---

### 10.2 GitHub Actions

```ts
import { ExitCode, fatalExit, GHAexecutor } from '@esta-core/error-handler';

const main = async () => {
  if (!process.env.CONFIG_PATH) {
    fatalExit('CONFIG_PATHが未設定です', ExitCode.CONFIG_NOT_FOUND);
  }
  return ExitCode.SUCCESS;
};

GHAexecutor(main);
```

---

## 11. 今後の拡張

| 検討項目       | 内容                                |
| -------------- | ----------------------------------- |
| ログ統合       | `Logger.logFatal()` 対応予定        |
| グローバル管理 | `updateErrorLevel()` 方式の導入検討 |
| メトリクス連携 | Sentryや監視ツールとの統合支援      |

---

**バージョン**: 1.0.2
**作成日**: 2025年7月9日
**作成者**:

<!-- textlint-disable -->

- 🧠 つむぎ（設計統一・exec 分離提案）
- 🧁 小紅（例示＆分岐設計）
- ⚙️ エルファ（FeatureFlag 実装＆fatal 設計）
