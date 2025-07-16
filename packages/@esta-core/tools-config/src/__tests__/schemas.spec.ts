import { parse } from 'valibot';
import { describe, expect, it } from 'vitest';
import { ToolEntrySchema, ToolsConfigSchema } from '../../shared/schemas';
import type { ToolEntry, ToolsConfig } from '../../shared/types';

describe('Type Definitions', () => {
  describe('ToolEntry型', () => {
    it('should create ToolEntry with required fields', () => {
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
      };

      expect(toolEntry.installer).toBe('eget');
      expect(toolEntry.id).toBe('gh');
      expect(toolEntry.repository).toBe('cli/cli');
    });

    it('should create ToolEntry with options field', () => {
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

  describe('ToolsConfig型', () => {
    it('should create complete ToolsConfig object', () => {
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
});

describe('Schema Validation', () => {
  describe('ToolEntrySchema', () => {
    describe('正常なケース', () => {
      it('should validate valid ToolEntry object', () => {
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

      it('should validate ToolEntry with options', () => {
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
    });

    describe('正規化の検証', () => {
      it('should normalize id and repository to lowercase', () => {
        const validToolEntry = {
          installer: 'eget',
          id: 'GH',
          repository: 'CLI/CLI',
        };

        const result = parse(ToolEntrySchema, validToolEntry);
        expect(result.id).toBe('gh');
        expect(result.repository).toBe('cli/cli');
      });

      it('should normalize args array to lowercase', () => {
        const validToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            version: 'latest',
            args: ['--QUIET', '--VERBOSE'],
          },
        };

        const result = parse(ToolEntrySchema, validToolEntry);
        expect(result.options?.args).toEqual(['--quiet', '--verbose']);
      });
    });

    describe('エラーケース', () => {
      it('should throw error when required field is missing', () => {
        const invalidToolEntry = {
          installer: 'eget',
          id: 'gh',
          // repository が不足
        };

        expect(() => parse(ToolEntrySchema, invalidToolEntry)).toThrow();
      });
    });
  });

  describe('ToolsConfigSchema', () => {
    describe('正常なケース', () => {
      it('should validate complete ToolsConfig object', () => {
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
    });

    describe('パス正規化の検証', () => {
      it('should normalize paths to "/" format with lowercase', () => {
        const validToolsConfig = {
          defaultInstallDir: '.TOOLS\\BIN',
          defaultTempDir: '.TOOLS\\TMP',
          tools: [],
        };

        const result = parse(ToolsConfigSchema, validToolsConfig);
        expect(result.defaultInstallDir).toBe('.tools/bin');
        expect(result.defaultTempDir).toBe('.tools/tmp');
      });

      it('should normalize Windows drive letter paths', () => {
        const validToolsConfig = {
          defaultInstallDir: 'C:\\PROGRAM FILES\\TOOLS',
          defaultTempDir: 'D:\\TEMP\\BUILD',
          tools: [],
        };

        const result = parse(ToolsConfigSchema, validToolsConfig);
        expect(result.defaultInstallDir).toBe('c:/program files/tools');
        expect(result.defaultTempDir).toBe('d:/temp/build');
      });

      it('should normalize mixed path separators', () => {
        const validToolsConfig = {
          defaultInstallDir: 'TOOLS\\mixed/path\\SEPARATORS',
          defaultTempDir: '/unix\\windows/MIXED\\path',
          tools: [],
        };

        const result = parse(ToolsConfigSchema, validToolsConfig);
        expect(result.defaultInstallDir).toBe('tools/mixed/path/separators');
        expect(result.defaultTempDir).toBe('/unix/windows/mixed/path');
      });
    });

    describe('エラーケース', () => {
      it('should throw error for double slash paths', () => {
        const invalidToolsConfig = {
          defaultInstallDir: 'tools//bin//subfolder',
          defaultTempDir: '/tmp/build/cache',
          tools: [],
        };

        expect(() => parse(ToolsConfigSchema, invalidToolsConfig)).toThrow();
      });

      it('should throw error when required field is missing', () => {
        const invalidToolsConfig = {
          defaultInstallDir: '.tools/bin',
          // defaultTempDir が不足
          tools: [],
        };

        expect(() => parse(ToolsConfigSchema, invalidToolsConfig)).toThrow();
      });
    });
  });
});
