// src/core/config/__tests__/defaults.spec.ts
// @(#) : defaults.ts関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { getDefaultTool, getDefaultTools, getDefaultToolsConfig } from '../defaults';

describe('defaults.ts functions', () => {
  describe('getDefaultToolsConfig', () => {
    describe('正常系', () => {
      it('デフォルト設定を返す', () => {
        // When: デフォルト設定を取得する
        const config = getDefaultToolsConfig();

        // Then: 期待される設定を返す
        expect(config).toBeDefined();
        expect(config.defaultInstallDir).toBe('.tools/bin');
        expect(config.defaultTempDir).toBe('.tools/tmp');
        expect(Array.isArray(config.tools)).toBe(true);
        expect(config.tools.length).toBeGreaterThan(0);
      });

      it('設定にすべての必須フィールドが含まれている', () => {
        // When: デフォルト設定を取得する
        const config = getDefaultToolsConfig();

        // Then: 必須フィールドが含まれる
        expect(config).toHaveProperty('defaultInstallDir');
        expect(config).toHaveProperty('defaultTempDir');
        expect(config).toHaveProperty('tools');
        expect(typeof config.defaultInstallDir).toBe('string');
        expect(typeof config.defaultTempDir).toBe('string');
        expect(Array.isArray(config.tools)).toBe(true);
      });

      it('設定のツール配列が有効なToolEntryを含む', () => {
        // When: デフォルト設定を取得する
        const config = getDefaultToolsConfig();

        // Then: 各ツールが有効なToolEntryである
        config.tools.forEach((tool) => {
          expect(tool).toHaveProperty('installer');
          expect(tool).toHaveProperty('id');
          expect(tool).toHaveProperty('repository');
          expect(typeof tool.installer).toBe('string');
          expect(typeof tool.id).toBe('string');
          expect(typeof tool.repository).toBe('string');
        });
      });

      it('複数回呼び出しても同じ内容を返す', () => {
        // When: デフォルト設定を複数回取得する
        const config1 = getDefaultToolsConfig();
        const config2 = getDefaultToolsConfig();

        // Then: 同じ内容を返す
        expect(config1).toEqual(config2);
        expect(config1.defaultInstallDir).toBe(config2.defaultInstallDir);
        expect(config1.defaultTempDir).toBe(config2.defaultTempDir);
        expect(config1.tools).toEqual(config2.tools);
      });

      it('返される設定は独立したオブジェクトである', () => {
        // When: デフォルト設定を2回取得する
        const config1 = getDefaultToolsConfig();
        const config2 = getDefaultToolsConfig();

        // Then: 異なるオブジェクトインスタンスである
        expect(config1).not.toBe(config2);
        expect(config1.tools).not.toBe(config2.tools);
      });
    });
  });

  describe('getDefaultTools', () => {
    describe('正常系', () => {
      it('デフォルトツールリストを返す', () => {
        // When: デフォルトツールリストを取得する
        const tools = getDefaultTools();

        // Then: ツールリストを返す
        expect(Array.isArray(tools)).toBe(true);
        expect(tools.length).toBeGreaterThan(0);
      });

      it('各ツールが有効なToolEntryである', () => {
        // When: デフォルトツールリストを取得する
        const tools = getDefaultTools();

        // Then: 各ツールが有効なToolEntryである
        tools.forEach((tool) => {
          expect(tool).toHaveProperty('installer');
          expect(tool).toHaveProperty('id');
          expect(tool).toHaveProperty('repository');
          expect(typeof tool.installer).toBe('string');
          expect(typeof tool.id).toBe('string');
          expect(typeof tool.repository).toBe('string');
        });
      });

      it('一般的な開発ツールが含まれている', () => {
        // When: デフォルトツールリストを取得する
        const tools = getDefaultTools();
        const toolIds = tools.map((tool) => tool.id);

        // Then: 一般的な開発ツールが含まれる
        expect(toolIds).toContain('gh');
        expect(toolIds).toContain('ripgrep');
        expect(toolIds).toContain('fd');
        expect(toolIds).toContain('bat');
        expect(toolIds).toContain('jq');
      });

      it('すべてのツールがegetインストーラーを使用している', () => {
        // When: デフォルトツールリストを取得する
        const tools = getDefaultTools();

        // Then: すべてegetインストーラーを使用している
        tools.forEach((tool) => {
          expect(tool.installer).toBe('eget');
        });
      });

      it('複数回呼び出しても同じ内容を返す', () => {
        // When: デフォルトツールリストを複数回取得する
        const tools1 = getDefaultTools();
        const tools2 = getDefaultTools();

        // Then: 同じ内容を返す
        expect(tools1).toEqual(tools2);
        expect(tools1.length).toBe(tools2.length);
      });

      it('返されるツールリストは独立したオブジェクトである', () => {
        // When: デフォルトツールリストを2回取得する
        const tools1 = getDefaultTools();
        const tools2 = getDefaultTools();

        // Then: 異なるオブジェクトインスタンスである
        expect(tools1).not.toBe(tools2);
        expect(tools1[0]).not.toBe(tools2[0]);
      });

      it('ツールの変更が元のリストに影響しない', () => {
        // When: デフォルトツールリストを取得して変更する
        const tools = getDefaultTools();
        const originalLength = tools.length;
        const originalFirstTool = { ...tools[0] };

        tools.push({
          installer: 'eget',
          id: 'test',
          repository: 'test/test',
        });
        tools[0].id = 'modified';

        // Then: 元のリストは変更されない
        const freshTools = getDefaultTools();
        expect(freshTools.length).toBe(originalLength);
        expect(freshTools[0].id).toBe(originalFirstTool.id);
      });
    });
  });

  describe('getDefaultTool', () => {
    describe('正常系', () => {
      it('存在するツールIDで正しいツールを返す', () => {
        // When: 存在するツールIDでツールを取得する
        const tool = getDefaultTool('gh');

        // Then: 正しいツールを返す
        expect(tool).toBeDefined();
        expect(tool?.id).toBe('gh');
        expect(tool?.installer).toBe('eget');
        expect(tool?.repository).toBe('cli/cli');
      });

      it('ripgrepツールを正しく返す', () => {
        // When: ripgrepツールを取得する
        const tool = getDefaultTool('ripgrep');

        // Then: 正しいツールを返す
        expect(tool).toBeDefined();
        expect(tool?.id).toBe('ripgrep');
        expect(tool?.repository).toBe('BurntSushi/ripgrep');
      });

      it('fdツールを正しく返す', () => {
        // When: fdツールを取得する
        const tool = getDefaultTool('fd');

        // Then: 正しいツールを返す
        expect(tool).toBeDefined();
        expect(tool?.id).toBe('fd');
        expect(tool?.repository).toBe('sharkdp/fd');
      });

      it('batツールを正しく返す', () => {
        // When: batツールを取得する
        const tool = getDefaultTool('bat');

        // Then: 正しいツールを返す
        expect(tool).toBeDefined();
        expect(tool?.id).toBe('bat');
        expect(tool?.repository).toBe('sharkdp/bat');
      });

      it('jqツールを正しく返す', () => {
        // When: jqツールを取得する
        const tool = getDefaultTool('jq');

        // Then: 正しいツールを返す
        expect(tool).toBeDefined();
        expect(tool?.id).toBe('jq');
        expect(tool?.repository).toBe('jqlang/jq');
      });

      it('返されるツールは独立したオブジェクトである', () => {
        // When: 同じツールを2回取得する
        const tool1 = getDefaultTool('gh');
        const tool2 = getDefaultTool('gh');

        // Then: 異なるオブジェクトインスタンスである
        expect(tool1).not.toBe(tool2);
        expect(tool1).toEqual(tool2);
      });

      it('ツールの変更が元のリストに影響しない', () => {
        // When: ツールを取得して変更する
        const tool = getDefaultTool('gh');
        if (tool) {
          tool.id = 'modified';
        }

        // Then: 次回取得時は元の値を返す
        const freshTool = getDefaultTool('gh');
        expect(freshTool?.id).toBe('gh');
      });
    });

    describe('異常系', () => {
      it('存在しないツールIDでundefinedを返す', () => {
        // When: 存在しないツールIDでツールを取得する
        const tool = getDefaultTool('nonexistent');

        // Then: undefinedを返す
        expect(tool).toBeUndefined();
      });

      it('空文字列でundefinedを返す', () => {
        // When: 空文字列でツールを取得する
        const tool = getDefaultTool('');

        // Then: undefinedを返す
        expect(tool).toBeUndefined();
      });

      it('空白文字でundefinedを返す', () => {
        // When: 空白文字でツールを取得する
        const tool = getDefaultTool('   ');

        // Then: undefinedを返す
        expect(tool).toBeUndefined();
      });

      it('大文字小文字が異なるIDでundefinedを返す', () => {
        // When: 大文字小文字が異なるIDでツールを取得する
        const tool = getDefaultTool('GH');

        // Then: undefinedを返す
        expect(tool).toBeUndefined();
      });

      it('部分的なIDでundefinedを返す', () => {
        // When: 部分的なIDでツールを取得する
        const tool = getDefaultTool('g');

        // Then: undefinedを返す
        expect(tool).toBeUndefined();
      });
    });
  });

  describe('相互運用性', () => {
    it('getDefaultToolsConfigのツールとgetDefaultToolsが一致する', () => {
      // When: 両方の関数でツールを取得する
      const configTools = getDefaultToolsConfig().tools;
      const defaultTools = getDefaultTools();

      // Then: 同じ長さと構造を持つ（スキーマ変換により大文字小文字が異なる）
      expect(configTools.length).toBe(defaultTools.length);
      expect(configTools[0].installer).toBe(defaultTools[0].installer);
      expect(configTools[0].id).toBe(defaultTools[0].id);
      expect(configTools[0].repository).toBe(defaultTools[0].repository.toLowerCase());
    });

    it('getDefaultToolsの各ツールがgetDefaultToolで取得できる', () => {
      // When: デフォルトツールリストを取得する
      const tools = getDefaultTools();

      // Then: 各ツールがgetDefaultToolで取得できる
      tools.forEach((tool) => {
        const retrievedTool = getDefaultTool(tool.id);
        expect(retrievedTool).toEqual(tool);
      });
    });

    it('getDefaultToolsConfigのツールがgetDefaultToolで取得できる', () => {
      // When: デフォルト設定を取得する
      const config = getDefaultToolsConfig();

      // Then: 各ツールがgetDefaultToolで取得できる（スキーマ変換を考慮）
      config.tools.forEach((tool) => {
        const retrievedTool = getDefaultTool(tool.id);
        expect(retrievedTool).toBeDefined();
        expect(retrievedTool?.installer).toBe(tool.installer);
        expect(retrievedTool?.id).toBe(tool.id);
        expect(retrievedTool?.repository.toLowerCase()).toBe(tool.repository);
      });
    });
  });
});
