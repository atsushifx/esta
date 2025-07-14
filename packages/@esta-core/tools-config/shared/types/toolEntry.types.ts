/**
 * ツール設定エントリー
 */
export type ToolEntry = {
  installer: string;
  id: string;
  repository: string;
  options?: Record<string, unknown>;
};
