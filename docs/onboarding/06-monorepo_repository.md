---
header:
  - src: docs/onboarding/06-monorepo_repository.md
  - "@(#) : ESTA Onboarding Guide - Monorepo Structure and Implementation"
title: monorepo構成と、その実現方法
description: pnpm-workspacesを用いたmonorepo構成の概要と利点
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
sidebar_position: 6
tags:
  - onboarding
  - monorepo
  - pnpm
  - workspace
---

## 6 monorepo構成と、その実現方法

### 6.1 monorepoの概要

monorepo　(モノレポ) は、複数の関連するプロジェクトやパッケージを 1つのリポジトリで管理する開発手法です。
従来の複数リポジトリ管理 (マルチレポ) と異なり、コードの共有やバージョン整合性を保ちやすいのが特徴です。

### 6.2 本リポジトリのmonorepo構成

#### ディレクトリ構成

本リポジトリでは、ディレクトリ構造は以下のようになっています。
このなかの、`/packages/@ag-actions/`下の`tool-installer`や`/packages/@ag-utils/`下の`command-utils`がサブパッケージです。

```bash
/
|-- configs
|-- packages
|   |-- @ag-actions
|   |   `-- tool-installer
|   |       |-- configs
|   |       |-- shared
|   |       `-- tests
|   `-- @ag-utils
|       |-- command-utils
|       |   `-- configs
|       |-- common
|       |   `-- configs
|       `-- get-platform
|           `-- configs
|-- scripts
`-- shared
    |-- common
    |   |-- configs
    |   |-- constants
    |   `-- types
    `-- configs
```

#### `monorepo`の実現方法

本リポジトリでは、`pnpm`の`workspaces`機能によって monorepo を実現しています。
リポジトリルートに`pnpm-workspace.yaml`を作成し、以下のように設定します。

```yaml
# src; pnpm-workspace.yaml
# @(#) : pnpmによるmonorepo設定
packages:
  - apps/**
  - packages/**
  - shared/**
```

これにより、`/app/`下、`/packages`下、`/shared/`下のディレクトリがサブリポジトリとして使えるようになります。
たとえば、`/packages/@ag-utils/command-util`ディレクトリに`package.json`を設置すると、そのディレクトリがサブリポジトリとなります。
サブリポジトリは、通常のリポジトリと同様に設定、開発、運用ができます。

### 6.3 monorepoのポイントと利点

monorepo を採用することで得られる主な利点を、目的別に分類して紹介します。

#### 管理の効率化に関する利点

- 一元管理: 全体を単一のリポジトリで管理できるため、構成や運用がシンプルになる
- 依存関係の管理が簡単: サブパッケージ間の依存解決が自動化される
- バージョン管理の一貫性: 全パッケージのバージョンを統一・同期しやすい

#### 開発基盤の共有に関する利点

- コード共有: `shared` ディレクトリなどからモジュールを再利用できる
- 設定ファイルの共通化: `tsconfig` や `eslint` 設定などを共通で管理できる
- 統一された開発環境: CI/CD や Linter 設定などが一貫性を持って管理できる

#### 作業効率の向上に関する利点

- 一括ビルド・テスト: 複数パッケージを同時に処理できる
- 一括スクリプトの実行: ルートからサブパッケージに対して一括コマンド実行が可能
- 依存関係の最適化: `pnpm` により重複が除かれ、インストール効率が高い

### 6.4 注意点とベストプラクティス

#### 設計・依存関係に関する注意点

- 依存循環の回避: パッケージ間の相互依存が発生しないよう、依存関係は明確に設計する
- パッケージの独立性確保: 各パッケージは極力独立して動作するように設計し、密結合を避ける

#### CI/CD・運用に関する注意点

- CI/CD 環境の最適化: モノレポ構成に適した CI/CD 設定をし、一括ビルド・テストを可能にする
- スクリプト管理の整理: ルートと各パッケージでスクリプトの役割を明確にし、実行のしやすさを確保する

#### 設定・共通リソースに関する注意点

- 設定ファイルの共有と拡張: 共通設定ファイルを活用しつつ、パッケージごとに拡張可能とする
- 重複依存の防止: 不要な依存の重複インストールを避けた依存管理を行う

#### チーム体制に関する注意点

- 運用ルールの共有: monorepo の構成や運用ルールをチーム全体で理解し、共通認識を持つ
- 統一された開発環境: CI/CD や Linter 等の一括管理が可能

### 6.5 設計上のチェックポイント

- パッケージ間の依存関係が明確で、不要な循環依存を避けていること
- CI/CD の構成がモノレポに最適化されていること
- 各パッケージの独立性が保たれ、保守性が高いこと
- 共通設定ファイルが適切に共有・拡張されていること
- ルートおよび各パッケージでのスクリプト管理が整理されていること

### 6.6 monorepo活用のためのチェックリスト

#### 依存関係と構成に関する確認

- [ ] パッケージ間の依存関係が明確で、循環参照が発生していない
- [ ] 各パッケージの独立性が保たれており、単体でビルド・テスト可能

#### ビルド・CI/CD運用に関する確認

- [ ] ルートディレクトリからビルド・テストなどを一括実行できる構成になっている
- [ ] CI/CD パイプラインが monorepo 構成に対応して最適化されている

#### 設定ファイルとスクリプトに関する確認

- [ ] eslint や tsconfig などの共有設定ファイルが全パッケージに適用されている
- [ ] 各パッケージで必要な設定の上書き・拡張が適切に行われている
- [ ] `package.json` のスクリプトがルート・サブパッケージごとに整理されている

#### パッケージ管理とチーム運用に関する確認

- [ ] 不要な依存の重複や冗長なインストールが発生していない
- [ ] 開発チーム全体が、monorepo の構成と運用ルールを理解し、共有している
