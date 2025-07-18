// src/defaults.ts
// @(#) : デフォルト設定提供機能
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { parse } from 'valibot';
import { DEFAULT_INSTALL_DIR, DEFAULT_TEMP_DIR } from './internal/constants';
import { CompleteToolsConfigSchema } from './internal/schemas';
// tools configuration types
import type { ToolEntry, ToolsConfig } from '@/shared/types/toolsConfig.types';

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
export const defaultToolsConfig = (): ToolsConfig => {
  const config = {
    defaultInstallDir: DEFAULT_INSTALL_DIR,
    defaultTempDir: DEFAULT_TEMP_DIR,
    tools: [...defaultTools], // 配列のコピーを返す
  };

  // スキーマで検証・正規化して返す
  return parse(CompleteToolsConfigSchema, config) as ToolsConfig;
};
