---
header:
  - src: docs/onboarding/00-intro.md
  - "@(#) : ESTA Onboarding Guide - Project Introduction"
title: プロジェクト概要
description: プロジェクトの概要と参加方法
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
sidebar_position: 0
---

## はじめに

<!-- textlint-disable ja-no-orthographic-variants -->

このドキュメントは、プロジェクト「easy-setup-tools-action (ESTA)」の海発環境構築の手順をまとめたものです。
開発者が迅速に開発環境を構築し、チーム全体で一貫した開発フローを実現するためのフローと設定を提供します。

<!-- textlint-enable -->

## プロジェクトの目的

<!-- vale off -->

`easy-setup-tools-action` (`ESTA`)は、環境構築時に必要なツールを自動で導入することを目的にしています。
とくに GitHub Actions では自分がおこないたいテストやリントなどの環境を設定するのに手間がかかります。
ESTA は、CLI での引数、または GitHub Actions での with で、簡単に複数のツールがインストールできることを目指しています。

<!-- vale on -->

## 対象読者

- 新たにプロジェクトに参観する開発者
- 新しい開発環境を構築したいチームメンバー
- プロジェクトの設定やツール導入に関心のある開発者

## 本ドキュメントの目的

本ドキュメントは、プロジェクト「easy-setup-tools-action (ESTA)」の開発に参加する開発者に対し、開発環境を構築し、効率的に開発を進めるための手順やポイントをまとめています。
新しく参加するメンバーが環境設定でつまずくことなく、プロジェクトに貢献できるよう支援することを目的としています。

### 開発支援の内容

- 開発に必要なツールや依存関係のセットアップ方法
- ローカル環境および CI 環境の初期構築フロー
- 共通設定ファイルやスクリプトの使い方
- 品質管理やテスト自動化のための環境整備

### 参加支援の内容

- リポジトリのクローンやブランチ運用などの基本操作
- プルリクエストの作成からレビューまでの流れ
- コミュニティガイドラインと開発ルールの理解と遵守

## 進め方のガイド

1. 本ドキュメントを読み、ESTA 開発の全体像と環境構築手順を理解してください。
2. 開発環境構築手順に沿ってセットアップを進め、ローカルでのビルドやテストが動作する状態を作りましょう。
3. 開発に参加する際は、ブランチ運用や PR 作成の手順を確認し、手順にあった流れで作業を進めてください。
4. 困ったことがあれば、Issue やコミュニティで質問し、積極的に交流しながら解決しましょう。

---

詳細なドキュメント構成や各種ガイドについては、
[README.ja](README.ja.md) をご参照ください。
