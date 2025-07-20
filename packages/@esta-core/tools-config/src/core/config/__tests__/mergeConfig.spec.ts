// vitest
import { describe, expect, test } from 'vitest';
// type
import type { PartialToolsConfig, ToolsConfig } from '../../../../shared/types/toolsConfig.types';
// test target
import { mergeToolsConfig } from '../mergeToolsConfig';

/**
 * mergeToolsConfig関数の単体テスト
 * デフォルト設定と読み込み設定をマージして完全な設定を生成する関数のテスト
 */
describe('mergeToolsConfig', () => {
  test('should return defaultConfig when loadConfig is empty', () => {
    const defaultConfig: ToolsConfig = {
      defaultInstallDir: '/default',
      defaultTempDir: '/tmp',
      tools: [],
    };
    const loadConfig: PartialToolsConfig = {};

    const resultConfig = mergeToolsConfig(defaultConfig, loadConfig);

    expect(resultConfig).toEqual(defaultConfig);
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

    const resultConfig = mergeToolsConfig(defaultConfig, loadConfig);

    expect(resultConfig).toEqual({
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

    const resultConfig = mergeToolsConfig(defaultConfig, loadConfig);

    expect(resultConfig).toEqual({
      defaultInstallDir: '/loaded',
      defaultTempDir: '/tmp',
      tools: [{ installer: 'eget', id: 'default-tool', repository: 'default/repo' }],
    });
  });

  /**
   * マージ結果バリデーションテスト
   * マージされた設定が完全設定スキーマに適合していることを検証
   */
  describe('バリデーション機能', () => {
    test('結果を完全な設定として検証する', () => {
      // Arrange
      const defaultConfig: ToolsConfig = {
        defaultInstallDir: '/default',
        defaultTempDir: '/tmp',
        tools: [],
      };
      const loadConfig: PartialToolsConfig = {
        defaultInstallDir: '/custom',
        tools: [{ installer: 'eget', id: 'test-tool', repository: 'owner/repo' }],
      };

      // Act
      const resultConfig = mergeToolsConfig(defaultConfig, loadConfig);

      // Assert
      // 結果が ToolsConfig 型であることを確認
      expect(resultConfig).toBeDefined();
      expect(typeof resultConfig).toBe('object');
      expect(resultConfig).toHaveProperty('defaultInstallDir');
      expect(resultConfig).toHaveProperty('defaultTempDir');
      expect(resultConfig).toHaveProperty('tools');
      expect(Array.isArray(resultConfig.tools)).toBe(true);
      // CompleteToolsConfigSchema で検証されたオブジェクトが返されることを期待
      expect(resultConfig.defaultInstallDir).toBe('/custom');
      expect(resultConfig.defaultTempDir).toBe('/tmp');
      expect(resultConfig.tools).toHaveLength(1);
    });

    test('無効なマージ結果の場合、適切なエラーを投げる', () => {
      // Arrange
      const defaultConfig: ToolsConfig = {
        defaultInstallDir: '/default',
        defaultTempDir: '/tmp',
        tools: [],
      };
      const invalidLoadConfig = {
        defaultInstallDir: 123, // 無効な型
        tools: 'invalid', // 無効な型
      };

      // Act & Assert
      // 検証機能を実装した後は、この場合にエラーが投げられることを期待
      expect(() => {
        mergeToolsConfig(defaultConfig, invalidLoadConfig as unknown as PartialToolsConfig);
      }).toThrow('Invalid configuration provided for merging');
    });
  });
});
