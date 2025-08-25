// src: ./configs/eslint.projects.js
// @(#) : ESLint project path configuration list
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default [
  // for OSS Utils
  './packages/@agla-e2e/fileio-framework/tsconfig.json', // E2Eテスト用ファイルI/Oフレームワーク
  './packages/@agla-utils/ag-logger/tsconfig.json', // 構造化ログフレームワーク
  // shared packages
  './shared/packages/constants/tsconfig.json', // esta 共通定数
  './shared/packages/types/tsconfig.json', // esta 共通型
  // esta-error
  'packages/@esta-error/error-handler/tsconfig.json', // 集約エラーハンドリング・終了管理
  'packages/@esta-error/error-result/tsconfig.json', // エラー結果型
  // esta-core
  'packages/@esta-core/feature-flags/tsconfig.json', // フィーチャーフラグ管理システム
  'packages/@esta-core/tools-config/tsconfig.json', // ツールインストール設定生成器
  // esta-system
  'packages/@esta-system/exit-status/tsconfig.json', // システム終了ステータス管理
  // utils
  './packages/@esta-utils/command-runner/tsconfig.json', // コマンド存在チェック・実行ユーティリティ
  './packages/@esta-utils/get-platform/tsconfig.json', // プラットフォーム検出ユーティリティ
  './packages/@esta-utils/config-loader/tsconfig.json', // 汎用設定ファイルローダー
  // gha modules
  './packages/@esta-actions/tools-installer/tsconfig.json', // egetを使った汎用ツールインストーラーフレームワーク
  // main
  './tsconfig.json', // ルートプロジェクト設定
];
