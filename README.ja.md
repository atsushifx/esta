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

### 🔧 /kiro を使用したESTAシステムリストラクチャリング

このプロジェクトは段階的なリストラクチャリングを実行中です。各PhaseはClaude Codeの`/kiro`コマンドで実行できます。

#### 基本実行コマンド

```bash
/kiro "Execute [Phase名] according to specifications in docs/.cc-kiro/restructure-plan/[phase-file].md"
```

#### Phase実行順序

```bash
# Phase 1: 基盤構築 - エラーハンドリングとランタイム抽象化
/kiro "Execute Phase 1: Create foundation packages (@esta-runtime, @esta-error/error-handler, @esta-error/exit-code) with unified error handling and cross-runtime abstraction according to docs/.cc-kiro/restructure-plan/phase01-foundation.md"

# Phase 2: 機能統合 - 重複パッケージの統合
/kiro "Execute Phase 2: Create integration packages (@esta-config, @esta-validation, @esta-path-utils, @esta-fs-utils) to consolidate duplicate functionality according to docs/.cc-kiro/restructure-plan/phase02-integration.md"

# Phase 3: アプリケーション統合 - ツールインストーラーとコマンドランナーの統合
/kiro "Execute Phase 3: Create application packages (@esta-tools/installer, @esta-tools/command) with enhanced functionality and GitHub Actions integration according to docs/.cc-kiro/restructure-plan/phase03-application-integration.md"

# Phase 4: システム・アクション強化 - GitHub Actions機能とシステム機能の強化
/kiro "Execute Phase 4: Create unified packages (@esta-cli, @esta-github-actions) with comprehensive testing framework and quality assurance according to docs/.cc-kiro/restructure-plan/phase04-system-actions.md"

# Phase 5: 最適化・ドキュメント整備 - パフォーマンス最適化と完全移行
/kiro "Execute Phase 5: Perform optimization, documentation, and cleanup to complete the restructuring with performance improvements and comprehensive documentation according to docs/.cc-kiro/restructure-plan/phase05-unified-packages.md"
```

#### リストラクチャリング目標

- **パッケージ数削減**: 27個 → 15個 (44%削減)
- **重複コード削減**: 40-50%削減
- **ビルド時間改善**: 現在比20%改善
- **統一エラーハンドリング**: EstaError + タプル型による一貫したパターン
- **ランタイム対応**: Node.js/Deno/Bun/GitHub Actions完全対応

詳細については [リストラクチャリング計画](docs/.cc-kiro/restructure-plan/README.ja.md) をご覧ください。

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
