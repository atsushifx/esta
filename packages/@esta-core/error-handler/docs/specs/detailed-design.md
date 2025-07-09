<!-- src: docs/specs/detailed-design.md -->

# 📘 エラーハンドリング統一機能 詳細設計書

## 1. 概要

本書は GitHub Issue #28 に基づき、CLI／GitHub Actions 実行環境における終了コード・例外処理の統一を目的とした機能の詳細設計を示します。
また、引数・入力処理の分離により `main()` 関数のシンプル化を実現します。

---

## 2. 設計方針

| 項目               | 内容                                                     |
| ------------------ | -------------------------------------------------------- |
| 終了コード         | `ExitCode` に統一定義、意味のある数値のみ使用            |
| エラー型           | `ExitError` に統一。致命性は `fatal: boolean` で判定     |
| 終了関数           | `fatalExit()` / `errorExit()` で例外スロー               |
| 実行器（Executor） | CLI/GHAごとに `CLIexecutor`, `GHAexecutor` を分離        |
| 入力処理           | `setupCLI()` / `setupGHA()` によって事前に抽出・検証     |
| main関数の簡素化   | 実行対象リスト (`string[]`) だけを引数として受け取る構造 |

---

## 3. クラス設計

### 3.1 ExitError

```ts
export class ExitError extends Error {
  readonly code: number;
  readonly fatal: boolean;

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

## 4. API設計

### 4.1 fatalExit()

```ts
export const fatalExit = (
  message: string,
  code: ExitCode = ExitCode.EXEC_FAILURE,
): never => {
  throw new ExitError(code, message, true);
};
```

### 4.2 errorExit()

```ts
export const errorExit = (
  code: ExitCode,
  message: string,
): never => {
  throw new ExitError(code, message);
};
```

---

## 5. 入力処理構成（Setupモジュール）

### 5.1 setupCLI.ts

```ts
import { ExitCode } from '../../shared/constants/exitCode';
import { errorExit } from '../errorExit';

export function setupCLI(argv: string[]): string[] {
  if (!argv.length) {
    errorExit(ExitCode.ERR_INVALID_ARGS, 'インストール対象が指定されていません');
  }
  return argv;
}
```

---

### 5.2 setupGHA.ts

```ts
import * as core from '@actions/core';
import { ExitCode } from '../../shared/constants/exitCode';
import { errorExit } from '../errorExit';

export function setupGHA(): string[] {
  const raw = core.getInput('binaries');
  if (!raw) {
    errorExit(ExitCode.ERR_INVALID_ARGS, 'binaries input が必要です');
  }

  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
```

---

## 6. Executor構成（更新済）

### 6.1 CLIexecutor

```ts
import { setupCLI } from './setup/setupCLI';

export async function CLIexecutor(main: (targets: string[]) => Promise<ExitCode | void>) {
  try {
    const targets = setupCLI(process.argv.slice(2));
    const code = await main(targets);
    process.exit(code ?? ExitCode.SUCCESS);
  } catch (err) {
    const code = err instanceof ExitError ? err.code : ExitCode.EXEC_FAILURE;
    const msg = err instanceof ExitError ? err.message : String(err);
    const prefix = err instanceof ExitError && err.fatal ? 'FATAL' : 'ERROR';
    console.error(`[${prefix} ${code}] ${msg}`);
    process.exit(code);
  }
}
```

---

### 6.2 GHAexecutor

```ts
import * as core from '@actions/core';
import { setupGHA } from './setup/setupGHA';

export async function GHAexecutor(main: (targets: string[]) => Promise<ExitCode | void>) {
  try {
    const binaries = setupGHA();
    const code = await main(binaries);
    if (code && code !== ExitCode.SUCCESS) {
      core.setFailed(`[ERROR ${code}] GitHub Action failed`);
    }
  } catch (err) {
    const code = err instanceof ExitError ? err.code : ExitCode.EXEC_FAILURE;
    const msg = err instanceof ExitError ? err.message : String(err);
    const prefix = err instanceof ExitError && err.fatal ? 'FATAL' : 'ERROR';
    core.setFailed(`[${prefix} ${code}] ${msg}`);
  }
}
```

---

## 7. main関数の構造（簡素）

```ts
const main = async (binaries: string[]): Promise<ExitCode> => {
  for (const bin of binaries) {
    await installBinary(bin);
  }
  return ExitCode.SUCCESS;
};
```

---

## 8. 終了コード定義（概要）

| ExitCode              | 値 | 説明                 |
| --------------------- | -- | -------------------- |
| SUCCESS               | 0  | 正常終了             |
| EXEC_FAILURE          | 1  | 未捕捉エラー         |
| ERR_INVALID_ARGS      | 11 | 無効な引数／with入力 |
| ERR_CONFIG_NOT_FOUND  | 12 | 設定ファイル未発見   |
| ERR_COMMAND_EXECUTION | 13 | 実行時エラー         |
| ERR_FILE_IO           | 14 | ファイル操作エラー   |
| ERR_LOGIC             | 15 | 内部ロジック不整合   |

---

## 9. ファイル構成

```
src/
├── system/
│   ├── ExitError.ts
│   ├── fatalExit.ts
│   ├── errorExit.ts
│   ├── CLIexecutor.ts
│   ├── GHAexecutor.ts
│   └── setup/
│       ├── setupCLI.ts
│       └── setupGHA.ts
shared/
└── constants/
    └── exitCode.ts
```

---

## 10. 今後の拡張

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| ログ統合       | `Logger.logFatal()` 導入予定     |
| バリデーション | `zod` や schema による input検証 |
| グローバル記録 | `ErrorLevelManager` 構想         |
| モニタリング   | Sentry 連携や GitHub status出力  |

---

**作成日**: 2025年7月9日
**バージョン**: 1.3
**作成者**:

- 🧠 つむぎ（executor構成と入力分離設計）
- ⚙️ エルファ（例外型最適化）
- 🧁 小紅（ユースケース＆簡素化支援）
