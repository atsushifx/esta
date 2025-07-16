import { parse } from 'valibot';
import { ToolsConfigSchema } from '../shared/schemas';
import type { ToolEntry, ToolsConfig } from '../shared/types';

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
 * デフォルトのツール設定を正規化済みで返す
 * @returns 正規化済みのToolsConfig
 */
export const defaultToolsConfig = (): ToolsConfig => {
  const config = {
    defaultInstallDir: '.tools/bin',
    defaultTempDir: '.tools/tmp',
    tools: defaultTools,
  };

  // スキーマで検証・正規化して返す
  return parse(ToolsConfigSchema, config);
};
