// src: ./tests/e2e/loadConfig.spec.ts
// 設定ファイル読み込みのE2Eテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// types
import { TSearchConfigFileType } from '../../shared/types/searchFileType.types';

// test unit
import { loadConfig } from '@/loadConfig';

// test framework
import { agE2ETestFramework } from '@agla-e2e/fileio-framework';
import type { AgE2eConfigFileSpec, AgE2eTestScenario } from '@agla-e2e/fileio-framework';

// Helper function to wrap loadConfig for executeTest (object API)
const loadConfigWrapper = async <T = object>(...args: unknown[]): Promise<T> => {
  return await loadConfig<T>({
    baseNames: args[0] as string | readonly string[],
    appName: args[1] as string,
    searchType: args[2] as TSearchConfigFileType | undefined,
  });
};

describe('loadConfig E2E', () => {
  describe('設定ファイル形式別の読み込み', () => {
    it('JSON設定ファイルを正しく読み込むべき', async () => {
      const configData = { name: 'Test App', version: '1.0.0', debug: true };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'myapp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'json-test',
        'testApp',
        configFiles,
        loadConfigWrapper<typeof configData>,
        'myapp',
        'testApp',
      );

      expect(result).toEqual(configData);
    });

    it('YAML設定ファイルを正しく読み込むべき', async () => {
      const yamlContent = `
name: Test App
version: 1.0.0
debug: true
features:
  - auth
  - logging
`;
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'myapp.yaml', content: yamlContent, format: 'yaml' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'yaml-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'myapp',
        'testApp',
      );

      expect(result).toEqual({
        name: 'Test App',
        version: '1.0.0',
        debug: true,
        features: ['auth', 'logging'],
      });
    });

    it('コメント付きJSONC設定ファイルを正しく読み込むべき', async () => {
      const jsoncContent = `{
  // Application configuration
  "name": "Test App",
  "version": "1.0.0",
  /* Multi-line comment
     for debug flag */
  "debug": true
}`;
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'myapp.jsonc', content: jsoncContent, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'jsonc-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'myapp',
        'testApp',
      );

      expect(result).toEqual({
        name: 'Test App',
        version: '1.0.0',
        debug: true,
      });
    });

    it('TypeScript設定ファイルを正しく読み込むべき', async () => {
      const tsContent = `export default {
  name: 'Test App',
  version: '1.0.0',
  debug: true,
  database: {
    host: 'localhost',
    port: 5432
  }
};`;
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'myapp.ts', content: tsContent, format: 'typescript' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'ts-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'myapp',
        'testApp',
      );

      expect(result).toEqual({
        name: 'Test App',
        version: '1.0.0',
        debug: true,
        database: {
          host: 'localhost',
          port: 5432,
        },
      });
    });
  });

  describe('ファイル検索とプライオリティ', () => {
    it('ドットプレフィックス付き設定ファイルを正しく読み込むべき', async () => {
      const configData = { hidden: true, name: 'Hidden Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: '.myapp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'dot-prefix-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'myapp',
        'testApp',
      );

      expect(result).toEqual(configData);
    });

    it('ドットプレフィックスなしのファイルを優先すべき', async () => {
      const normalConfigData = { priority: 'normal', name: 'Normal Config' };
      const hiddenConfigData = { priority: 'hidden', name: 'Hidden Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'myapp.json', content: normalConfigData, format: 'json' },
        { filename: '.myapp.json', content: hiddenConfigData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'priority-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'myapp',
        'testApp',
      );

      expect(result).toEqual(normalConfigData);
    });
  });

  describe('エラーハンドリングと基本動作', () => {
    it('設定ファイルが見つからない場合はエラーを投げるべき', async () => {
      const configFiles: AgE2eConfigFileSpec[] = [];

      await expect(async () => {
        await agE2ETestFramework.executeTest(
          'not-found-test',
          'testApp',
          configFiles,
          loadConfigWrapper,
          'nonexistent',
          'testApp',
        );
      }).rejects.toThrow('Config file not found.');
    });

    it('現在のワーキングディレクトリをデフォルトとして使用すべき', async () => {
      const configData = { test: true };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'testConfig.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'cwd-test',
        'testConfig',
        configFiles,
        loadConfigWrapper,
        'testConfig',
        'testConfig',
      );

      expect(result).toEqual(configData);
    });
  });

  describe('検索タイプ別の設定読み込み', () => {
    it('USER検索タイプで設定を読み込むべき（デフォルト）', async () => {
      const configData = { type: 'user', name: 'User Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'userApp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'user-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'userApp',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('SYSTEM検索タイプで設定を読み込むべき', async () => {
      const configData = { type: 'system', name: 'System Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'systemApp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'system-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'systemApp',
        'testApp',
        TSearchConfigFileType.SYSTEM,
      );

      expect(result).toEqual(configData);
    });

    it('検索タイプが指定されていない場合はUSERタイプをデフォルトとすべき', async () => {
      const configData = { type: 'default', name: 'Default Config' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'defaultApp.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'default-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'defaultApp',
        'testApp',
      );

      expect(result).toEqual(configData);
    });
  });

  describe('パラメータ化テストの例', () => {
    it('複数の設定形式テストを実行すべき', async () => {
      const scenarios: AgE2eTestScenario[] = [
        {
          description: 'JSON format',
          configFiles: [{ filename: 'app.json', content: { format: 'json' }, format: 'json' }],
          functionArgs: ['app', 'testApp'],
          expectedResult: { format: 'json' },
        },
        {
          description: 'YAML format',
          configFiles: [{ filename: 'app.yaml', content: 'format: yaml', format: 'yaml' }],
          functionArgs: ['app', 'testApp'],
          expectedResult: { format: 'yaml' },
        },
      ];

      const results = await agE2ETestFramework.runParameterizedTests(
        'multi-format-test',
        'testApp',
        scenarios,
        loadConfigWrapper,
      );

      for (const { scenario, result } of results) {
        expect(await result).toEqual(scenario.expectedResult);
      }
    });
  });

  describe('複数設定ファイルの優先順位', () => {
    it('利用可能な場合はestarc設定ファイルを読み込むべき', async () => {
      const configData = { source: 'estarc', priority: 1 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'estarc.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'multi-config-estarc-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'estarc',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('利用可能な場合はesta.config設定ファイルを読み込むべき', async () => {
      const configData = { source: 'esta.config', priority: 2 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'esta.config.yaml', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'multi-config-esta-config-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'esta.config',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('配列構文を使用して複数オプションから最初の利用可能な設定ファイルを読み込むべき', async () => {
      const configData = { source: 'estarc', priority: 1 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'estarc.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'multi-config-array-first-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        ['estarc', 'esta.config'], // Pass array as first argument
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('配列構文で最初のファイルが利用できない場合は2番目の設定ファイルにフォールバックすべき', async () => {
      const configData = { source: 'esta.config', priority: 2 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'esta.config.yaml', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'multi-config-array-fallback-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        ['estarc', 'esta.config'], // Pass array, should fallback to esta.config
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('配列構文で複数のファイルが利用可能な場合は最初の設定ファイルを優先すべき', async () => {
      const estarcData = { source: 'estarc', priority: 1 };
      const estaConfigData = { source: 'esta.config', priority: 2 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'estarc.json', content: estarcData, format: 'json' },
        { filename: 'esta.config.json', content: estaConfigData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'multi-config-array-priority-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        ['estarc', 'esta.config'], // Should load estarc first
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(estarcData); // Should get estarc data, not esta.config
    });

    it('両方存在する場合はesta.configよりもestarcを優先することを実証すべき', async () => {
      const estarcData = { source: 'estarc', priority: 1 };
      const estaConfigData = { source: 'esta.config', priority: 2 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'estarc.json', content: estarcData, format: 'json' },
        { filename: 'esta.config.json', content: estaConfigData, format: 'json' },
      ];

      // Load estarc first
      const estarcResult = await agE2ETestFramework.executeTest(
        'multi-config-priority-estarc-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'estarc',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(estarcResult).toEqual(estarcData);

      // Load esta.config second to show both are available
      const estaConfigResult = await agE2ETestFramework.executeTest(
        'multi-config-priority-esta-config-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'esta.config',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(estaConfigResult).toEqual(estaConfigData);
    });
  });

  describe('新しいオブジェクト形式API', () => {
    it('オブジェクト形式でJSON設定ファイルを正しく読み込むべき', async () => {
      const configData = { name: 'Object API Test', version: '2.0.0', objectApi: true };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'objectTest.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'object-api-json-test',
        'testApp',
        configFiles,
        loadConfigWrapper<typeof configData>,
        'objectTest',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('オブジェクト形式で複数ベース名をサポートすべき', async () => {
      const configData = { source: 'primary', priority: 1 };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'primary.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'object-api-multi-base-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        ['secondary', 'primary'], // Should find primary
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });

    it('オブジェクト形式で検索タイプを指定できるべき', async () => {
      const configData = { search: 'user', scope: 'user-specific' };
      const configFiles: AgE2eConfigFileSpec[] = [
        { filename: 'userTest.json', content: configData, format: 'json' },
      ];

      const result = await agE2ETestFramework.executeTest(
        'object-api-search-type-test',
        'testApp',
        configFiles,
        loadConfigWrapper,
        'userTest',
        'testApp',
        TSearchConfigFileType.USER,
      );

      expect(result).toEqual(configData);
    });
  });
});
