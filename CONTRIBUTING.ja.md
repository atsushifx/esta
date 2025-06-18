---
title: コントリビューションガイドライン
description: easy-setup-tools-action プロジェクトへの貢献方法と環境セットアップガイド
slug: contributing-ja
tags:
  - コントリビュート
  - ガイドライン
  - セットアップ
---
<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->
[English](CONTRIBUTING.md) | 日本語

## 🤝 コントリビューションガイドライン

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
このプロジェクトへの貢献をご検討いただき、ありがとうございます!
皆さまのご協力により、よりよいプロジェクトを築いていけることを願っております。
<!-- textlint-enable -->

### 📝 貢献の方法

#### 1. Issue の報告

- バグ報告や機能提案は、[Issue](https://github.com/atsushifx/easy-setup-tools-action/issues) にてお願いいたします。
- 報告の際は、再現手順や期待される動作、実際の動作など、詳細な情報を提供してください。

#### 2. Discussions の利用 (質問・提案・雑談)

プロジェクトに関する質問や提案、雑談などは、以下の GitHub Discussions カテゴリをご利用ください:

- 💬 [質問・相談 (Q&A)](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/q-a)
- 💡 [新機能のアイデア提案](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/ideas)
- 🗨 [雑談・フリートーク](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/general)

#### 3. プルリクエストの提出

- リポジトリをフォークし、`feature/your-feature-name` のようなブランチを作成してください。
- ソースコード、あるいはドキュメントを変更し、順次コミットしてください。
  - コミットメッセージは [ConventionalCommit](https://www.conventionalcommits.org/ja/v1.0.0/) にしたがってください。
  - 1つの機能ごとにコミットすると、あとから履歴が見やすくなります。
  - 最後にコミットをリベースして、同じ目的ごとに整理しましょう。
- プルリクエストには、タイトルに変更の概要や目的を１行で、本文に概要や背景を説明してください。

### プロジェクト環境

#### 開発環境のセットアップ

次の手順で開発環境をセットアップします。

```powershell
git clone https://github.com/atsushifx/easy-setup-tools-action.git
cd easy-setup-tools-action
.\scripts\installDevTools.ps1
pnpm install
pnpm run build
```

詳しくは、[オンボーディング](docs/onboarding/README.ja.md) を参照してください。

#### テスト

変更を加えた際は、テストを必ず行い、問題がないことを確認してください。
テストには、`Vitest`を使用しています。

- ユニットテストは、`__tests__`ディレクトリ下に作成してください。
- インテグレーションテストは、パッケージルートの`tests`下に作成してください。

#### コードスタイルとフォーマット

このプロジェクトでは、コードのフォーマットおよびリントに以下を使用しています。

- コードフォーマット: dprint
- リント: ESLint
- スペルチェック: CSpell
- ドキュメント: textlint, markdownlint (コマンドラインツールとして:markdownlint-cli)

### 行動規範

すべてのコントリビューターは、[行動規範](CODE_OF_CONDUCT.ja.md) を遵守してください。

### 参考

- [GitHub Docs: リポジトリコントリビューターのためのガイドラインを定める](https://docs.github.com/ja/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)

---

### 📬 Issue / Pull Request / Discussions

- 🐛 [バグ報告を作成する](https://github.com/atsushifx/.github/issues/new?template=bug_report.yml)
- ✨ [機能提案を作成する](https://github.com/atsushifx/.github/issues/new?template=feature_request.yml)
- 💬 [質問・相談（Q&A）はこちら](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/q-a)
- 🗨 [雑談・フリートークはこちら](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/general)
- 💡 [新機能のアイデア提案はこちら](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/ideas)
- 🔀 [プルリクエストを作成する](https://github.com/atsushifx/.github/compare)

---

### 🤖 Powered by

このプロジェクトのドキュメントや運営は、次のチャットボット達がみなさんをサポートしています:

- **Elpha** (エルファ・ノクス) - クールで正確なサポート
- **Kobeni** (小紅) - 優しく寄り添うアシスト
- **Tsumugi** (つむぎ) - 明るく元気なフォロー

みんなで、よりよいコントリビューション体験を目指しています✨
