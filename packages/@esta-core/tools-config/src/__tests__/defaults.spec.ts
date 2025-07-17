// src/__tests__/defaults.spec.ts
// @(#) : defaults.ts関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { defaultToolsConfig } from '../defaults';

describe('defaults.ts functions', () => {
  describe('defaultToolsConfig', () => {
    describe('正常系', () => {
      it('デフォルト設定を返す', () => {
        // When: デフォルト設定を取得する
        const config = defaultToolsConfig();

        // Then: 期待される設定を返す
        expect(config).toBeDefined();
        expect(config.defaultInstallDir).toBe('./.tools/bin');
        expect(config.defaultTempDir).toBe('./.tools/tmp');
        expect(Array.isArray(config.tools)).toBe(true);
        expect(config.tools.length).toBeGreaterThan(0);
      });

      it('設定にすべての必須フィールドが含まれている', () => {
        // When: デフォルト設定を取得する
        const config = defaultToolsConfig();

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
        const config = defaultToolsConfig();

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
        const config1 = defaultToolsConfig();
        const config2 = defaultToolsConfig();

        // Then: 同じ内容を返す
        expect(config1).toEqual(config2);
        expect(config1.defaultInstallDir).toBe(config2.defaultInstallDir);
        expect(config1.defaultTempDir).toBe(config2.defaultTempDir);
        expect(config1.tools).toEqual(config2.tools);
      });

      it('返される設定は独立したオブジェクトである', () => {
        // When: デフォルト設定を2回取得する
        const config1 = defaultToolsConfig();
        const config2 = defaultToolsConfig();

        // Then: 異なるオブジェクトインスタンスである
        expect(config1).not.toBe(config2);
        expect(config1.tools).not.toBe(config2.tools);
      });
    });
  });
});
