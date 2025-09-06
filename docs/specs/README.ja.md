---
header:
  - src: docs/specs/README.ja.md
  - "@(#) : ESTA Specifications Documentation Guidelines"
title: /docs/specs/ 仕様書作成ガイドライン
description: ESTAプロジェクトの仕様書作成における統一運用ルールとスタイルガイド
version: 1.0.0
authors:
  - 👤 atsushifx（ガイドライン作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 📘 仕様書作成ガイドライン (日本語版)

このドキュメントは、`docs/specs/*.spec.md` 形式で作成される **仕様書の統一運用ルール** を定めたものです。日本語で記述された仕様書向けに、構造や命名規則、記述スタイルを整理しています。

### 📁 対象ディレクトリ

```bash
docs/specs/
├── @esta-core-tools-config.spec.md
├── @esta-core-cli.spec.md
└── ...
```

### 🧩 ファイル命名規則

- フォーマット：`<@スコープ>-<パッケージ名>.spec.md`
  - 例：`@esta-core-tools-config.spec.md`
- ``/`を Markdown安全な形式に置き換えるため、`--`で区切る

---

### 🧾 フロントマター (仕様書ヘッダ)

すべての仕様書ファイルは、以下の YAML フロントマターを先頭に記述します。

```yaml
---
header:
  - src: docs/specs/@esta-core--tools-config.spec.md
  - @(#) : ESTA Install Tools configuration reader
title: 🔧 ツール設定統合管理仕様書（@esta-core/tools-config）
version: 1.0.0
created: 2025-07-14
updated: 2025-07-14
authors:
  - 🤖 Claude（初期設計・API仕様策定）
  - 👤 atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-14: 初回作成（GitHub issue #94 対応）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---
```

#### ✅ フィールド解説

| フィールド    | 内容・目的                             |
| ------------- | -------------------------------------- |
| `header.src`  | 対象ファイルのパス。識別・検索用       |
| `header.@(#)` | grep互換の識別コメント (CLI・UNIX向け) |
| `title`       | 仕様書のタイトル。絵文字付きも可       |
| `version`     | 文書のバージョン                       |
| `created`     | 初版作成日                             |
| `updated`     | 最終更新日                             |
| `authors`     | 著者・AI含む役割付きリスト             |
| `changes`     | 更新履歴 (日時と要約)                  |
| `copyright`   | 著作権・ライセンス表記                 |

#### 💡 補足ルール

- `authors`は AI（例: Claude, GPT）も含めて記録可能
- 絵文字や強調を適度に使い、可読性を意識
- 検索性を考慮し、`@(#)`内にはユニークな識別子を含める

### ✍️ 今後の拡張案

- フロントマターに `tags:` フィールドを追加（機能分類や関連リンク）
- Markdown から自動インデックス化（Docs ページ生成など）

### 👤 運用責任者

- メンテナ：`atsushifx`
- 連絡先：[https://github.com/atsushifx](https://github.com/atsushifx)

以上。すべての仕様書はこの規約に基づいて整備・管理されます。
