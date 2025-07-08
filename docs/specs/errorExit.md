# 🧩 エラーハンドリング統一仕様書 v1.0

## 🎯 目的

本仕様は、CLI実行環境およびGitHub Actions環境におけるプロセス終了・異常終了時のハンドリング方法を統一し、保守性・可読性・実行環境対応力を向上させることを目的とする。

---

## 📚 構成概要

### エラーハンドリング共通クラス

```
Error
└── ExitError (共通コード・ログメッセージ)
    ├── CLIExitError
    └── GHAExitError
```

### 戦略選択

実行時に `FeatureFlags.isGitHubActions: boolean` によって、CLI用 or GHA用のExecutorが選択される。

---

## 🧠 ExitError クラス定義

### `ExitError`

```ts
export class ExitError extends Error {
  readonly code: number;

  constructor(code: number, message: string);
}
```

- `code`: プロセス終了時に返すエラーコード
- `message`: ログ・CI出力に表示されるエラーメッセージ

---

### `CLIExitError` / `GHAExitError`

```ts
export class CLIExitError extends ExitError {}
export class GHAExitError extends ExitError {}
```

特定の実行環境を明示するための派生型。共通の `.code`, `.message` を継承。

---

## 🛠️ runtimeExit API

```ts
export const runtimeExit = (code: number): never;
```

- 実行環境に応じて `throw new CLIExitError(...)` or `throw new GHAExitError(...)` を実行
- 呼び出し元では `Executor` で catch して exit 処理を実行

---

## 🚀 Executor 実装

### CLIExecutor

```ts
export const CLIExecutor = async (main: () => Promise<void>);
```

- `ExitError` を捕捉し、`process.exit(err.code)` に変換
- 未知のエラーはログ出力＋exit(1)

### GHAExecutor

```ts
export const GHAExecutor = async (main: () => Promise<void>);
```

- `ExitError` を `@actions/core.setFailed()` に変換
- 未知のエラーも同様に `setFailed`

---

## 🎯 エラーコード体系

| コード    | 意味                                                      |
| --------- | --------------------------------------------------------- |
| `1`       | 一般的な異常終了（デフォルト）                            |
| `2`       | 入力バリデーション失敗                                    |
| `3`       | 外部依存（API/DB）への接続エラー                          |
| `4`       | ファイル・IOエラー                                        |
| `5`       | 内部処理での不整合（論理エラー）                          |
| `10~19`   | GHA 専用コード（例: `10` = GitHub Actions setup failure） |
| `100~199` | カスタムタスク別コード（任意拡張）                        |

※ 利用者は必要に応じて `ExitError(code, message)` の `code` を指定可能

---

## 🧪 実装例：fatalExit

```ts
export const fatalExit = (message: string, code = 1): never => {
  log.fatal(`[FATAL] ${message}`);
  runtimeExit(code);
};
```

---

## 📦 ディレクトリ構成（例）

```
src/
  config/
    FeatureFlags.ts
  system/
    agLogger.ts
    ExitError.ts
    CLIExitError.ts
    GHAExitError.ts
    fatalExit.ts
    errorExit.ts
    runtimeExit.ts
    CLIExecutor.ts
    GHAExecutor.ts
```

---

## 📘 使用フロー（全体）

```ts
import { FeatureFlags } from '@/config/FeatureFlags';
import { CLIExecutor } from '@/system/CLIExecutor';
import { GHAExecutor } from '@/system/GHAExecutor';

const main = async () => {
  // 任意の処理
  if (失敗) {
    fatalExit('致命的エラーが発生しました', 3);
  }
};

FeatureFlags.isGitHubActions ? GHAExecutor(main) : CLIExecutor(main);
```

---

## 💬 備考

- `ExitError` は catch 可能な例外として利用され、`throw` されるまで `process.exit()` は行わない。
- CI 環境での `setFailed()` 出力は GitHub Actions に対して明確な失敗シグナルとなる。

---

【設計責任】🧠 つむぎ
【使用指針】📘 小紅
【補足実装】⚙️ エルファ
