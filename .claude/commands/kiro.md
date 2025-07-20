---
header:
  - src: .claude/commands/kiro.md
  - @(#) : claude command: kiro (SDD) main
title: kiro (Spec-Driven-Development) main command
description: kiro (Spec-Driven-Development) main command
version: 1.0.0
created: 2025-07-18
updated: 2025-07-18
authors:
  - Claude（初期設計・API仕様策定）
  - atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-18: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## kiro command definition

### 概要

kiro は SDD (Spec-Driven-Development)をつかって、ソフトウェアを開発するコマンドです。
SDD では、Claude Code (laude)は、以下の条件で開発をします。

<!-- textlint-disable ja-technical-writing/sentence-length -->

- `docs/.ccKiro/`内に spec ごとのディレクトリを作成し、必要なドキュメントを作成
- `spec`は`<namespace>`,`<module>`名からなり、`./docs/.ccKiro/<namespace>/<module>/`ディレクトリを作成
- `spec`ディレクトリ内には、要件定義ドキュメント(`*.requirement.md`)、仕様ドキュメント(`*.spec.md`)、
  詳細設計ドキュメント(`*.design.md`)、タスクドキュメント(`*.tasks.md`)を作成
- SDD では、以下の各フェーズに基づいてドキュメントの作成、プログラミングをする
  1. 事前準備フェース:
     - ユーザーが実行したいタスクの概要を伝え、Claude がふさわしーネームスペース、モジュールを考えてディレクトリを作成する
  2. 要件定義フェーズ:
     - Claude は、実行するタスクを満たす要件を定義した要件定義ドキュメントを作成する
     - ユーザーは、要件定義ドキュメントを確認し、適宜 Claude に対してフィードバックする
     - Claude はユーザーのフィードバックを元に、要件定義ドキュメントを修正する
     - 上記ループを、ユーザーがドキュメントを確認し「問題ない」と応えるまで続ける
  3. 設計フェーズ:
     - 仕様フェーズでは、Claude は「要件定義ドキュメント」に欠かれた要件を満たす「仕様ドキュメント」「詳細設計ドキュメント」を作成する
     - ユーザーは作成された「仕様ドキュメント」「詳細設計ドキュメント」をレビューし、Claude にフィードバックする
     - Claude は、フィードバックを元に「仕様ドキュメント」「詳細ドキュメント」を書き直す。
     - レビューの結果、ユーザーが「問題ない」と答えるまで、[レビュー → フィードバック → 書き直し]ループを続ける
  4. タスクフェーズ:
     - Claude は、「仕様ドキュメント」の仕様を満たし、「詳細設計ドキュメント」の設計を実装するためのタスク度球面とを作成する
     - ユーザーは、タスクドキュメントを確認し、Claude に対してフィードバックする
     - Claude はフィードバックをもとに、タスクドキュメントを書き直し、ユーザーにレビューを求める
     - レビューの結果、ユーザーが「問題ない」と応えるまで、[レビュー → フィードバック → 書き直し]ループを続ける
  5. 実装フェーズ:
     - Claude は、タスクドキュメントを元に要件を満たすコードを作成する
     - コード作成時には、「要件定義ドキュメント」「仕様ドキュメント」「詳細設計ドキュメント」の内容を守る
     - 一度に 1つずつのタスクを実行し、開発する。複数のタスクを同時に実行しない

<!-- textlint-enable -->

### サブコマンド

kiro は、以下のサブコマンドを受け入れ、実行する。

- `init`:
  事前準備フェーズを実行する。 パラメータ `<namespace>/<module>`から `./docs/.ccKiro/<namespace>/<module>/`ディレクトリを作成する。

- `requirement`, `req`:
  要件定義フェーズを実行する。上記の「要件定義フェーズ」を実行し、「要件定義ドキュメント」を作成する。

### 実装詳細

プログラムの作成、コーディングは以下の方法、条件を守ってコーディングする。

- t-wada 式 TDD で開発する:
  - 1つの機能に対し実装すべき機能をタスクリストに落とし、1つのタスクずつテストファーストで開発する
  - 1つのタスクに対し、失敗で終わるテストからはじめ、最低限の実装を満たすようにプログラミングをする。
  - `Red → Green → Refactoring`のサイクルを守り、可能な限り質のよいプログラムを作成する
  - 上位胃を、作成したタスクリストのタスクがなくなるまで続ける
- BDD で開発する:
  - Test を`Describe`/`It`を使用して記述する
