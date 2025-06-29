---
title: 最初のテストを書く
description: fixtureを使ったE2Eテストの最小構成を作成して実行します。
sidebar_position: 4
---

## 4. 最初のテストを書く

この章では、最小限のファイルで E2E Fixture テストを作成する手順を説明します。

---

### ✍ ステップ 1：テストディレクトリを用意

まずは、テストケース用のフォルダを作成します。

```
tests/e2e/fixtures/hello-world/
```

---

### 📄 ステップ 2：`input.md` を作成

Markdownファイルを1つ用意します。

```md
# Hello, Fixture!

This is a basic E2E test for markdown parsing.
```

---

### 📄 ステップ 3：`output.json` を作成

次に、想定される出力結果をJSONで記述します（パーサ仕様に従って構造化）。

```json
{
  "type": "markdown",
  "expected": {
    "properties": {
      "hasHeading": true,
      "hasCode": false
    }
  }
}
```

> 🔍 これは `hasHeading`, `hasCode` というプロパティを検出させる想定です。

---

### 🚀 ステップ 4：テストを実行

テストランナー（例：`vitest`）を起動すると、以下のように出力されます：

```bash
> pnpm test

✓ hello-world: passes all expectations
```

---

### ✅ これで完了！

最小限の構成で、1つの入力→1つの期待出力によるE2Eテストが完成しました。
複数のテストケースを追加する場合は、同様のディレクトリを並列に配置するだけです。

---
