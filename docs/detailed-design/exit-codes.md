---
header:
  - src: docs/detailed-design/exit-codes.md
  - @(#): Exit Code 仕様書（POSIX準拠・@esta-core/error-handler）
title: Exit Code 仕様書
description: @esta-core/error-handlerモジュールで使用する終了コード（ExitCode）の定義と使用方針。POSIX/Bash/GNU標準との競合を避け、保守性・互換性を確保するための仕様。
version: 1.2.0
created: 2025-07-09
authors:
  - atsushifx
changes:
  - 2025-09-04: フロントマター追加とH1→H2変更
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

この文書では、`@esta-core/error-handler` モジュールで使用する終了コード（ExitCode）の定義と使用方針を示します。
本仕様は POSIX/Bash/GNU 標準との競合を避け、保守性・互換性を確保するために設計されています。

---

## 基本方針

- `0`：正常終了（`SUCCESS`）
- `1`：実行失敗（`EXEC_FAILURE`）
  → 通常の `try/catch` で未補足例外が発生した場合に使用
- `2〜10`：**予約領域（使用禁止）**
  → POSIX, Bash, GNU による標準コードと競合の可能性があるため
- `11〜99`：**@esta-core 独自の終了コード定義**
- `100〜199`：将来拡張用予約領域（新機能・サービスごとに定義）

---

## Exit Code 一覧（定義テーブル）

| コード | 識別子                    | 説明                               |
| ------ | ------------------------- | ---------------------------------- |
| `0`    | `SUCCESS`                 | 正常終了                           |
| `1`    | `EXEC_FAILURE`            | 一般的な実行失敗（未補足例外など） |
| `11`   | `CONFIG_NOT_FOUND`        | 設定ファイルが見つからない         |
| `12`   | `COMMAND_EXECUTION_ERROR` | 外部コマンドの実行に失敗           |
| `13`   | `INVALID_ARGS`            | 不正な引数（未指定・形式不正など） |
| `14`   | `VALIDATION_FAILED`       | 入力バリデーションに失敗           |
| `15`   | `FILE_IO_ERROR`           | ファイルの読み書きに失敗           |
| `16`   | `INTERNAL_LOGIC_ERROR`    | 論理的な不整合・状態異常           |

---

## 使用指針

### コード選択の基準

- **0**: 正常終了（すべての処理が成功）
- **1**: 未補足例外、予期しない致命的な異常
- **11〜**: 明示的に意味付けされた終了コードを利用

### 使用例（TypeScript）

```ts
import { errorExit, ExitCode } from '@esta-core/error-handler';

// 設定ファイルが見つからない
errorExit(ExitCode.CONFIG_NOT_FOUND, '設定ファイルが見つかりません');

// 外部コマンド実行で失敗
errorExit(ExitCode.COMMAND_EXECUTION_ERROR, 'git pull に失敗しました');

// 無効な引数
errorExit(ExitCode.INVALID_ARGS, '--target は必須です');
```

---

## Executorとの連携

`CLIExecutor`, `GHAExecutor` にて `ExitError` を補足し、
対応する終了コードを `process.exit()` または `@actions/core.setFailed()` に変換します。

```ts
try {
  await main();
} catch (err) {
  if (err instanceof ExitError) {
    process.exit(err.code);
  } else {
    process.exit(ExitCode.EXEC_FAILURE);
  }
}
```

---

## 将来拡張ルール

- `100〜199` は将来の拡張用に予約
- 拡張時は以下の原則に従うこと

### 拡張原則

1. **2〜10の範囲は使用禁止（標準コードと競合）**
2. **カテゴリごとに連番でまとめて定義**
3. **この仕様書に必ず追記すること**
4. **標準との競合を追加前に必ず確認**

---

## 参考資料

- [POSIX.1-2017 - exit(3)](https://pubs.opengroup.org/onlinepubs/9699919799/functions/exit.html)
- [GNU Coding Standards - Error Reporting](https://www.gnu.org/prep/standards/html_node/Errors.html)
- [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/exitcodes.html)

---

**バージョン**: 1.2
**作成日**: 2025年7月9日
**最終更新**: 2025年9月5日
**管理者**: [`@esta-core/error-handler`](https://github.com/esta-core/error-handler)
**作成者**:

- 🧠 つむぎ（設計・分類整理）
- 🧁 小紅（用語統一・利用例記述）
- ⚙️ エルファ（POSIX準拠・標準調査）
