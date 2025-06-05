---
title: CI/CDでの自動検証ツール
description: CI/CD実行時に使用するツールとその設定
sidebar_position: 11
---

## 11 CI/CDでの自動検証ツール

### 11.1 はじめに

本章では、本プロジェクトの CI/CD パイプラインにおいて使用する自動検証ツールと、その設定方法について説明します。

本プロジェクトは GitHub でホスティングしているため、CI/CD は GitHub Actions にて実現しています。

### 11.2 主なGitHub Actionsと使用ツール

現在、CI に使用している GitHub Actions を掲載します。あわせて、GitHub Actions で使用しているツールも掲載します。

| GitHub Actions       | 使用目的                           | 使用ツール | 備考                                      |
| -------------------- | ---------------------------------- | ---------- | ----------------------------------------- |
| ci-secrets-scan.yaml | 機密情報の漏洩チェック             | Gitleaks   | 　オプション指定のためCLIでGitleaksを使用 |
| ci-lint.yaml         | コードの静的解析による品質チェック | ESLint     | 'pnpm run`経由で使用                      |

### 11.3 CI/CD ワークフローの概要

現状、本プロジェクトの GitHub Actions は以下の検証を主に自動化しています。

- コードの静的解析（ESLint による Lint チェック）
- 機密情報の漏洩検査（Gitleaks を使用）

これらは、プルリクエスト作成時にトリガーされ、問題の早期発見に寄与しています。

今後は以下のワークフローの実装・追加を計画しています。

- 単体テストの自動実行（Vitest など）
- コードフォーマットの自動チェック（dprint）
- PR に対する自動レビュー支援（Danger.js）
- 機密情報チェックの二重化（Secretlint）

これらは Issue として管理し、段階的に対応予定です。

### 11.4 機密情報漏洩チェック（ci-secret-scan)

機密情報漏洩チェック (`ci-secrets-scan`) は、機密情報スキャンツール`Gitleaks`を使って機密情報が含まれていないかスキャンする GitHub Actions です。

#### `ci-secret-scan`のポイント委

`ci-secret-scan`には、次のような特徴が有ります。

- 全ブランチの`push`時をトリガーにしている:
  push をおこなうブランチすべてを対象にすることで、パスワードなどの機密情報の漏洩を防いでいます。

- Gitleaks を CLI で使用:
  コマンドラインでオプションを付けて実行することで、自分の環境に合わせたスキャンをしています。

- Fail 時にレポートをアップロード:
  Gitleaks は機密情報が見つかったときはエラーで終了します。このとき、Actions はスキャン結果レポートを`json`型式でアップロードします。
  レポートを見ることで、どのような情報が漏洩したかをチェックできます。

#### `Gitleaks`のオプション

以下のコマンドは、`ci-secret-scan`で使用している Gitleaks コマンドです。

```bash
gitleaks protect \
  --source=. \
  --config=./configs/gitleaks.toml \
  --report-path=.github/report/gitleaks-report.json \
  --exit-code=1 \
  --verbose
```

それぞれのオプションの意味は次の通りです。

- `--source=.`:
  スキャン対象のソースコードのルートディレクトリを指定します。ここではカレントディレクトリを意味し、リポジトリ全体を対象としています。

- `--config=./configs/gitleaks.toml`:
  Gitleaks の設定ファイルを指定します。ここにスキャンルールや除外パターンなどが記述されており、プロジェクトに適したチェック内容を定義しています。

- `--report-path=.github/report/gitleaks-report.json`:
  スキャン結果のレポートファイルの出力パスを指定します。CI 環境でレポートを収集し、後から問題の詳細を確認できるようにします。

- `--exit-code=1`:
  機密情報が検出された場合に終了コード 1 でプロセスを終了します。これにより CI ジョブを失敗扱いにして、問題を自動的に検知可能にします。

- `--verbose`:
  詳細なログ出力を有効にします。問題発生時のトラブルシューティングやスキャン状況の確認に役立ちます。

