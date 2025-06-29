---
title: Fixture構成ルール
description: 入力と出力ファイルの配置・命名・無効化ルールについて解説します。
sidebar_position: 3
---

## 3. Fixture構成ルール

この章では、テストケースを構成するディレクトリとファイルの命名・配置ルールについて説明します。

---

### 📁 ディレクトリ構造

基本的な構成は以下のようになります：

```
tests/e2e/fixtures/
  ├─ simple-markdown/
  │   ├─ input.md
  │   └─ output.json
  └─ multiline-text/
      ├─ input.txt
      └─ output.json
```

- 各テストケースは **1つのサブディレクトリ** にまとめられます。
- ディレクトリ名がテスト名として扱われます（例: `simple-markdown`）。

---

### 📄 ファイル命名ルール

| ファイル名    | 意味・用途                               |
| ------------- | ---------------------------------------- |
| `input.md`    | Markdown形式の入力データ                 |
| `input.txt`   | プレーンテキスト形式の入力データ         |
| `output.json` | パーサが出力すべき期待結果（構造を含む） |

> ✅ 任意で `input.json`, `meta.json` などを追加することも可能です（パーサ側で解釈する場合）。

---

### 🚫 無効化・スキップ規則

以下のパターンに該当するファイルやディレクトリは、**テストから除外されます**：

- `#` で始まるディレクトリやファイル名（例：`#disabled-test/`）
- `output.json` が存在しないケース（入力専用の場合は別途設定が必要）

---

### 📦 Flat構成とカテゴリ構成

#### Flat構成例：

```
fixtures-flat/
  ├─ heading-1/
  ├─ heading-2/
```

#### Categorized構成例：

```
fixtures/
  ├─ markdown/
  │   ├─ heading/
  │   └─ list/
  └─ plaintext/
      ├─ basic/
      └─ multi-line/
```

使用するスキャナ関数により、どちらも自動的に認識されます。

---

### 💡 補足

- `input/output` の組み合わせは1:1です（複数出力は現在非対応）
- JSONの構造は厳密に一致する必要があります（Diff方式）
