---
title: フレームワーク全体像
description: E2E Fixture Framework の設計思想、構成、テスト実行の流れを解説します。
sidebar_position: 2
slug: /overview
---

## 第2章 フレームワーク全体像

この章では、E2E Fixture Framework がどのような目的と設計方針で作られているのか、
そして fixture を使ったテストがどのように実行・検証されるのかを説明します。

---

### 🎯 設計の目的

E2E Fixture Framework は、ESTA内の各パッケージで一貫した方式でE2Eテストを行うために設計されました。

#### ✅ 主な目的

- **テストデータ（input/output）をコードから分離**し、管理しやすくする
- **同じ処理に対して複数のケースを網羅的に検証**できるようにする
- **構文解析・変換処理などの複雑なロジックを対象に、出力の安定性を保証**する
- **テストケースの追加・変更が簡単で再現性が高い構造**を実現する

---

### 🧩 構成要素の概要

| コンポーネント          | 役割                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| `fixtures/`             | テストデータ一式（input / output）を格納するディレクトリ               |
| `AgE2eFixtureFramework` | テストの実行を管理するフレームワーク本体                               |
| `AgE2eFileReader`       | 入力ファイルと期待出力（output.json）を読み込む                        |
| `fixtureRunner`         | 各テストケースに対して検証を行うランナー（内部でバリデータを呼び出す） |
| `validators/`           | テキスト種別ごとの検証ロジック（例：Markdown, PlainText など）         |

---

### 🔁 テストの処理フロー

1. **入力データ (input.md など) と期待出力 (output.json) を `fixtures/` に用意**

2. `runAllFoundTests()` により対象ディレクトリが検出される

3. 各テストケースについて、以下の流れで処理が実行される:
   ```text
   [fixtures/basic/input.md]
     ↓
   [AgE2eFileReader] で読み取り
     ↓
   [AgE2eFixtureFramework] が testFunction を実行
     ↓
   [validator] によって output.json との一致を検証
   ```

### 💡 テストケースの考え方

- **入力と期待出力を並べて保存**するだけなので、ケースの追加が簡単
- **validator を差し替えることで、多様な出力形式にも対応可能**
- `output.json` には自由な構造を記述できるため、抽出結果、トークン列、構文ツリーなど幅広く対応

### 📁 推奨ディレクトリ構造

E2E Fixture Framework では、テストケースの整理・再利用性を高めるために
**カテゴリ階層ごとにディレクトリを分けて構成する**ことを推奨しています。

#### 📁 推奨ディレクトリ構造

```bash
tests/
├── e2e/
│   ├── framework.e2e.spec.ts        ← テストスクリプト（全fixtureを対象）
│   └── fixtures/                    ← フィクスチャのベースディレクトリ
│       ├── markdown/                ← 大分類（例：Markdownパーサ用）
│       │   ├── headings/            ← 中分類（例：見出し抽出）
│       │   │   └── simple-h1/       ← テストケース名
│       │   │       ├── input.md
│       │   │       └── output.json
│       │   └── links/               ← 中分類（例：リンク抽出）
│       │       └── nested-links/
│       └── plaintext/
│           └── line-count/
│               └── basic-case/
```

#### 💡 ポイント

- `fixtures/` 以下に**カテゴリ単位の階層構造**を持たせることで、整理・拡張がしやすくなります
- 最終的に `runAllFoundTests()` では、**2階層下（sub-category/testcase）**まで自動検出されます
- フォルダ名はそのままテストケース名としてログ等に表示されます (例：markdown/headings/simple-h1)

#### 🚫 除外したい場合は？

- 一時的に除外したいディレクトリには # を先頭に付けてください：

```bash
fixtures/
└── markdown/
    └── #drafts/   ← このディレクトリはテスト対象外
        └── old-case/
```

この構成をベースにすることで、**新しいカテゴリの追加**や**テストカバレッジの拡大**が容易になります。
次章では、こうした構造をどのようにコードとして整備するかを見ていきましょう👇
