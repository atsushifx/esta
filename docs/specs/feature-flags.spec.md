<!--
  src: docs/specs/feature-flags.spec.md

  Copyright (c) 2025 atsushifx
  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

# 📘 FeatureFlags モジュール設計仕様書

## 1. 概要

<!-- textlint-disable ja-technical-writing/sentence-length -->

`FeatureFlags` は、ESTA 実行環境 (GitHub Actions / CLI) や設定レベル (テストモード・開発モード) を判定・管理するためのグローバル機能フラグユーティリティです。

本モジュールは「静的に環境を一度だけ判定」し、全体で共有されるキャッシュとして保持されます。

<!-- textlint-enable -->

---

## 2. 利用目的

| 用途                       | 説明                                           |
| -------------------------- | ---------------------------------------------- |
| 実行環境の判定             | GHA / CLI / Deno / Bun など                    |
| 環境依存の分岐             | executor や setup モジュール内で条件分岐を実装 |
| ログレベルや設定の自動適用 | NODE_ENV, CI などによる挙動調整                |
| テスト用の環境切り替え     | `setContext()` によるモック可能な設計          |

---

## 3. 判定対象

| 判定種別          | 定義値                 | 判定内容                    |
| ----------------- | ---------------------- | --------------------------- |
| `runtime`         | GHA / CLI / DENO / BUN | 実行基盤の識別              |
| `isGitHubActions` | boolean                | `GITHUB_ACTIONS === 'true'` |
| `isCLI`           | boolean                | 上記以外の Node 実行環境    |
| `isDeno`          | boolean                | グローバル `Deno` 存在判定  |
| `isBun`           | boolean                | グローバル `Bun` 存在判定   |
| `isTest`          | boolean                | `NODE_ENV === 'test'`       |

---

## 4. 型定義

```ts
export enum RuntimeEnv {
  GITHUB_ACTIONS = 'GHA',
  CLI = 'CLI',
  DENO = 'DENO',
  BUN = 'BUN',
}

export type FeatureContext = {
  runtime: RuntimeEnv;
  isGitHubActions: boolean;
  isCLI: boolean;
  isDeno: boolean;
  isBun: boolean;
  isTest: boolean;
};
```

---

## 5. API設計

### 5.1 FeatureFlags クラス

```ts
export class FeatureFlags {
  static get context(): FeatureContext;
  static setContext(mock: FeatureContext): void;
  static resetContext(): void;
}
```

#### context

- 初回呼び出し時に `detectRuntime()` により初期化され、以後はキャッシュとして再利用される
- `runtime` は `GHA`, `CLI`, `DENO`, `BUN` のいずれか

#### setContext(mock)

- テスト用の上書き用関数（手動で FeatureContext を設定）
- E2E・ユニットテスト中のモック用途

#### resetContext()

- キャッシュを初期化して再検出させたい場合に使用

---

## 6. 実装例

```ts
if (FeatureFlags.context.isGitHubActions) {
  // GHA専用の処理
}
```

```ts
if (FeatureFlags.context.runtime === RuntimeEnv.DENO) {
  // Deno固有処理
}
```

---

## 7. 拡張計画

| 項目                      | 内容                                |
| ------------------------- | ----------------------------------- |
| CI/CDプラットフォーム識別 | CircleCI, TravisCI などの判定拡張   |
| 設定ファイル連携          | `.esta-env.json` などからの読み込み |
| runtimeラベル拡張         | Web, Lambda, Edge など対応を視野に  |

---

## 8. 使用上の注意

- **contextの変更は明示的に `setContext()` を使うこと**
- `context` の中身は immutable として扱う（再設定しない）
- `FeatureFlags` はユーティリティモジュールであり、依存注入は不要

---

## 9. ディレクトリ配置

```bash
shared/
└── runtime/
    ├── FeatureFlags.ts
    └── types.ts
```

---

## 10. 補足: 判定ロジック

```ts
private static detectRuntime(): RuntimeEnv {
  if (typeof Deno !== 'undefined') return RuntimeEnv.DENO;
  if (typeof Bun !== 'undefined') return RuntimeEnv.BUN;
  if (process.env.GITHUB_ACTIONS === 'true') return RuntimeEnv.GITHUB_ACTIONS;
  return RuntimeEnv.CLI;
}
```

---

## 11. 作成者

<!-- textlint-disable -->

- 🧠 つむぎ（実行環境検出の最適化）
- ⚙️ エルファ（判定精度とパフォーマンスレビュー）
- 🧁 小紅（テスト観点とセットアップガイド寄与）
  <-- textlint-enable -->

---

**作成日**: 2025年7月8日
**バージョン**: 1.0.0
