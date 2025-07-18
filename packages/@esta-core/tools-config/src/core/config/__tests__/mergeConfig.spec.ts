// vitest
import { describe, expect, test } from 'vitest';
// type
import type { PartialToolsConfig, ToolsConfig } from '../../../../shared/types/toolsConfig.types';
// test target
import { mergeToolsConfig } from '../mergeToolsConfig';

describe('mergeToolsConfig', () => {
  test('should return parameter as-is when it is an empty object', () => {
    const defaultConfig: ToolsConfig = {
      defaultInstallDir: '/default',
      defaultTempDir: '/tmp',
      tools: [],
    };
    const loadConfig: PartialToolsConfig = {};

    const result = mergeToolsConfig(defaultConfig, loadConfig);

    expect(result).toEqual({});
  });

  test('should merge defaultConfig and loadConfig', () => {
    const defaultConfig: ToolsConfig = {
      defaultInstallDir: '/default',
      defaultTempDir: '/tmp',
      tools: [],
    };
    const loadConfig: PartialToolsConfig = {
      defaultInstallDir: '/custom',
      tools: [{ installer: 'eget', id: 'tool1', repository: 'owner/repo' }],
    };

    const result = mergeToolsConfig(defaultConfig, loadConfig);

    expect(result).toEqual({
      defaultInstallDir: '/custom',
      defaultTempDir: '/tmp',
      tools: [{ installer: 'eget', id: 'tool1', repository: 'owner/repo' }],
    });
  });

  test('should return defaultConfig when loadConfig has properties but preserves original structure', () => {
    const defaultConfig: ToolsConfig = {
      defaultInstallDir: '/default',
      defaultTempDir: '/tmp',
      tools: [{ installer: 'eget', id: 'default-tool', repository: 'default/repo' }],
    };
    const loadConfig: PartialToolsConfig = {
      defaultInstallDir: '/loaded',
    };

    const result = mergeToolsConfig(defaultConfig, loadConfig);

    expect(result).toEqual({
      defaultInstallDir: '/loaded',
      defaultTempDir: '/tmp',
      tools: [{ installer: 'eget', id: 'default-tool', repository: 'default/repo' }],
    });
  });
});
