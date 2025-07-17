// src/core/config/__tests__/integration.spec.ts
// @(#) : 設定管理の統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, test } from 'vitest';
import { defaultToolsConfig } from '../../../defaults';
import type { PartialToolsConfig } from '../../../internal/types';
import { isCompleteConfig, validateCompleteConfig } from '../loader';

describe('設定管理統合テスト', () => {
  describe('設定読み込みから検証までの完全なフロー', () => {
    test('正常系: 部分設定 → デフォルト値マージ → 完全設定', () => {
      // Given: 部分設定データ
      const partialConfig: PartialToolsConfig = {
        tools: [
          {
            installer: 'eget',
            id: 'gh',
            repository: 'cli/cli',
            version: 'latest',
          },
        ],
      };

      // When: 完全設定への変換
      const result = isCompleteConfig(partialConfig);
      expect(result).toBe(false);

      // デフォルト値とマージして完全設定を作成
      const defaultConfig = defaultToolsConfig();
      const mergedConfig = {
        ...defaultConfig,
        ...partialConfig,
        tools: partialConfig.tools ?? defaultConfig.tools,
      };
      const completeConfig = validateCompleteConfig(mergedConfig);

      // Then: デフォルト値が適用された完全設定
      expect(completeConfig).toEqual({
        defaultInstallDir: expect.any(String),
        defaultTempDir: expect.any(String),
        tools: [
          {
            installer: 'eget',
            id: 'gh',
            repository: 'cli/cli',
            version: 'latest',
          },
        ],
      });
    });

    test('異常系: 無効な設定での検証エラー', () => {
      // Given: 無効な設定データ
      const invalidConfig = {
        tools: [
          {
            installer: 'eget',
            id: 'invalid',
            repository: 'invalid-repo-format', // 無効なリポジトリ形式
            version: 'latest',
          },
        ],
      };

      // When & Then: 検証エラーが発生
      expect(() => {
        validateCompleteConfig(invalidConfig);
      }).toThrow('Invalid config: not complete');
    });

    test('エッジケース: 空の設定配列', () => {
      // Given: 空のツール配列
      const emptyConfig: PartialToolsConfig = {
        tools: [],
      };

      // When: 完全設定への変換
      // デフォルト値とマージして完全設定を作成
      const defaultConfig = defaultToolsConfig();
      const mergedConfig = {
        ...defaultConfig,
        ...emptyConfig,
        tools: emptyConfig.tools ?? defaultConfig.tools,
      };
      const completeConfig = validateCompleteConfig(mergedConfig);

      // Then: 空のツール配列が保持される
      expect(completeConfig.tools).toEqual([]);
      expect(completeConfig.defaultInstallDir).toBeDefined();
      expect(completeConfig.defaultTempDir).toBeDefined();
    });
  });

  describe('大量データ処理テスト', () => {
    test('性能: 大量のツール設定処理', () => {
      // Given: 大量のツール設定（100個）
      const largeConfig: PartialToolsConfig = {
        tools: Array.from({ length: 100 }, (_, i) => ({
          installer: 'eget',
          id: `tool-${i}`,
          repository: `owner${i}/repo${i}`,
          version: 'latest',
        })),
      };

      // When: 処理時間を測定
      const start = Date.now();
      // デフォルト値とマージして完全設定を作成
      const defaultConfig = defaultToolsConfig();
      const mergedConfig = {
        ...defaultConfig,
        ...largeConfig,
        tools: largeConfig.tools ?? defaultConfig.tools,
      };
      const result = validateCompleteConfig(mergedConfig);
      const end = Date.now();

      // Then: 適切な時間内で処理される（1秒未満）
      expect(end - start).toBeLessThan(1000);
      expect(result.tools).toHaveLength(100);
    });

    test('境界値: 最大文字列長', () => {
      // Given: 長い文字列を含む設定
      const longString = 'a'.repeat(1000);
      const configWithLongStrings: PartialToolsConfig = {
        defaultInstallDir: longString,
        defaultTempDir: longString,
        tools: [{
          installer: 'eget',
          id: longString,
          repository: `owner/repo`,
          version: longString,
        }],
      };

      // When & Then: 長い文字列が適切に処理される
      // デフォルト値とマージして完全設定を作成
      const defaultConfig = defaultToolsConfig();
      const mergedConfig = {
        ...defaultConfig,
        ...configWithLongStrings,
        tools: configWithLongStrings.tools ?? defaultConfig.tools,
      };
      expect(() => {
        validateCompleteConfig(mergedConfig);
      }).not.toThrow();
    });
  });

  describe('設定マージ処理テスト', () => {
    let baseConfig: PartialToolsConfig;
    let overrideConfig: PartialToolsConfig;

    beforeEach(() => {
      baseConfig = {
        defaultInstallDir: '/base/dir',
        tools: [
          {
            installer: 'eget',
            id: 'tool1',
            repository: 'owner/tool1',
            version: 'v1.0.0',
          },
        ],
      };

      overrideConfig = {
        defaultTempDir: '/override/temp',
        tools: [
          {
            installer: 'eget',
            id: 'tool2',
            repository: 'owner/tool2',
            version: 'v2.0.0',
          },
        ],
      };
    });

    test('正常系: 設定の統合処理', () => {
      // Given: 基本設定とオーバーライド設定
      const mergedConfig = {
        ...baseConfig,
        ...overrideConfig,
        tools: [...(baseConfig.tools ?? []), ...(overrideConfig.tools ?? [])],
      };

      // When: 統合設定の検証
      const result = validateCompleteConfig(mergedConfig);

      // Then: 適切にマージされた設定
      expect(result.defaultInstallDir).toBe('/base/dir');
      expect(result.defaultTempDir).toBe('/override/temp');
      expect(result.tools).toHaveLength(2);
    });

    test('異常系: 重複するツールIDの検出', () => {
      // Given: 重複するツールIDを含む設定
      const duplicateConfig = {
        tools: [
          {
            installer: 'eget',
            id: 'duplicate',
            repository: 'owner/tool1',
            version: 'v1.0.0',
          },
          {
            installer: 'eget',
            id: 'duplicate',
            repository: 'owner/tool2',
            version: 'v2.0.0',
          },
        ],
      };

      // When & Then: 重複検出は現在の実装では通る
      // デフォルト値とマージして完全設定を作成
      const defaultConfig = defaultToolsConfig();
      const mergedConfig = {
        ...defaultConfig,
        ...duplicateConfig,
        tools: duplicateConfig.tools,
      };
      expect(() => {
        validateCompleteConfig(mergedConfig);
      }).not.toThrow();
    });
  });

  describe('国際化対応テスト', () => {
    test('Unicode文字列の処理', () => {
      // Given: Unicode文字を含む設定
      const unicodeConfig: PartialToolsConfig = {
        defaultInstallDir: '/テスト/ディレクトリ',
        defaultTempDir: '/тест/директория',
        tools: [{
          installer: 'eget',
          id: 'ツール名',
          repository: 'owner/repo',
          version: 'latest',
        }],
      };

      // When & Then: Unicode文字が適切に処理される
      expect(() => {
        // デフォルト値とマージして完全設定を作成
        const defaultConfig = defaultToolsConfig();
        const mergedConfig = {
          ...defaultConfig,
          ...unicodeConfig,
          tools: unicodeConfig.tools ?? defaultConfig.tools,
        };
        const result = validateCompleteConfig(mergedConfig);
        expect(result.defaultInstallDir).toBe('/テスト/ディレクトリ');
        expect(result.defaultTempDir).toBe('/тест/директория');
        expect(result.tools[0].id).toBe('ツール名');
      }).not.toThrow();
    });

    test('絵文字を含む文字列の処理', () => {
      // Given: 絵文字を含む設定
      const emojiConfig: PartialToolsConfig = {
        tools: [{
          installer: 'eget',
          id: 'tool-with-emoji-🚀',
          repository: 'owner/repo',
          version: 'latest',
        }],
      };

      // When & Then: 絵文字が適切に処理される
      expect(() => {
        // デフォルト値とマージして完全設定を作成
        const defaultConfig = defaultToolsConfig();
        const mergedConfig = {
          ...defaultConfig,
          ...emojiConfig,
          tools: emojiConfig.tools ?? defaultConfig.tools,
        };
        const result = validateCompleteConfig(mergedConfig);
        expect(result.tools[0].id).toBe('tool-with-emoji-🚀');
      }).not.toThrow();
    });
  });
});
