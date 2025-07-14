import { parse } from 'valibot';
import { describe, expect, test } from 'vitest';
import { ToolEntrySchema, ToolsConfigSchema } from '../../shared/schemas';
import type { ToolEntry, ToolsConfig } from '../../shared/types';
import { defaultToolsConfig } from '../defaults';
import { getTool, listTools } from '../tools';

describe('getTool', () => {
  test('存在するツールIDを指定すると対応するToolEntryを返す', () => {
    const tool = getTool('gh');
    expect(tool).toBeDefined();
    expect(tool?.id).toBe('gh');
  });

  test('存在しないツールIDを指定するとundefinedを返す', () => {
    const tool = getTool('non-existent-tool');
    expect(tool).toBeUndefined();
  });
});

describe('listTools', () => {
  test('設定されているすべてのツールのリストを返す', () => {
    const tools = listTools();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(1); // tools.tsのsampleToolsは1個
  });

  test('返されるツールは有効なToolEntryオブジェクト', () => {
    const tools = listTools();
    tools.forEach((tool) => {
      expect(tool).toHaveProperty('installer');
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('repository');
      expect(typeof tool.installer).toBe('string');
      expect(typeof tool.id).toBe('string');
      expect(typeof tool.repository).toBe('string');
    });
  });
});

describe('defaultToolsConfig', () => {
  test('デフォルト設定を正しく返す', () => {
    const config = defaultToolsConfig();

    expect(config.defaultInstallDir).toBe('.tools/bin');
    expect(config.defaultTempDir).toBe('.tools/tmp');
    expect(Array.isArray(config.tools)).toBe(true);
  });

  test('9個のデフォルトツールが含まれている', () => {
    const config = defaultToolsConfig();

    expect(config.tools).toHaveLength(9);
  });

  test('デフォルトツールにgitleaksが含まれている', () => {
    const config = defaultToolsConfig();

    const gitleaks = config.tools.find((tool) => tool.id === 'gitleaks');
    expect(gitleaks).toBeDefined();
    expect(gitleaks?.installer).toBe('eget');
    expect(gitleaks?.repository).toBe('gitleaks/gitleaks');
  });

  test('デフォルトツールにghが含まれている', () => {
    const config = defaultToolsConfig();

    const gh = config.tools.find((tool) => tool.id === 'gh');
    expect(gh).toBeDefined();
    expect(gh?.installer).toBe('eget');
    expect(gh?.repository).toBe('cli/cli');
  });

  test('すべてのデフォルトツールが有効なegetエントリー', () => {
    const config = defaultToolsConfig();

    config.tools.forEach((tool) => {
      expect(tool.installer).toBe('eget');
      expect(typeof tool.id).toBe('string');
      expect(typeof tool.repository).toBe('string');
      expect(tool.repository).toMatch(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/);
    });
  });
});

describe('ToolEntry型の検証', () => {
  test('必須フィールドを持つToolEntryオブジェクトを作成できる', () => {
    const toolEntry: ToolEntry = {
      installer: 'eget',
      id: 'gh',
      repository: 'cli/cli',
    };

    expect(toolEntry.installer).toBe('eget');
    expect(toolEntry.id).toBe('gh');
    expect(toolEntry.repository).toBe('cli/cli');
  });

  test('optionsフィールドを持つToolEntryオブジェクトを作成できる', () => {
    const toolEntry: ToolEntry = {
      installer: 'eget',
      id: 'gh',
      repository: 'cli/cli',
      options: {
        version: 'latest',
        args: ['--quiet'],
      },
    };

    expect(toolEntry.options?.version).toBe('latest');
    expect(toolEntry.options?.args).toEqual(['--quiet']);
  });
});

describe('ToolsConfig型の検証', () => {
  test('完全なToolsConfigオブジェクトを作成できる', () => {
    const toolsConfig: ToolsConfig = {
      defaultInstallDir: '.tools/bin',
      defaultTempDir: '.tools/tmp',
      tools: [
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            version: 'latest',
            args: ['--quiet'],
          },
        },
      ],
    };

    expect(toolsConfig.defaultInstallDir).toBe('.tools/bin');
    expect(toolsConfig.defaultTempDir).toBe('.tools/tmp');
    expect(toolsConfig.tools).toHaveLength(1);
    expect(toolsConfig.tools[0].id).toBe('gh');
  });
});

describe('ToolEntrySchema の検証', () => {
  test('有効なToolEntryオブジェクトを正常に検証できる', () => {
    const validToolEntry = {
      installer: 'eget',
      id: 'gh',
      repository: 'cli/cli',
    };

    const result = parse(ToolEntrySchema, validToolEntry);
    expect(result.installer).toBe('eget');
    expect(result.id).toBe('gh');
    expect(result.repository).toBe('cli/cli');
  });

  test('optionsを持つToolEntryオブジェクトを正常に検証できる', () => {
    const validToolEntry = {
      installer: 'eget',
      id: 'gh',
      repository: 'cli/cli',
      options: {
        version: 'latest',
        args: ['--quiet'],
      },
    };

    const result = parse(ToolEntrySchema, validToolEntry);
    expect(result.options?.version).toBe('latest');
    expect(result.options?.args).toEqual(['--quiet']);
  });

  test('必須フィールドが不足している場合はエラーを投げる', () => {
    const invalidToolEntry = {
      installer: 'eget',
      id: 'gh',
      // repository が不足
    };

    expect(() => parse(ToolEntrySchema, invalidToolEntry)).toThrow();
  });
});

describe('ToolsConfigSchema の検証', () => {
  test('有効なToolsConfigオブジェクトを正常に検証できる', () => {
    const validToolsConfig = {
      defaultInstallDir: '.tools/bin',
      defaultTempDir: '.tools/tmp',
      tools: [
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            version: 'latest',
            args: ['--quiet'],
          },
        },
      ],
    };

    const result = parse(ToolsConfigSchema, validToolsConfig);
    expect(result.defaultInstallDir).toBe('.tools/bin');
    expect(result.defaultTempDir).toBe('.tools/tmp');
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].id).toBe('gh');
  });

  test('必須フィールドが不足している場合はエラーを投げる', () => {
    const invalidToolsConfig = {
      defaultInstallDir: '.tools/bin',
      // defaultTempDir が不足
      tools: [],
    };

    expect(() => parse(ToolsConfigSchema, invalidToolsConfig)).toThrow();
  });
});
