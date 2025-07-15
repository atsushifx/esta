import { any, array, check, object, optional, pipe, record, string } from 'valibot';
import { validatePath } from '../../src/validator/tools';

export const ToolEntrySchema = object({
  installer: string(),
  id: string(),
  repository: string(),
  options: optional(record(string(), any())),
});

export const ToolsConfigSchema = object({
  defaultInstallDir: pipe(
    string(),
    check(
      validatePath,
      'defaultInstallDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
    ),
  ),
  defaultTempDir: pipe(
    string(),
    check(
      validatePath,
      'defaultTempDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
    ),
  ),
  tools: array(ToolEntrySchema),
});
