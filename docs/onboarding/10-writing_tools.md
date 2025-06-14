---
title: ライティング支援ツールの設定
description: 文章作成用の品質チェックツール`textlint`,`CSpell`などの設定方法
sidebar_position: 10
---

## 10 ライティング支援ツールの設定

### 10.1 概要

ドキュメントの作成時には、日本語の文章を対象にした品質チェックが重要です。
本プロジェクトでは Markdown 記法を使用するため、次の 3つの観点でチェックしています。

- 日本語表現 (誤字・冗長な表現・用字用語の統一など)
- マークダウン構文 (構造や記法の誤り)
- 英単語のスペル (コードやドキュメント内の英単語)

この章では、上記の品質チェックを担うツールと、その基本的な設定を説明します。

### 10.2 使用ツール一覧

以下のツールを使用して、ドキュメントの品質をチェックしています。<!-- vale off -->

| ツール         | チェック内容             | 目的                                 | 備考                        |
| -------------- | ------------------------ | ------------------------------------ | --------------------------- |
| `textlint`     | 日本語の校正ツール       | 文体、句読点、表記ゆれなどのチェック | カスタムルール対応          |
| `markdownlint` | マークダウン文法チェック | Markdown の構造・記法ミスの検出      | CLI で実行可能              |
| `CSpell`       | スペルチェッカー         | 英単語スペルの誤り検出               | `cspell.config.yaml` を参照 |

*[表2-1] 使用ツール一覧*<!-- vale on -->

> 💡 これらのツールは、[ライティング支援ツールのセットアップ](04_writers-tools.md)で、すでにセットアップされていることを前提としています。

### 10.3 各ツールの使用方法 (コマンドライン)

<!-- vale off -->各ツールは CLI ツールとして実装されています。

本プロジェクトでは、`package.json`にて各ツールに必要なオプションを指定したスクリプトを提供しています。
そのため、`pnpm run <script>`で文章の構成やマークダウン文法をチェックできます。

<!-- vale on -->

| 実行コマンドライン                      | 概要                             | 備考 |
| --------------------------------------- | -------------------------------- | ---- |
| `pnpm run lint:text "docs/**/*.md"`     | 指定ファイルの文法チェック、校正 |      |
| `pnpm run lint:markdown "docs/**/*.md"` | マークダウン文法チェック         |      |
| `pnpm run check:spells "docs/**/*.md"`  | 英単語スペルチェック             |      |

*[表3-1] 各ツールの`pnpm`スクリプト*

> **注意**:
> `pnpm run <script>`コマンドは、プロジェクトルートで実行する必要があります
> 実行時には、ファイルを指定する必要があります
> ファイルの指定に`Glob`が使用できます

### 10.4 `textlint`と基本の設定

`textlint`は、日本語、英語などの自然言語用の校正ツールであり、プラグインを使って、多様な校正ルールを柔軟に追加できます。
とくに日本語のプラグインが充実しており、技術文書の作成に力を発揮します。

本プロジェクトでは、`/configs/textlintrc.yaml` および `/config/.textlint/` 配下の設定ファイル群により、`textlint` のルールを定義・管理しています。

#### `textlint`の主要設定

この節では、本プロジェクトにおける`textlint`の主要な設定を掲載します。

<!-- markdownlint-disable line-length -->

| 設定項目                             | 設定                  | 概要                                               | 備考                   |
| ------------------------------------ | --------------------- | -------------------------------------------------- | ---------------------- |
| comments                             | true                  | コメントでtextlintによる文法エラーを無視できる     |                        |
| preset-ja-technical-writing          |                       | 技術文書を記述するためのルールセット               |                        |
| no-mix-dearu-desumasu                | true                  | 文章内の「である調」「ですます調」を統一する       |                        |
| allowPeriodMarks                     | ":"                   | ":" (半角コロン) を文章の区切りとして扱う          | 箇条書きの前などで使用 |
| ja-space-between-half-and-full-width | 'alphabets', 'number' | 半角英数字の前後に空白を入れる                     |                        |
| textlint-rule-ja-hiraku              | true                  | 読みやすさのため、特定の漢字をひらがなに「ひらく」 |                        |
| ja-no-orthographic-variants          | true                  | 表記ゆれを検出する                                 |                        |
| textlint-rule-no-synonyms            | true                  | 同義語を表記ゆれとして検出する                     |                        |

*[表4-1] `textlint`の主要設定*<!-- markdownlint-enable -->

これらのルールにより、統一感のあるドキュメントを作成できます。

#### `textlint`のエラーの無視

文章によっては、`textlint`によるエラーを無視したい場合があります。
本プロジェクトでは、`textlint-disable`コメントにより特定のエラーを無視させることができます。

