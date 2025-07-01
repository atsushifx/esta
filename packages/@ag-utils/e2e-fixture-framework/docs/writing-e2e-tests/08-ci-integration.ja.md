---
title: "08. CI連携と自動実行"
description: "GitHub Actionsを用いたE2E Fixtures Frameworkのテスト自動化とCI運用のポイントを解説します。"
sidebar_position: 8
slug: /ci-integration
---

## 第8章 CI連携と自動実行

### CI連携の効果

CI 連携の効果は、自動的にテストすることだけでなく、テスト結果に基づいて以下のような処理ができることにあります。

<!--textlint-disable ja-technical-writing/sentence-length -->

- **PRの状態管理**
  PR (`Pull Request`) の可／不可を自動テストの成否で決定 (テスト失敗の場合は、マージ不可)

- **テスト結果レポート**
  テスト結果を JUnit などのテストレポート形式で出力し、GitHub のテストタブや外部ツールで可視化
  テスト結果のサマリーや詳細を PR コメントに自動投稿することも可能

- **デグレ検知・履歴管理**
  以前のビルド結果と比較して、新たな失敗 (デグレ) を検知し通知
  成功／失敗履歴を確認

- **通知連携**
  テスト結果の成否を Slack,メールなどでチーム全体に通知

<!-- textlint-enable -->

### GitHub ActionsによるCI連携

#### GitHub Actionsとは

GitHub Actions は、GitHub が提供する継続的インテグレーション (CI) および継続的デリバリー (CD) サービスです。
リポジトリのイベント (プッシュやプルリクエストの作成など) をトリガーとして、自動的にビルドやテスト、デプロイなどのジョブを実行します。

主な特徴として以下があります。

- GitHub リポジトリに統合されており、セットアップが容易
- YAML 形式のワークフローファイルで細かいジョブの定義が可能
- 複数の OS や環境でのジョブ並列実行に対応
- 豊富な公式およびコミュニティ製アクションが利用可能
- PR コメントへのレポート投稿や外部通知連携もサポート

GitHub 上での開発ワークフローを自動化・効率化し、品質向上やリリースの迅速化に貢献します。

#### GitHub Actionsによるテスト自動化

GitHub Actions を使用することで、プルリクエスト作成時、重要なブランチへのプッシュ時に、自動的に E2E Fixtures Framework のテストを実行できます。
これにより、テストの実行漏れを防ぎ、品質チェックの抜け、漏れをなくすことができます。

テストを CI と連携した場合の効果は次の通りです。

- 作業の属人化の排除
- 手動テストの工数の削減
- PR の品質の可視化
- 継続的なデグレの防止

テストを自動化することにより、チーム全体の開発体験やコードの品質を高めることができます。

#### ワークフローファイルの例

テストを自動実行するワークフローの例:

```yaml
# src: .github/workflows/ci-sample-e2e-fixtures.yaml
# @(#) : E2E Fixture Tests sample
#
# Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

name: CI E2E Fixture Tests sample # ワークフロー名（Actions UIに表示）

on:
  push:
    branches:
      - main # mainブランチへのpushをトリガー
      - release # releaseブランチへのpushも対象
  pull_request:
    branches:
      - main # mainブランチをターゲットとするPR
      - release # releaseブランチをターゲットとするPR
  workflow_dispatch: # 手動実行トリガー（開発・検証用）

jobs:
  test:
    runs-on: ubuntu-latest # GitHubが提供するUbuntuランナーで実行

    steps:
      - name: Checkout code
        uses: actions/checkout@v4 # リポジトリのソースコードを取得

      - name: Setup Node.js environment
        uses: actions/setup-node@v4
        with:
          node-version: "22" # Node.js v22 をインストール

      - name: Setup pnpm
        uses: pnpm/action-setup@v4 # pnpmをセットアップ（lockfile使用可）

      - name: Install dependencies
        run: pnpm install # package.json に基づいて依存関係をインストール

      - name: Run Vitest E2E Fixture tests
        run: pnpm run test:gha # E2E Fixtures Framework によるテスト実行（結果を test-results/ に出力）

      - name: Upload Test Results
        if: always() # テスト失敗時でも常に実行
        uses: actions/upload-artifact@v4
        with:
          name: vitest-e2e-fixture-test-results # アップロードされるアーティファクト名
          path: test-results/ # テスト結果ファイルの出力ディレクトリ
```

### テスト結果の確認と活用

ワークフローの実行が完了すると、GitHub Actions の UI 上でテスト結果やログを確認できます。

- **ステップごとのログ**は `Actions` タブ → 該当ワークフロー → `test` ジョブ → 各ステップ名を開くことで確認
- **テスト結果ファイル（例：JUnit 形式など）**は、`Upload Test Results` ステップでアーティファクトとしてアップロードされているため、ダウンロードしてローカルで分析可能
- `vitest --reporter=junit` で、テスト結果を JUnit 型式

#### PR コメントへの自動投稿（拡張）

テスト結果やエラーを PR に自動で投稿するワークフローを組み込むことで、レビュー時の確認がスムーズになります。
例えば以下のような目的で活用されます。

- 失敗したテストケースの一覧を PR コメントで通知
- 成功・失敗のサマリー（チェックボックス付き）を投稿
- デグレ項目の強調や、前回の結果との差分表示

<!-- markdownlint-disable line-length -->

この処理は [github-script](https://github.com/actions/github-script) や [actions/github-script](https://github.com/actions/github-script) を組み合わせることで簡易に実装できます。

<!--markdownlint-enable -->

### 発展的なCI活用のヒント

CI を活用することで、開発プロセス全体を一段階高い品質保証のレベルへ引き上げることができます。

| 活用パターン                | 概要                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| **並列実行**                | テスト対象を分割し、複数ジョブで並列に実行して高速化                |
| **PRラベル連動実行**        | ラベル（例：`run-e2e`）の有無によって実行するテストを切り替え可能   |
| **キャッシュの活用**        | `pnpm store` や `node_modules` をキャッシュし、セットアップを高速化 |
| **ブランチ戦略との連携**    | release ブランチや hotfix ブランチでの CI 条件分岐                  |
| **Slack通知の自動化**       | 成功・失敗を Slack に送ることでチームのフィードバックループを短縮   |
| **cron 実行による定期検査** | 定期的に main ブランチを検査して、予期せぬ破壊の早期検知            |

---

### まとめ

E2E Fixtures Framework を CI に統合することで、テストの**自動実行・記録・通知**を一貫して管理できるようになります。
これにより、品質の維持・開発の効率化・レビューのしやすさなど、多くの面で恩恵を受けることができます。

CI 連携は「**テストの自動化ツール**」であると同時に、「**プロジェクト品質の防波堤**」として機能します。
開発者一人ひとりの作業を支えるインフラとして、CI は今後ますます重要な役割を果たしていくでしょう。
