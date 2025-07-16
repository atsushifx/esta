// src/core/config/defaults.ts
// @(#) : デフォルト設定提供機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { ToolEntry, ToolsConfig } from '../../types';

/**
 * デフォルトのツール設定リスト
 * 開発で便利な一般的なツールを含む
 */
const defaultTools: ToolEntry[] = [
  {
    installer: 'eget',
    id: 'gh',
    repository: 'cli/cli',
  },
  {
    installer: 'eget',
    id: 'ripgrep',
    repository: 'BurntSushi/ripgrep',
  },
  {
    installer: 'eget',
    id: 'fd',
    repository: 'sharkdp/fd',
  },
  {
    installer: 'eget',
    id: 'bat',
    repository: 'sharkdp/bat',
  },
  {
    installer: 'eget',
    id: 'exa',
    repository: 'ogham/exa',
  },
  {
    installer: 'eget',
    id: 'jq',
    repository: 'jqlang/jq',
  },
  {
    installer: 'eget',
    id: 'yq',
    repository: 'mikefarah/yq',
  },
  {
    installer: 'eget',
    id: 'delta',
    repository: 'dandavison/delta',
  },
  {
    installer: 'eget',
    id: 'gitleaks',
    repository: 'gitleaks/gitleaks',
  },
];

/**
 * デフォルトのツール設定を取得する
 * @returns デフォルトのToolsConfig
 */
export const getDefaultToolsConfig = (): ToolsConfig => {
  return {
    defaultInstallDir: '.tools/bin',
    defaultTempDir: '.tools/tmp',
    tools: [...defaultTools], // 配列のコピーを返す
  };
};

/**
 * デフォルトツールリストを取得する
 * @returns デフォルトツールの配列
 */
export const getDefaultTools = (): ToolEntry[] => {
  return [...defaultTools];
};

/**
 * 特定のデフォルトツールを取得する
 * @param id ツールID
 * @returns 見つかったツールエントリー、または undefined
 */
export const getDefaultTool = (id: string): ToolEntry | undefined => {
  return defaultTools.find((tool) => tool.id === id);
};

// 下位互換性のため
export const defaultToolsConfig = getDefaultToolsConfig;
