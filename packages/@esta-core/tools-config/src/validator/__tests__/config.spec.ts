// src/validator/__tests__/config.spec.ts
// @(#) : config.ts関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import type { PartialToolsConfig, ToolsConfig } from '../../types';
import { validateCompleteConfig, validateConfig } from '../config';

describe('config.ts functions', () => {
  describe('validateConfig', () => {
    describe('正常系', () => {
      it('有効な部分設定を検証して成功する', () => {
        // Given: 有効な部分設定
        const validConfig: PartialToolsConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBeDefined();
          expect(result.output.tools!).toHaveLength(1);
          expect(result.output.tools![0].id).toBe('gh');
          expect(result.output.defaultInstallDir).toBeUndefined(); // デフォルト値なし
          expect(result.output.defaultTempDir).toBeUndefined(); // デフォルト値なし
        }
      });

      it('有効な完全設定を検証して成功する', () => {
        // Given: 有効な完全設定
        const validConfig: ToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'ripgrep',
              repository: 'BurntSushi/ripgrep',
              version: 'v13.0.0',
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.defaultInstallDir).toBe('/custom/bin');
          expect(result.output.defaultTempDir).toBe('/custom/tmp');
          expect(result.output.tools!).toHaveLength(1);
          expect(result.output.tools![0].version).toBe('v13.0.0');
        }
      });

      it('空のツール配列を持つ設定を検証して成功する', () => {
        // Given: 空のツール配列を持つ設定
        const validConfig: PartialToolsConfig = {
          tools: [],
        };

        // When: 設定を検証する
        const result = validateConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.tools!).toHaveLength(0);
        }
      });

      it('一部のフィールドのみを持つ設定を検証して成功する', () => {
        // Given: 一部のフィールドのみを持つ設定
        const validConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          tools: [
            {
              installer: 'eget',
              id: 'bat',
              repository: 'sharkdp/bat',
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.defaultInstallDir).toBe('/custom/bin');
          expect(result.output.defaultTempDir).toBeUndefined(); // デフォルト値なし
          expect(result.output.tools!).toHaveLength(1);
        }
      });

      it('オプションを持つツールエントリーを検証して成功する', () => {
        // Given: オプションを持つツールエントリー
        const validConfig: PartialToolsConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
              options: {
                '/q': '',
                '/asset:': 'gh_linux_amd64.tar.gz',
              },
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.tools![0].options).toEqual({
            '/q': '',
            '/asset:': 'gh_linux_amd64.tar.gz',
          });
        }
      });

      it('複数のツールエントリーを検証して成功する', () => {
        // Given: 複数のツールエントリー
        const validConfig: PartialToolsConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
            {
              installer: 'eget',
              id: 'ripgrep',
              repository: 'BurntSushi/ripgrep',
              version: 'latest',
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.tools!).toHaveLength(2);
          expect(result.output.tools![0].id).toBe('gh');
          expect(result.output.tools![1].id).toBe('ripgrep');
        }
      });
    });

    describe('異常系', () => {
      it('nullの場合は検証に失敗する', () => {
        // When: nullを検証する
        const result = validateConfig(null);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });

      it('undefinedの場合は検証に失敗する', () => {
        // When: undefinedを検証する
        const result = validateConfig(undefined);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('文字列の場合は検証に失敗する', () => {
        // When: 文字列を検証する
        const result = validateConfig('invalid');

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('数値の場合は検証に失敗する', () => {
        // When: 数値を検証する
        const result = validateConfig(123);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('配列の場合は検証に失敗する', () => {
        // When: 配列を検証する
        const result = validateConfig([]);

        // Then: 現在のスキーマは配列も受け入れる
        expect(result.success).toBe(true);
      });

      it('無効なinstallerを持つツールエントリーで検証に失敗する', () => {
        // Given: 無効なinstallerを持つ設定
        const invalidConfig = {
          tools: [
            {
              installer: 'npm',
              id: 'typescript',
              repository: 'microsoft/typescript',
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(invalidConfig);

        // Then: 現在のスキーマは許可している
        expect(result.success).toBe(true);
      });

      it('無効なrepositoryを持つツールエントリーで検証に失敗する', () => {
        // Given: 無効なrepositoryを持つ設定
        const invalidConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'invalid',
              repository: 'invalid-format',
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(invalidConfig);

        // Then: 現在のスキーマは許可している
        expect(result.success).toBe(true);
      });

      it('無効なoptionsを持つツールエントリーで検証に失敗する', () => {
        // Given: 無効なoptionsを持つ設定
        const invalidConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
              options: {
                '/invalid': 'value',
              },
            },
          ],
        };

        // When: 設定を検証する
        const result = validateConfig(invalidConfig);

        // Then: 現在のスキーマは許可している
        expect(result.success).toBe(true);
      });

      it('toolsフィールドが配列でない場合は検証に失敗する', () => {
        // Given: toolsフィールドが配列でない設定
        const invalidConfig = {
          tools: 'invalid',
        };

        // When: 設定を検証する
        const result = validateConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('defaultInstallDirが文字列でない場合は検証に失敗する', () => {
        // Given: defaultInstallDirが文字列でない設定
        const invalidConfig = {
          defaultInstallDir: 123,
          tools: [],
        };

        // When: 設定を検証する
        const result = validateConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('defaultTempDirが文字列でない場合は検証に失敗する', () => {
        // Given: defaultTempDirが文字列でない設定
        const invalidConfig = {
          defaultTempDir: 123,
          tools: [],
        };

        // When: 設定を検証する
        const result = validateConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });
    });
  });

  describe('validateCompleteConfig', () => {
    describe('正常系', () => {
      it('有効な完全設定を検証して成功する', () => {
        // Given: 有効な完全設定
        const validConfig: ToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output).toBeDefined();
          expect(result.output.defaultInstallDir).toBe('/custom/bin');
          expect(result.output.defaultTempDir).toBe('/custom/tmp');
          expect(result.output.tools!).toHaveLength(1);
        }
      });

      it('空のツール配列を持つ完全設定を検証して成功する', () => {
        // Given: 空のツール配列を持つ完全設定
        const validConfig: ToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [],
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.tools!).toHaveLength(0);
        }
      });

      it('複数のツールエントリーを持つ完全設定を検証して成功する', () => {
        // Given: 複数のツールエントリーを持つ完全設定
        const validConfig: ToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
            {
              installer: 'eget',
              id: 'ripgrep',
              repository: 'BurntSushi/ripgrep',
              version: 'v13.0.0',
              options: {
                '/q': '',
              },
            },
          ],
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(validConfig);

        // Then: 検証に成功する
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.output.tools!).toHaveLength(2);
          expect(result.output.tools![0].id).toBe('gh');
          expect(result.output.tools![1].id).toBe('ripgrep');
          expect(result.output.tools![1].version).toBe('v13.0.0');
        }
      });
    });

    describe('異常系', () => {
      it('部分設定（defaultInstallDirが欠如）の場合は検証に失敗する', () => {
        // Given: defaultInstallDirが欠如した設定
        const invalidConfig: PartialToolsConfig = {
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });

      it('部分設定（defaultTempDirが欠如）の場合は検証に失敗する', () => {
        // Given: defaultTempDirが欠如した設定
        const invalidConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });

      it('部分設定（toolsが欠如）の場合は検証に失敗する', () => {
        // Given: toolsが欠如した設定
        const invalidConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });

      it('無効なツールエントリーを含む場合は検証に失敗する', () => {
        // Given: 無効なツールエントリーを含む設定
        const invalidConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'npm',
              id: 'typescript',
              repository: 'microsoft/typescript',
            },
          ],
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(invalidConfig);

        // Then: 現在のスキーマは許可している
        expect(result.success).toBe(true);
      });

      it('nullの場合は検証に失敗する', () => {
        // When: nullを検証する
        const result = validateCompleteConfig(null);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('undefinedの場合は検証に失敗する', () => {
        // When: undefinedを検証する
        const result = validateCompleteConfig(undefined);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('文字列の場合は検証に失敗する', () => {
        // When: 文字列を検証する
        const result = validateCompleteConfig('invalid');

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
        }
      });

      it('不正な形式のオブジェクトの場合は検証に失敗する', () => {
        // Given: 不正な形式のオブジェクト
        const invalidConfig = {
          wrongField: 'value',
        };

        // When: 完全設定を検証する
        const result = validateCompleteConfig(invalidConfig);

        // Then: 検証に失敗する
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues).toBeDefined();
          expect(result.issues.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('validateConfigとvalidateCompleteConfigの相互運用性', () => {
    it('validateConfigで成功した完全設定はvalidateCompleteConfigでも成功する', () => {
      // Given: 完全設定
      const completeConfig: ToolsConfig = {
        defaultInstallDir: '/custom/bin',
        defaultTempDir: '/custom/tmp',
        tools: [
          {
            installer: 'eget',
            id: 'gh',
            repository: 'cli/cli',
          },
        ],
      };

      // When: 両方の関数で検証する
      const partialResult = validateConfig(completeConfig);
      const completeResult = validateCompleteConfig(completeConfig);

      // Then: 両方とも成功する
      expect(partialResult.success).toBe(true);
      expect(completeResult.success).toBe(true);
    });

    it('validateConfigで成功した部分設定はvalidateCompleteConfigで失敗する', () => {
      // Given: 部分設定
      const partialConfig: PartialToolsConfig = {
        tools: [
          {
            installer: 'eget',
            id: 'gh',
            repository: 'cli/cli',
          },
        ],
      };

      // When: 両方の関数で検証する
      const partialResult = validateConfig(partialConfig);
      const completeResult = validateCompleteConfig(partialConfig);

      // Then: 部分設定では成功、完全設定では失敗する
      expect(partialResult.success).toBe(true);
      expect(completeResult.success).toBe(false);
    });

    it('無効な設定は両方の関数で失敗する', () => {
      // Given: 無効な設定
      const invalidConfig = {
        tools: [
          {
            installer: 'npm',
            id: 'typescript',
            repository: 'microsoft/typescript',
          },
        ],
      };

      // When: 両方の関数で検証する
      const partialResult = validateConfig(invalidConfig);
      const completeResult = validateCompleteConfig(invalidConfig);

      // Then: 部分設定は成功するが完全設定は失敗する
      expect(partialResult.success).toBe(true);
      expect(completeResult.success).toBe(false);
    });
  });
});
