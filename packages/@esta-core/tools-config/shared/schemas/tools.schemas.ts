import { any, array, object, optional, record, string } from 'valibot';

export const ToolEntrySchema = object({
  installer: string(),
  id: string(),
  repository: string(),
  options: optional(record(string(), any())),
});

export const ToolsConfigSchema = object({
  defaultInstallDir: string(),
  defaultTempDir: string(),
  tools: array(ToolEntrySchema),
});
