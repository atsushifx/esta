<!-- src: docs/specs/error-handler-spec.md -->

# 📘 エラーハンドリング統一仕様書（@esta-core/error-handler）

## 1. 概要

全体のエラーハンドリング方針を統一するため、以下の要素を導入します：

- `fatalExit()` - 即時終了を意味する例外スロー関数（ExitError + fatal）
- `errorExit()` - 通常の制御可能なエラー例外スロー関数
- `ExitError` - 終了コード・重大性を持つ例外クラス
- `CLIexecutor` - CLI用のエラーハンドラー
- `GHAexecutor` - GitHub Actions用のエラーハンドラー

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
  throw new ExitError(code, message, true); // ← fatal = true
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

## 6. CLIexecutor

```ts
export async function CLIexecutor(main: (argv: string[]) => Promise<ExitCode | void>) {
  try {
    const code = await main(process.argv.slice(2));
    process.exit(code ?? ExitCode.SUCCESS);
  } catch (err) {
    const isExitError = err instanceof ExitError;
    const code = isExitError ? err.code : ExitCode.EXEC_FAILURE;
    const msg = isExitError ? err.message : String(err);
    const prefix = isExitError && err.isFatal() ? 'FATAL' : 'ERROR';

    console.error(`[${prefix} ${code}] ${msg}`);
    process.exit(code);
  }
}
```

---

## 7. GHAexecutor

```ts
import * as core from '@actions/core';

export async function GHAexecutor(main: () => Promise<ExitCode | void>) {
  try {
    const result = await main();
    if (result && result !== ExitCode.SUCCESS) {
      core.setFailed(`[ERROR ${result}] GitHub Action failed`);
    }
  } catch (err) {
    const isExitError = err instanceof ExitError;
    const code = isExitError ? err.code : ExitCode.EXEC_FAILURE;
    const msg = isExitError ? err.message : String(err);
    const prefix = isExitError && err.isFatal() ? 'FATAL' : 'ERROR';

    core.setFailed(`[${prefix} ${code}] ${msg}`);
  }
}
```

---

## 8. ファイル構成

```
src/
├── system/
│   ├── fatalExit.ts
│   ├── errorExit.ts
│   └── ExitError.ts
├── executors/
│   ├── CLIexecutor.ts
│   └── GHAexecutor.ts
shared/
└── constants/
    └── exitCode.ts
```

※ `exitCode.ts` はプロジェクト直下の `shared/constants/` に配置

---

## 9. 使用例

### 9.1 CLIアプリ

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

### 9.2 GitHub Actions

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

## 10. 今後の拡張

| 検討項目       | 内容                                |
| -------------- | ----------------------------------- |
| ログ統合       | `Logger.logFatal()` 対応予定        |
| グローバル管理 | `updateErrorLevel()` 方式の導入検討 |
| メトリクス連携 | Sentryや監視ツールとの統合支援      |

---

**バージョン**: 1.1
**作成日**: 2025年7月9日
**作成者**:

- 🧠 つむぎ（設計統一・ログ設計）
- 🧁 小紅（例示追加・テスト観点）
- ⚙️ エルファ（例外設計・CI対策）
