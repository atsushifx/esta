/**
 * ツール設定エントリー
 */
export type ToolEntry = {
  installer: string;
  id: string;
  repository: string;
  options?: Record<string, unknown>;
};

/**
 * ツール設定全体
 */
export type ToolsConfig = {
  defaultInstallDir: string;
  defaultTempDir: string;
  tools: ToolEntry[];
};