以下のように、文章をコメントで囲みます。

```markdown
<!-- textlint-disable textlint-rule-no-mix-dearu-desumasu -->

この文章はである調とですます調が混在しています。

<!-- textlint-enable -->
```

#### `allowlist`によるエラーの無視

[コメントによるエラーの無視](#textlintのエラーの無視) のほかに、指定した文字列、正規表現を使ってエラーを無視させることができます。
ある文字列が、`/configs/.textlint/allowlist.yml`に設定した文字列、および正規表現文字列に合致した場合は
エラーになりません (CI やエディタでの表示も含む)。

現在、`allowlist`には以下が設定されています:

```yaml
- "/[0-9]+[つ回個番版画面行列種章年月日割分%文字段台]/"
```

これにより、"数+数詞"という表現は空白を入れずに入力できます。
たとえば、以下のような表現は通常 `ja-space-between-half-and-full-width` ルールで警告されます:

- ❌ `1年`
- ✅ `1 年`

ですが、`allowlist.yml` により `"1年"` のような数詞表現は例外として扱われます。

#### `prh`による表記ゆれのチェック

本プロジェクトの`textlint`には、`textlint-rule-prh`というプラグインが組み込まれています。
このプラグインは、指定されたルールにしたがって表記ゆれをチェックできます。

たとえば、`/configs/.textlint/dict/prh-my-settings.yml`に下記のルールを追加します。

```yaml
- expected: JavaScript
  pattern: /Javascript/i
  replacements:
    - JavaScript
```

このルールにより、表記を`JavaScript`に統一できます。 (`Javascript`などはエラーになります)

### 10.5 `markdownlint`と基本設定

#### `markdownlint`の概要

`markdownlint`は、マークダウンの文法をチェックするツールです。
ここで使っている`markdownlint-cli2`は、`markdownlint`をコマンドラインから使うツールで、指定したファイルのマークダウンを文法チェックします。
下記のような文章はエラーとなります。

- 文章内にタブ文字が入っている
- 一文の文章が長すぎる (120文字以上)
- 2行以上の空行がある

#### ルールのカスタマイズ

`markdownlint`は、`/configs/.markdownlint.yaml`のルールに基づいて文法チェックをします。
ルールの説明は、[Rules](https://github.com/DavidAnson/markdownlint/blob/v0.32.1/doc/Rules.md) を参照してください。

現在の`.markdownlint.yaml`は、次のようになっています:

```yaml
default: true

# `default: true` は、markdownlint の標準ルールセットをすべて有効にする設定です。
# これにより、公式が推奨する基本的なルールをベースラインとして適用します。
# その上で、個別にルールを追加・上書きし、プロジェクトの要件に合わせてカスタマイズしています。

# lint rules
whitespace: true

# ルールのうち、空白に関するルールをすべて有効にします

line-length:
  line_length: 120
  code_block_line_length: 120

ol-prefix: true

s# スタイル設定
emphasis-style:
  style: asterisk
strong-style:
  style: asterisk

# タブ文字の使用禁止
no-hard-tabs: true
```

**ポイント解説**:

- `default: true`: 標準的な markdownlint ルールを網羅的に有効化します。これにより多くの基本的な文法チェックを自動で行えます。
- `whitespace: true`: マークダウンの空白に関するルールを一括で有効にします。文末の不要な空白、行頭のスペースなどを取り除き、見た目の崩れや誤認識を防ぎ、文書の整合性を保ちます。
- line-length: 120`,`code_block_line_length: 120`:1行当たりの最大文字数を 120文字に制限し、コードブロックにも同じ制限を適用します。
- `no-hard-tabs: true`: タブ文字の混入を防ぎ、コードや文章の整形の一貫性を保ちます。
- `emphasis-style`, `strong-style`: マークダウンで協調表現に使う記号をアスタリスク('*')に統一しています。

#### `markdownlint`のエラーの無視

`markdownlint`では、HTML コメントを使用してエラーを無視できます。
`<!-- markdownlint-disable <rule> -->`で指定したエラーを無視し、`<!-- markdownlint-enable -->`で復帰します。
詳しくは、[markdownlintのREADME](https://github.com/DavidAnson/markdownlint?tab=readme-ov-file#configuration) を参照してください。

### 10.6 `CSpell` と基本設定

`CSpell`は、主にソースコードを対象とした英単語スペルチェッカーです。
ユーザー専用辞書やプロジェクト専用辞書に単語を追加することで、用途に応じた柔軟なスペルチェックが可能です。

#### `CSpell`の基本設定

`CSpell`の`Visual Studio Code (VSCode)`拡張機能は、`.vscode/cspell.json`を自動的に読み込みます。
そのため、基本設定ファイルは`.vscode/cspell.json`として作成しています。

`.vscode/cspell.json`の内容は次の通りです:

```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-types/cspell.schema.json",
  "version": "0.2",
  "import": [
    "${env:XDG_CONFIG_HOME}/vscode/cspell.config.json"
  ],
  "language": "en",
  "caseSensitive": true,
  "dictionaryDefinitions": [
    {
      "name": "project-dic",
      "description": "dictionary for this project",
      "path": "./cspell/dicts/project.dic",
      "addWords": true,
      "scope": "workspace"
    }
  ],
  "dictionaries": [
    "en-us",
    "software-terms",
    "public-licenses",
    "shellscript",
    "vim",
    "user-dic",
    "project-dic"
  ]
}
```

**ポイント解説**:

- import: `cspell.json`は`import`文で外部の設定を読み込むことができます。
  ここでは、環境変数`XDG_CONFIG_HOME`下の`cspell.config.json`を読み込んで、ユーザー専用辞書を設定しています。

- `dictionaryDefinition`: プロジェクト専用辞書を設定しています。ここで設定した`project-dic`では、本プロジェクトでのみ使用する英単語を追加します。

- `dictionaries`: 単語チェックに使用する辞書を指定します。
  拡張辞書: <https://github.com/streetsidesoftware/cspell-dicts> は、`HTML`,`CSS`などの技術用語の単語のスペルチェックに使用されます。

#### ユーザー辞書の設定

環境変数`XDG_CONFIG_HOME` (通常、`~/.config`) 下の`cspell.config.json`を読み込むことで、ユーザー専用辞書が使用できます。
ユーザー専用辞書に、自分のハンドルなど専用で使う単語を登録することで、その単語に関してエラーを出さないようにできます。

`cspell.config.json`の内容は、次の通りです:

```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-types/cspell.schema.json",
  "version": "0.2",
  "language": "en",
  "caseSensitive": true,
  "dictionaryDefinitions": [
    {
      "name": "user-dic",
      "description": "dictionary words for user settings",
      "path": "${env:XDG_CONFIG_HOME}/vscode/cSpell/dicts/user.dic",
      "addWords": true,
      "scope": "user"
    },
    {
      "name": "textlint-dic",
      "description": "Dictionary: textlint words for plugin name, ...",
      "path": "${env:XDG_CONFIG_HOME}/vscode/cSpell/dicts/textlint.dic",
      "addWords": true,
      "scope": "user"
    }
  ],
  "dictionaries": [
    "en-us",
    "software-terms",
    "public-licenses",
    "shellscript",
    "vim",
    "user-dic",
    "textlint-dic",
    "project-dic"
  ],
  "useGitignore": true
}
```

**ポイント**:

- `dictionaryDefinitions`: ユーザー専用辞書`user-dic`, `textlint-dic`を設定しています。
- `dictionaries`: プロジェクトで使用する辞書を設定しています。`cspell.json`で上書きされるため、ここの設定は無視されます。
- `useGitignore`: `.gitignore`で指定したファイルを cspell の英単語チェックから除外します。

> ※ 補足
>
> - `dictionaries` は設定ファイルで明示的に指定すると、それまでの辞書設定を上書きします。複数の設定ファイルを使う場合は、辞書の指定が競合しないよう注意してください。
> - `useGitignore` を `true` に設定すると、コマンドラインや CI 実行時には `.gitignore` に記載されたファイルがスペルチェック対象から除外されます。ただし、VSCode の CSpell 拡張機能は開いているファイルをリアルタイムにチェックするため、除外ファイルであっても編集画面上はチェックが動作します。
>   VSCode 上で除外したい場合は、拡張機能の設定やワークスペース設定で別途ファイル除外を設定してください。

### 10.7 ライティング支援ツールに関するチェックポイント

この節では、本章で紹介したライティング支援ツールの基本的な運用に関して、確認しておきたいポイントをまとめます。
オンボーディング完了後、以下の各項目を自分で実行・確認できれば、ツールの基本的な利用ができていると判断できます。

#### ✅ 実施確認リスト

- [ ] `pnpm run lint:text` を使って、文章の文法と文体をチェックできる
- [ ] `pnpm run lint:markdown` を使って、Markdown 構文の整合性をチェックできる
- [ ] `pnpm run check:spells` を使って、英単語のスペルを検査できる
- [ ] `textlint-disable` コメントでルールを一時的に無効化できることを理解している
- [ ] `allowlist.yml` による例外設定が機能していることを確認できる
- [ ] `.vscode/cspell.json` や `cspell.config.json` を編集して辞書をカスタマイズできる

> 💡 チェックリストは、ドキュメントの校正だけでなく、CI の整合性エラー回避にも役立ちます。
