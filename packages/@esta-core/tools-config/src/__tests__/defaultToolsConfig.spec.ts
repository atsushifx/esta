// src/__tests__/defaultToolsConfig.spec.ts
// @(#) : defaultToolsConfig関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// valibot
import { parse } from 'valibot';
// schema
import { CompleteToolsConfigSchema } from '../internal/schemas';
// test target
import { defaultToolsConfig } from '../defaults';

/**
 * defaultToolsConfig関数のテスト
 * デフォルトのツール設定を取得する関数のテスト
 */
describe('defaultToolsConfig', () => {
  /**
   * 正常系テスト - 基本動作検証
   * デフォルト設定の正しい生成と基本的なプロパティの確認
   */
  describe('正常系 (Happy Path)', () => {
    /**
     * コア機能テスト
     * デフォルト設定の基本的な構造と必須フィールドの存在を検証
     */
    describe('基本機能', () => {
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
    });

    /**
     * データ品質検証テスト
     * デフォルト設定内のデータ整合性や一貫性を検証
     */
    describe('データ整合性', () => {
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
    });

    /**
     * イミュータビリティテスト
     * 返される設定オブジェクトの独立性と不変性を検証
     */
    describe('オブジェクトの独立性', () => {
      it('返される設定は独立したオブジェクトである', () => {
        // When: デフォルト設定を2回取得する
        const config1 = defaultToolsConfig();
        const config2 = defaultToolsConfig();

        // Then: 異なるオブジェクトインスタンスである
        expect(config1).not.toBe(config2);
        expect(config1.tools).not.toBe(config2.tools);
      });

      it('返される設定を変更しても他の呼び出しに影響しない', () => {
        // When: デフォルト設定を取得して変更する
        const config1 = defaultToolsConfig();
        const originalLength = config1.tools.length;
        config1.tools.push({
          installer: 'eget',
          id: 'test-tool',
          repository: 'test/repo',
        });

        const config2 = defaultToolsConfig();

        // Then: 他の呼び出しには影響しない
        expect(config2.tools.length).toBe(originalLength);
      });
    });
  });

  /**
   * エッジケーステスト
   * 境界値や特殊ケースでの動作を検証
   */
  describe('エッジケース (Edge Cases)', () => {
    /**
     * 特殊値処理テスト
     * 設定の不変性や同期性などの特殊な条件を検証
     */
    describe('特殊な値の処理', () => {
      it('設定の不変性を維持する', () => {
        // Given: デフォルト設定を取得
        const config = defaultToolsConfig();
        const originalConfig = JSON.parse(JSON.stringify(config));

        // When: 設定を破壊的に変更しようとする
        config.defaultInstallDir = '/hacked/dir';
        config.tools = [];

        // Then: 新しい呼び出しは元の値を返す
        const newConfig = defaultToolsConfig();
        expect(newConfig.defaultInstallDir).toBe(originalConfig.defaultInstallDir);
        expect(newConfig.tools).toEqual(originalConfig.tools);
      });

      it('同期的に結果を返す', () => {
        // When: 設定を取得する
        const config = defaultToolsConfig();

        // Then: 即座に結果が返される（Promiseではない）
        expect(config).not.toBeInstanceOf(Promise);
        expect(config.tools).toBeDefined();
      });
    });

    /**
     * データ構造検証テスト
     * ツール配列やパスの構造的正当性を検証
     */
    describe('データの構造検証', () => {
      it('ツール配列の各要素が異なるオブジェクトである', () => {
        // Given: デフォルト設定を取得
        const config = defaultToolsConfig();

        // When: 複数のツールがある場合
        if (config.tools.length > 1) {
          // Then: 各ツールは異なるオブジェクトインスタンスである
          expect(config.tools[0]).not.toBe(config.tools[1]);
        }

        // Then: 各ツールが一意のIDを持つ
        const ids = config.tools.map((tool) => tool.id);
        const uniqueIds = [...new Set(ids)];
        expect(uniqueIds.length).toBe(ids.length);
      });

      it('デフォルトパスが正しい形式である', () => {
        // Given: デフォルト設定を取得
        const config = defaultToolsConfig();

        // Then: パスが正しい形式である
        expect(config.defaultInstallDir).toMatch(/^[./]/); // 相対パスまたは絶対パス
        expect(config.defaultTempDir).toMatch(/^[./]/); // 相対パスまたは絶対パス
        expect(config.defaultInstallDir).not.toContain('//'); // 連続スラッシュなし
        expect(config.defaultTempDir).not.toContain('//'); // 連続スラッシュなし
      });
    });
  });

  /**
   * スキーマバリデーションテスト
   * デフォルト設定がスキーマに適合していることを検証
   */
  describe('バリデーション機能', () => {
    it('常に完全な設定を返す', () => {
      // Act
      const config = defaultToolsConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config).toHaveProperty('defaultInstallDir');
      expect(config).toHaveProperty('defaultTempDir');
      expect(config).toHaveProperty('tools');
      expect(typeof config.defaultInstallDir).toBe('string');
      expect(typeof config.defaultTempDir).toBe('string');
      expect(Array.isArray(config.tools)).toBe(true);
    });

    it('デフォルト設定のスキーマ検証が成功する', () => {
      // Act
      const config = defaultToolsConfig();

      // Assert
      expect(() => {
        parse(CompleteToolsConfigSchema, config);
      }).not.toThrow();

      // 検証済みの設定として正しく処理される
      const validatedConfig = parse(CompleteToolsConfigSchema, config);
      expect(validatedConfig).toEqual(config);
    });
  });
});
