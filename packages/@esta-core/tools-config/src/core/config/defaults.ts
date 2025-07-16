// src/core/config/defaults.ts
// @(#) : デフォルト設定提供機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { parse } from 'valibot';
import { CompleteToolsConfigSchema } from '../../../shared/schemas';
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
 * デフォルトのツール設定を取得する（validated済み）
 * @returns 検証済みのToolsConfig
 */
export const getDefaultToolsConfig = (): ToolsConfig => {
  const config = {
    defaultInstallDir: '.tools/bin',
    defaultTempDir: '.tools/tmp',
    tools: [...defaultTools], // 配列のコピーを返す
  };

  // スキーマで検証・正規化して返す
  return parse(CompleteToolsConfigSchema, config) as ToolsConfig;
};

/**
 * デフォルトツールリストを取得する（validated済み）
 * @returns 検証済みのツールエントリー配列
 */
export const getDefaultTools = (): ToolEntry[] => {
  // 各ツールエントリーを検証して返す
  return defaultTools.map((tool) => {
    // ToolEntryの検証は既にdefaultToolsで行われているが、
    // 将来的にスキーマ検証を追加する場合はここで実装
    return { ...tool };
  });
};

/**
 * 特定のデフォルトツールを取得する（validated済み）
 * @param id ツールID
 * @returns 見つかった検証済みツールエントリー、または undefined
 */
export const getDefaultTool = (id: string): ToolEntry | undefined => {
  const tool = defaultTools.find((tool) => tool.id === id);
  if (!tool) {
    return undefined;
  }

  // ツールエントリーのコピーを返す
  return { ...tool };
};

// 下位互換性のため
export const defaultToolsConfig = getDefaultToolsConfig;
