import { array, check, object, pipe, string } from 'valibot';
import { ToolEntrySchema } from '../../../shared/schemas';
import { getPathValidationErrorMessage, validatePath } from './pathValidation';

/**
 * ToolsConfigの拡張スキーマ
 * パス検証を含む詳細なvalidationを提供
 */
export const ExtendedToolsConfigSchema = object({
  defaultInstallDir: pipe(
    string(),
    check(validatePath, getPathValidationErrorMessage('defaultInstallDir')),
  ),
  defaultTempDir: pipe(
    string(),
    check(validatePath, getPathValidationErrorMessage('defaultTempDir')),
  ),
  tools: array(ToolEntrySchema),
});
