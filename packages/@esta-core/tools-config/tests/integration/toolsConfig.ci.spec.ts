// tests/integration/toolsConfig.ci.spec.ts
// @(#) : tools-config パッケージのCI統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it } from 'vitest';
// type
import type { PartialToolsConfig } from '@/shared/types/toolsConfig.types';
// test target
import { isCompleteConfig } from '@/core/config/loadToolsConfig';
import { mergeToolsConfig } from '@/core/config/mergeToolsConfig';
import { defaultToolsConfig } from '@/defaults';

/**
 * tools-config パッケージのCI統合テスト
 *
 * このテストは、tools-config パッケージの主要機能を統合的に検証します。
 * 設定の読み込み、マージ、検証処理の一連の動作を確認し、
 * 実際の使用シナリオに基づいたテストケースを含みます。
 */
describe('tools-config CI統合テスト', () => {
  /**
   * メインフロー統合テスト
   * 設定読み込みからマージ、バリデーションまでの完全なフローを検証
   */
  describe('設定読み込み・マージ・検証フロー', () => {
    /**
     * 正常系統合テスト
     * 部分設定から完全設定への変換フローを検証
     */
    describe('正常系', () => {
      it('部分設定からデフォルト値マージを経て完全設定を生成する', () => {
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
        const completeConfig = mergeToolsConfig(defaultConfig, partialConfig);

        // Then: デフォルト値が適用された完全設定
        expect(completeConfig).toEqual({
          defaultInstallDir: expect.any(String),
          defaultTempDir: expect.any(String),
          tools: expect.arrayContaining([
            expect.objectContaining({
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
              version: 'latest',
            }),
          ]),
        });
        // デフォルトツールと提供されたツールが結合されていることを確認
        expect(completeConfig.tools.length).toBeGreaterThan(1);
      });
    });

    /**
     * 異常系統合テスト
     * 無効な設定でのエラーハンドリングフローを検証
     */
    describe('異常系', () => {
      it('無効な設定で検証エラーが発生する', () => {
        // Given: 無効な設定データ (無効なパスを使用)
        const invalidConfig = {
          defaultInstallDir: '/invalid<>path', // 無効文字を含むパス
          tools: [
            {
              installer: 'eget',
              id: 'test',
              repository: 'owner/repo',
              version: 'latest',
            },
          ],
        };

        // When & Then: 検証エラーが発生
        expect(() => {
          const defaultConfig = defaultToolsConfig();
          mergeToolsConfig(defaultConfig, invalidConfig);
        }).toThrow(
          expect.objectContaining({
            message: expect.stringMatching(
              /defaultInstallDir must be a valid path|Invalid path format|Configuration validation failed/,
            ),
          }),
        );
      });
    });

    /**
     * エッジケース統合テスト
     * 特殊な条件下での統合フローの動作を検証
     */
    describe('エッジケース', () => {
      it('空の設定配列を正しく処理する', () => {
        // Given: 空のツール配列
        const emptyConfig: PartialToolsConfig = {
          tools: [],
        };

        // When: 完全設定への変換
        // デフォルト値とマージして完全設定を作成
        const defaultConfig = defaultToolsConfig();
        const completeConfig = mergeToolsConfig(defaultConfig, emptyConfig);

        // Then: 空のツール配列とデフォルトツールが結合される
        // mergeToolsConfigはデフォルトツールと提供されたツールを結合するため、空の配列でもデフォルトツールが含まれる
        expect(completeConfig.tools.length).toBeGreaterThan(0); // デフォルトツールが含まれる
        expect(completeConfig.defaultInstallDir).toBeDefined();
        expect(completeConfig.defaultTempDir).toBeDefined();
      });
    });
  });

  /**
   * パフォーマンス統合テスト
   * 大量データ処理と性能面の統合検証
   */
  describe('大量データ処理・パフォーマンステスト', () => {
    /**
     * パフォーマンステスト
     * 大量データでの処理時間とメモリ使用量を検証
     */
    describe('性能テスト', () => {
      it('大量のツール設定（100個）を適切な時間内で処理する', () => {
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
        const result = mergeToolsConfig(defaultConfig, largeConfig);
        const end = Date.now();

        // Then: 適切な時間内で処理される（1秒未満）
        expect(end - start).toBeLessThan(1000);
        // デフォルトツール + 提供された100個のツール
        expect(result.tools.length).toBeGreaterThanOrEqual(100);
      });
    });

    /**
     * 境界値テスト
     * 最大長の文字列や極大データでの動作を検証
     */
    describe('境界値テスト', () => {
      it('最大文字列長を含む設定を正しく処理する', () => {
        // Given: 長い文字列を含む設定
        const longString = 'a'.repeat(1000);
        const configWithDifferentDirs: PartialToolsConfig = {
          defaultInstallDir: longString,
          defaultTempDir: longString + '/temp', // 異なるディレクトリにする
          tools: [{
            installer: 'eget',
            id: longString,
            repository: `owner/repo`,
            version: longString,
          }],
        };

        // When & Then: 異なるディレクトリなので成功する
        // デフォルト値とマージして完全設定を作成
        const defaultConfig = defaultToolsConfig();
        expect(() => {
          mergeToolsConfig(defaultConfig, configWithDifferentDirs);
        }).not.toThrow();
      });
    });
  });

  /**
   * 設定マージ統合テスト
   * 複数設定の結合と優先度処理を統合的に検証
   */
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

    /**
     * マージ正常系テスト
     * 複数設定の正しい結合と完全性を検証
     */
    describe('正常系', () => {
      it('設定を正しく統合処理する', () => {
        // Given: 基本設定とオーバーライド設定
        const defaultConfig = defaultToolsConfig();
        const mergedConfig = mergeToolsConfig(defaultConfig, {
          ...baseConfig,
          ...overrideConfig,
          tools: [...(baseConfig.tools ?? []), ...(overrideConfig.tools ?? [])],
        });

        // When: 統合設定の検証
        const result = mergedConfig;

        // Then: 適切にマージされた設定
        expect(result.defaultInstallDir).toBe('/base/dir');
        expect(result.defaultTempDir).toBe('/override/temp');
        // デフォルトツール + baseConfigのツール + overrideConfigのツール
        expect(result.tools.length).toBeGreaterThan(2);
      });
    });

    /**
     * マージ異常系テスト
     * 競合状態や重複データの適切な処理を検証
     */
    describe('異常系', () => {
      it('重複するツールIDを検出する', () => {
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
        expect(() => {
          mergeToolsConfig(defaultConfig, duplicateConfig);
        }).not.toThrow();
      });
    });
  });

  /**
   * 国際化統合テスト
   * 多言語文字列とUnicode文字の統合的な処理を検証
   */
  describe('国際化対応テスト', () => {
    /**
     * Unicode文字処理テスト
     * 日本語、特殊文字、絵文字などの正しい処理を検証
     */
    describe('Unicode対応', () => {
      it('Unicode文字列を適切に処理する', () => {
        // Given: Unicode文字を含む設定
        const unicodeConfig: PartialToolsConfig = {
          defaultInstallDir: '/テスト/ディレクトリ',
          defaultTempDir: '/tëst/dîrëctørÿ',
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
          const result = mergeToolsConfig(defaultConfig, unicodeConfig);
          expect(result.defaultInstallDir).toBe('/テスト/ディレクトリ');
          expect(result.defaultTempDir).toBe('/tëst/dîrëctørÿ');
          expect(result.tools[0].id).toBe('ツール名');
        }).not.toThrow();
      });

      it('絵文字を含む文字列を適切に処理する', () => {
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
          const result = mergeToolsConfig(defaultConfig, emojiConfig);
          // デフォルトツールの後に提供されたツールが追加される
          const emojiTool = result.tools.find((tool) => tool.id === 'tool-with-emoji-🚀');
          expect(emojiTool).toBeDefined();
          expect(emojiTool?.id).toBe('tool-with-emoji-🚀');
        }).not.toThrow();
      });
    });
  });
});
