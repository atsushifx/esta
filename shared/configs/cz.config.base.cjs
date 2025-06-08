// src: /shared/configs/cz.config.base.cjs
// @(#) : commitizen configuration for this workspace
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
// src: configs/cz.config.base.js
// @(#) : cz-git 共通設定（commitlintと整合）
//
// Copyright (c) 2025 atsushifx
// Released under the MIT License

const { defineConfig } = require('cz-git');

const baseCzConfig = defineConfig({
  types: [
    { value: 'feat', name: 'feat:     新機能の追加' },
    { value: 'fix', name: 'fix:      バグ修正' },
    { value: 'chore', name: 'chore:    雑務・ビルド設定' },
    { value: 'docs', name: 'docs:     ドキュメントの変更' },
    { value: 'test', name: 'test:     テスト追加・修正' },
    { value: 'refactor', name: 'refactor:リファクタリング' },
    { value: 'perf', name: 'perf:     パフォーマンス向上' },
    { value: 'ci', name: 'ci:       CI/CD 関連の変更' },
    { value: 'config', name: 'config:   設定ファイル・構成の変更' },
    { value: 'release', name: 'release:  リリース管理関連' },
    { value: 'merge', name: 'merge:    マージ・競合解決' },
    { value: 'build', name: 'build:    ビルドツールや依存の変更' },
    { value: 'style', name: 'style:    スタイルのみの変更' },
    { value: 'deps', name: 'deps:     依存パッケージの更新' },
  ],

  prompt: {
    alias: {
      f: 'feat',
      b: 'fix',
      d: 'docs',
      r: 'refactor',
      t: 'test',
      c: 'chore',
    },
    useEmoji: true,
    skipQuestions: ['body', 'footer'],
    messages: {
      type: 'コミットタイプを選択してください:',
      scope: '変更のスコープ（例: auth, api, ui）:',
      subject: '短く具体的な説明を入力:',
    },
  },
});

module.exports = { baseCzConfig };