#### `gitleaks.toml`による機密情報チェック

`gitleaks.toml`では、Gitleaks の動作が設定されています。また、`[[rules]]`では、検査する機密情報が設定されています。
本プロジェクトでの`gitleaks.toml`は、次の通りです。

```toml
title = "Gitleaks config"

[[allowlists]]
paths = [
  "'''node_modules/.*'''"
]

level = "warn"
redact = true

[detect]
secrets = true
entropy = true

[[rules]]
id = "github-token"
description = "GitHub Token"
regex = '''ghp_[0-9a-zA-Z]{36}'''
tags = ["key", "GitHub"]

[[rules]]
id = "aws-secret-key"
description = "AWS Secret Access Key"
regex = '''(?i)aws(.{0,20})?(?-i)['"][0-9a-zA-Z/+]{40}['"]'''
tags = ["key", "AWS"]

[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key)(.{0,20})?['"][0-9a-zA-Z]{16,45}['"]'''
tags = ["key", "generic"]

[[rules]]
id = "password-variable"
description = "Generic password variable"
regex = '''(?i)(password|passwd|pwd)['"]?\s*[:=]\s*['"].{6,}['"]'''
tags = ["password", "generic"]
```

**ポイント**:

- `[[allowlist]]`:
  - paths: スキャンをしないディレクトリ、ファイルを指定します。今回は、`node_modules`下のファイルはスキャンしません
- `[detect]`: 検出設定
  - `secrets = true`: 既知のパターンに基づき、秘密情報の検出を有効化します
  - `entropy = true`: エントロピーの高い (=ランダムな) 文字列を検出します。未知のシークレット情報を発見しやすくなります
- `[[rules]]`: 指定したルール (正規表現) に合致した文字列を秘密情報として検出します。
  - `id = ""aws-secret-key"`: AWS のシークレットキーを検出
  - `id = "generic-api-key"`: 汎用的な API キーの検出
  - `id = ""password-variable"": パスワード (変数名に password を含み、6文字以上の文字列を代入している文)を検出

これらの設定により、代表的な機密情報やパスワードの誤コミットを防止できます。
また、除外ルールでノイズを減らしつつ、発見精度を高める工夫をしています。

### 11.5 コード解析ツール (`ci-lint`)

`ci-lint` は、プルリクエストの作成や更新時に自動でコードの静的解析をする GitHub Actions ワークフローです。

#### ワークフローの概要

以下のステップを実行し、ESLint を実行して解析結果を出力するという基本的な CI となっています。

- 開発環境設定
- コードのチェックアウト
- 依存関係のインストール
- ビルド
- `lint`の実行
- 出力チェック
- レポートアップロード (`error`, `warning`があったとき)

#### 運用ポイント

- Lint によるコード品質チェックを自動化することで、問題の早期発見と修正を促進します。
- Lint は、`package.json`上に実装された`pnpm run`スクリプトで実行されています。これにより、ルールの共有、一元化が実現しています。
- 今後の拡張として、キャッシュによるビルドの高速化、スペルチェックなどのほかの政敵か軌跡の組み込みも検討しています。

このワークフローにより、コードベースの品質維持と開発効率の向上が期待されます。

### 11.6 理解度チェック

以下の項目にチェックを入れて、自分の理解度を確認しましょう。

- [ ] 本プロジェクトで現在実装している GitHub Actions ワークフローとその役割を説明できる
- [ ] Gitleaks の `--exit-code=1` オプションの意味を理解している
- [ ] `gitleaks.toml` の `[[allowlists]]` の内容と目的を説明できる
- [ ] `ci-lint.yaml` ワークフローの手順 '(設定、依存インストール、Lint 実行など) を理解している
- [ ] ワークフロー失敗時にレポートやログから問題点を確認する方法を理解している

---

このチェックリストでほとんどの項目にチェックがつけば、本章の内容をしっかり理解していると言えます。
必要に応じて該当箇所を読み返して復習しましょう。
