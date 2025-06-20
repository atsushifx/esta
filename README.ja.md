---
title: Easy Setup Tools Action
description: Install CLI tools easily via config, powered by eget.
slug: easy-setup-tools-action
tags:
  - setup
  - installer
  - action
  - eget
  - tools
---

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

[English](README.md) | 日本語

<!--  textlint-enable -->

## Easy Setup Tools Action（日本語版）

> 設定ファイルを使って、CLIツールを簡単にインストールできる GitHub Actions。
> 現在は [eget](https://github.com/zyedidia/eget) に対応しています。

### 🤝 プロジェクトへの参加

このプロジェクトに貢献したい方は、[コントリビューションガイドライン](CONTRIBUTING.ja.md)をご覧ください。バグ報告、機能提案、プルリクエストの方法について詳しく説明しています。

### 📚 開発者向け情報

開発環境の構築手順と開発ガイドラインについては、[オンボーディングドキュメント](docs/onboarding/README.ja.md)をご覧ください。

---

### 🚀 使い方（GitHub Actions）

```yaml
uses: atsushifx/easy-setup-tools-action@v1
with:
  config: .github/tool-configs.json
  tools: just,fd
```

---

### 📂 ツール設定ファイルの例（`tool-configs.json`）

```json
[
  {
    "installer": "eget",
    "name": "just",
    "package": "casey/just",
    "options": {
      "version": "latest",
      "installDir": ".tools/bin",
      "args": ["--quiet"]
    }
  }
]
```

---

### ✅ サポートされているインストーラー

- `eget`（対応済み）
- `script`（今後対応予定）

---

### 🛠 設定スキーマの仕様

| フィールド           | 説明                                                | 必須 |
| -------------------- | --------------------------------------------------- | ---- |
| `installer`          | 使用するインストーラー。現時点では `"eget"` のみ    | ✅   |
| `name`               | ツールの識別名。`tools:` 入力と一致させる必要あり   | ✅   |
| `package`            | GitHub 上のパッケージ指定（例: `casey/just`）       | ✅   |
| `options.version`    | インストールするバージョン。`"latest"` またはタグ名 | ❌   |
| `options.installDir` | インストール先ディレクトリ（例: `.tools/bin`）      | ❌   |
| `options.args`       | インストーラーに渡す追加の引数（例: `["--force"]`） | ❌   |

> ❌ 現在、`rename` は **未対応** です。

---

### 📦 補足

- `with.tools` で指定されたツール名だけがインストール対象になります。
- 複数ツールが同時に指定された場合は並列処理されます。
- 各設定は `name` をキーとして照合されます。

---
