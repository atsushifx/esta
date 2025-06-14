---
title: コミット前のチェックツール
description: lefthook, commitlint などコミット前のチェックツールの概要と設定
sidebar_position: 12
---

## 12 コミット前のチェックツール

### 12.1 コミット前チェックツールの概要

このプロジェクトで使用しているコミット前のチェックツールやコミットメッセージ用のリントツールについて解説します。
これらのツールは、コードの品質やコミットメッセージの一貫性を保つために、開発者がコミット操作を行う際に自動的に実行されます。

主な目的は以下の通りです。

- 不適切なコードや設定のコミットを防止する
- コミットメッセージのフォーマットや内容を統一する
- チーム全体の品質維持と開発フローの効率化

本プロジェクトでは、`lefthook` と `commitlint` を中心にこれらの目的を実現しています。

### 12.2 `Lefthook`の概要とコミットフック

`Lefthook` は、高速で柔軟な Git フックマネージャーであり、本プロジェクトでは主にコミットやプッシュ前の自動チェックを実行するために利用しています。

#### Lefthookの役割

- Git のフック機能を簡単に管理し、スクリプトやコマンドをそれぞれのフックのタイミングで実行可能にします。
- コミット前 (`pre-commit`) やコミットメッセージ編集 (`commit-msg`) で実行する処理を一元管理し、チームの開発ルールを強制できます。
- 高速で動作するため、開発者の作業フローへの負荷を最小限に抑えます。

#### コミットフックマネージャーとしての処理内容

- **機密情報の検査**
  `Secretlint` や `Gitleaks` と連携し、誤って機密情報がコミットされないようにチェックします。

- **コードの静的解析（Lint）**
  コミット前に ESLint などの静的解析ツールを実行し、コード品質をチェックします。

- **コミットメッセージの検証**
  `commitlint` と連携し、コミットメッセージのフォーマットが規約に沿っているかを検証します。

これらの処理を Lefthook がまとめて管理し、コミット・プッシュのたびに自動実行することで、開発品質の担保と効率化を実現しています。

### 12.3 `Lefthook`の設定

Lefthook はリポジトリルート上の `lefthook.yml` でコミットフックを管理します。
各タグ（`pre-commit`、`commit-msg`）はフックが発生するタイミングを表しており、そのタイミングで実行するコマンドを YAML 形式で記述します。
各コマンドは並列に実行できるため、高速なパフォーマンスで品質管理を実現しています。

本プロジェクトでの `lefthook.yml`は、次の通りです:

```lefthook.yml
pre-commit:
  parallel: true
  commands:
    gitleaks:
      run: gitleaks protect --config ./configs/gitleaks.toml --staged

    secretlint:
      glob: "**/*"
      run: >
        secretlint
        --secretlintrc ./configs/secretlint.config.yaml
        --secretlintignore .gitignore
        --maskSecrets
        "{staged_files}"

    eslint:
      glob:
        - "shared/**/*.ts"
        - "packages/**/*.ts"
      run: pnpm run lint-all -- "{staged_files}"

    eslint-types:
      glob:
        - "shared/**/*.ts"
        - "packages/**/*.ts"
      run: pnpm run lint-all:types -- "{staged_files}"

    lint-files:
      glob:
        - "**/*.ts"
      run: pnpm run lint:filename -- {staged_files}

    check-spells:
      glob:
        # 下記のパターンはプロジェクトルートからのファイルパスを示しています
        - "/shared/**/*.ts"
        - "/packages/**/*.ts"
        - "/shared/**/*.md"
        - "/packages/**/*.md"
        - "**/*.json"
        - "docs/**/*.md"
      run: pnpm run check:spells -- {staged_files}

commit-msg:
  parallel: true
  commands:
    commitlint:
      run: commitlint --config ./configs/commitlint.config.ts --edit
```

各コマンドは、以下の型式になっています。

```yaml
commands:
  <command-id>:
    glob: <filePattern>
    run: <command>
```

設定項目の解説:

- `<command-id>`
  実行するコマンドの識別子です。任意の英数字が使用できます。

- `glob`
  対象ファイルをワイルドカード形式で指定します。複数パターンはリスト形式で記述可能です。

  ```yaml
  glob:
    - "src/**/*.ts"
    - "tests/**/*.ts"
  ```

- `run`
  実行するコマンドを記述します。
  長いコマンドの場合は、`>`のあとに複数行で記述します。

  ```yaml
  run: >
    secretlint
    --secretlintrc ./configs/secretlint.config.yaml
    --maskSecrets
     "{staged_files}"
  ```

- {staged_files}
  Lefthook がコミット対象となっているファイルのリストを展開し、処理対象を限定して高速化します

`commit-msg`フック:

- `commit-msg`フックは、コミットメッセージが入力されたタイミングで実行されます
- ここでは `commitlint`を使い、コミットメッセージがプロジェクトの規約に準拠しているかを自動的に検証します
- 不正なコミットメッセージの場合、コミットは中断されます。これによる、メッセージの品質が管理できます

### 12.4 `commitlint`の概要

