import type { ToolEntry } from '../shared/types';

// サンプルデータ（後で設定ファイルから読み込むように変更）
const sampleTools: ToolEntry[] = [
  {
    installer: 'eget',
    id: 'gh',
    repository: 'cli/cli',
    options: {
      version: 'latest',
      args: ['--quiet'],
    },
  },
];

export const getTool = (id: string): ToolEntry | undefined => {
  return sampleTools.find((tool) => tool.id === id);
};

export const listTools = (): ToolEntry[] => {
  return [...sampleTools];
};
