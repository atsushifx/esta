---
header:
  - src: docs/specs/@esta-actions-tools-installer.spec.md
  - @(#) : ESTA Actions Tools Installer framework
title: 📦 ツールインストーラー統合実行仕様書（@esta-actions/tools-installer）
description: この仕様書は @esta-actions パッケージのツールインストーラー統合実行機能の仕様を定義します
version: 1.0.0
authors:
  - 🧠 つむぎ（executor分離設計）
  - 🧁 小紅（実行環境統合設計）
  - ⚙️ エルファ（GitHub Actions統合）
  - 👤 atsushifx（全体設計・仕様確定）
changes:
  - 2025-07-14: フロントマター追加とドキュメント統一
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

`@esta/esta-executor` は、複数の実行環境（CLI、GitHub Actions、Deno など）に対応した「統一的な実行制御フレームワーク」です。

### 主な目的

- 各 `main()` 関数をシンプルに保ち、実行環境ごとの処理を分離する
- 環境に応じた引数／入力の取得 (`setupXXX`) を切り出す
- エラー処理は `@esta-core/error-handler` に統一

---

## 2. 設計方針

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| main関数   | `MainHandler<T>` 型で統一                               |
| executor   | `CLIexecutor`, `GHAexecutor`, `DenoExecutor` などを用意 |
| setup関数  | 環境ごとの入力値を構築し、バリデーションもここで行う    |
| エラー処理 | `ExitError` を `execErrorExit()` によって共通処理に集約 |
| 終了コード | `ExitCode` は `@esta-core/error-handler` 側にて一元管理 |

---

## 3. 型定義

```ts
export type MainHandler<T> = (input: T) => Promise<ExitCode | void>;
```

- `T` は任意の入力型（例: CLI は `string[]`、GHA は `{ [key: string]: string }`）

---

## 4. 使用例

### 4.1 CLI実行

```ts
import { ExitCode } from '@esta-core/error-handler';
import { CLIexecutor } from '@esta/esta-executor';
import { setupCLI } from './setup/setupCLI';

const main = async (args: string[]): Promise<ExitCode> => {
  for (const bin of args) { await install(bin); }
  return ExitCode.SUCCESS;
};

CLIexecutor(setupCLI, main);
```

---

### 4.2 GitHub Actions実行

```ts
import { ExitCode } from '@esta-core/error-handler';
import { GHAexecutor } from '@esta/esta-executor';
import { setupGHA } from './setup/setupGHA';

const main = async (binaries: string[]): Promise<ExitCode> => {
  for (const bin of binaries) { await install(bin); }
  return ExitCode.SUCCESS;
};

GHAexecutor(setupGHA, main);
```

---

## 5. API仕様

### 5.1 CLIexecutor

```ts
export async function CLIexecutor<T>(
  setup: () => T,
  main: MainHandler<T>,
): Promise<void>;
```

### 5.2 GHAexecutor

```ts
export async function GHAexecutor<T>(
  setup: () => T,
  main: MainHandler<T>,
): Promise<void>;
```

### 動作共通仕様

- `setup()` で入力を構築
- `main()` を呼び出し、`ExitCode` を取得
- `catch` 節では以下のようき分岐する:

```ts
try {
  const input = setup();
  const code = await main(input);
  // exit if needed
} catch (err) {
  if (err instanceof ExitError) {
    execErrorExit(err); // error-handler に委譲
  } else {
    console.error(`[WARN] Unhandled error: ${String(err)}`);
    // exit は行わず、継続可能エラーとして扱う
  }
}
```

---

## 6. エラーハンドリング仕様

- `ExitError` 系のみ `execErrorExit()` にて処理
- その他のエラーは `console.error()` のみでプロセスを継続（exit しない）

---

## 7. 拡張実装例

### DenoExecutor（例）

```ts
export async function DenoExecutor<T>(
  setup: () => T,
  main: MainHandler<T>,
): Promise<void> {
  try {
    const input = setup();
    const code = await main(input);
    Deno.exit(code ?? ExitCode.SUCCESS);
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

## 8. ディレクトリ構成案

```bash
@esta/esta-executor/
├── packages/esta-actions/tools-installer/src/
│   ├── CLIexecutor.ts
│   ├── GHAexecutor.ts
│   ├── DenoExecutor.ts
│   ├── shared/
│   │   └── types.ts     # MainHandler<T> などの型定義
│   └── setup/
│       ├── setupCLI.ts
│       └── setupGHA.ts
├── index.ts
```

---

## 9. 利点まとめ

| 項目            | 説明                                             |
| --------------- | ------------------------------------------------ |
| ✅ mainが単純化 | 実行ロジックと入出力／制御を明確に分離           |
| ✅ 複数環境対応 | CLI、GHA、Deno、Bun など個別 executor で対応可能 |
| ✅ error共通化  | `execErrorExit()` によるログ・exit統一           |
| ✅ 拡張しやすい | `setupXXX`, `ExecutorXXX` 単位での差し替えが可能 |

---

## 10. 今後の拡張予定

| 内容           | 対応方法                       |
| -------------- | ------------------------------ |
| Bun対応        | `BunExecutor()` + `setupBun()` |
| Web対応        | `WebExecutor()` を追加         |
| schema検証導入 | setup関数内で `zod` などを活用 |
| setup共通化    | `@esta/setup-utils` に切り出し |

---

**作成日**: 2025年7月8日
**バージョン**: 1.0.0
**作成者**:

<!-- textlint-disable @textlint-ja/ai-writing/no-ai-list-formatting -->

- 🧠 つむぎ（実行制御設計）
- ⚙️ エルファ（型・exit 制御指針）
- 🧁 小紅（ユースケース検証と構成整理）