`commitlint`は、コミットメッセージがプロジェクトで定めたフォーマット規約に従っているかを自動的に検証するツールです。

本プロジェクトでは、コミットメッセージの一貫性と可読性を高めるために、`Conventional Commits`という規約に基づいたチェックを導入しています。

#### `Conventional Commits`

`Conventional Commits`は、コミットメッセージを一定のフォーマットに統一するための規約です。
主に以下の構成で記述されます。

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- `<type>` はコミットの種類を示し、変更の性質を表します。
- `[optional scope]` は変更の影響範囲を表す任意のスコープです。
- `<description>` は変更内容の概要を簡潔に記述します。
- `[optional body]` は詳細な説明（省略可能）です。
- `[optional footer(s)]` は関連チケット番号や破壊的変更の情報などを記述します。

代表的な `type` の例:

- `feat`: 新機能の追加
- `fix`: バグ修正
- `docs`: ドキュメント修正
- `style`: コードの書式・スタイル変更 (動作に影響なし)
- `refactor`: リファクタリング

#### `commitlint`の役割

- コミットメッセージが規約に沿っていない場合、コミット操作をブロックします。
- メッセージの品質と一貫性を保つことで、履歴の可読性やメンテナンス性を向上させます。
- CI/CD パイプラインでも同様の検証をし、プロジェクト全体の規約遵守を促します。

### 12.5 本プロジェクトでの`commitlint`設定

このプロジェクトでは、共通のコミットメッセージルールを `/shared/configs/commitlint.config.base.ts` にて管理しています。
この設定は、`@commitlint/config-conventional` のルールをベースに、独自のコミットタイプを追加し、メッセージの品質を厳密に管理します。

#### 設定ファイル

```ts
// src: configs/commitlint.config.js
// @(#) : commitlint 基本設定
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type check for typescript
import type { UserConfig } from '@commitlint/types';

// commit lint common configs
const baseConfig: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      // === Default conventional types ===
      'feat', // New feature
      'fix', // Bug fix
      'chore', // Routine task, maintenance
      'docs', // Documentation only
      'test', // Adding or updating tests
      'refactor', // Code change without fixing a bug or adding a feature
      'perf', // Performance improvement
      'ci', // CI/CD related change

      // === Custom additions ===
      'config', // (custom) For configuration changes
      'release', // (custom) For releases
      'merge', // (custom) For merge commits, especially when conflict resolution involved
      'build', // (custom) For build system or external dependencies
      'style', // (custom) Non-functional code style changes (e.g., formatting, linting)
      'deps', // (custom) Updating third-party dependencies (npm/yarn/etc.)
    ]],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']], // etc
    'header-max-length': [2, 'always', 72],
  },
};

// export
export default baseConfig;
```

#### 主な設定内容

- **extends**
  `@commitlint/config-conventional` を拡張して基本ルールを継承しています。

- **type-enum**
  許容されるコミットタイプを定義し、以下のようにプロジェクト固有のタイプを追加しています。

  - `feat` (新機能)
  - `fix` (バグ修正)
  - `chore` (雑務、保守作業)
  - `docs` (ドキュメント変更)
  - `test` (テスト追加・修正)
  - `refactor` (リファクタリング)
  - `perf` (パフォーマンス改善)
  - `ci` (CI/CD 関連)
  - `config` (設定ファイル関連)
  - `release` (リリース作業関連)
  - `merge` (マージコミット関連)
  - `build` (ビルド作業関連)
  - `style` (コードのスタイル修正)
  - `deps` (依存パッケージの更新など)

- **subject-case**
  コミットのサブジェクトのケースルール。`start-case`や`pascal-case`は禁止しており、一般的に小文字や sentence case を推奨しています。

- **header-max-length**
  コミットヘッダーの最大文字数を 72 文字に制限しています。読みやすい履歴管理のためのガイドラインです。

#### 運用メリット

- コミットメッセージの統一により、履歴の追跡や変更内容の把握が容易になります。
- 自動チェックにより、誤ったメッセージでのコミットを防止できます。
- CI/CD パイプラインと連携することで、リリースノートの自動生成などの効率化が可能です。

### 12.6 理解度チェック

以下のチェックリストで、本章の理解度を自己評価しましょう。すべての項目にチェックがつけば、内容をしっかり理解していると言えます。

- [ ] コミット・プッシュ前のチェックツールの役割と目的を説明できる
- [ ] `Lefthook` の役割と主な機能を理解している
- [ ] `lefthook.yml` の基本構造 (`pre-commit`と`commit-msg`) を説明できる
- [ ] {staged_files} を使った処理の効率化を理解している
- [ ] `commitlint` がコミットメッセージのフォーマットを検証することを理解している
- [ ] `Conventional Commits` のフォーマットの基本構成を説明できる
- [ ] 本プロジェクトで許容されているコミットタイプ（`type`）の一覧を挙げられる
- [ ] コミットメッセージの検証により得られる運用上のメリットを説明できる

---

このチェックリストを活用して、わからない項目は本文に戻って復習しましょう。
