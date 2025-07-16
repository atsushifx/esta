import { describe, expect, it } from 'vitest';
import { defaultToolsConfig } from '../defaults';

describe('defaultToolsConfig', () => {
  describe('基本設定の検証', () => {
    it('should return correct default paths', () => {
      const config = defaultToolsConfig();

      expect(config.defaultInstallDir).toBe('.tools/bin');
      expect(config.defaultTempDir).toBe('.tools/tmp');
      expect(Array.isArray(config.tools)).toBe(true);
    });

    it('should contain 9 default tools', () => {
      const config = defaultToolsConfig();

      expect(config.tools).toHaveLength(9);
    });
  });

  describe('デフォルトツールの内容検証', () => {
    it('should contain gitleaks tool', () => {
      const config = defaultToolsConfig();

      const gitleaks = config.tools.find((tool) => tool.id === 'gitleaks');
      expect(gitleaks).toBeDefined();
      expect(gitleaks?.installer).toBe('eget');
      expect(gitleaks?.repository).toBe('gitleaks/gitleaks');
    });

    it('should contain gh tool', () => {
      const config = defaultToolsConfig();

      const gh = config.tools.find((tool) => tool.id === 'gh');
      expect(gh).toBeDefined();
      expect(gh?.installer).toBe('eget');
      expect(gh?.repository).toBe('cli/cli');
    });

    it('should have all tools as valid eget entries', () => {
      const config = defaultToolsConfig();

      config.tools.forEach((tool) => {
        expect(tool.installer).toBe('eget');
        expect(typeof tool.id).toBe('string');
        expect(typeof tool.repository).toBe('string');
        expect(tool.repository).toMatch(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/);
      });
    });
  });

  describe('正規化の検証', () => {
    it('should return normalized configuration', () => {
      const config = defaultToolsConfig();

      // パスが正規化済みであることを確認
      expect(config.defaultInstallDir).toBe('.tools/bin');
      expect(config.defaultTempDir).toBe('.tools/tmp');

      // ツールのid、repositoryが正規化済み（小文字）であることを確認
      config.tools.forEach((tool) => {
        expect(tool.id).toBe(tool.id.toLowerCase());
        expect(tool.repository).toBe(tool.repository.toLowerCase());
        // installer も正規化対象になった
        expect(tool.installer).toBe('eget');
      });
    });

    it('should normalize specific tools correctly', () => {
      const config = defaultToolsConfig();

      // 特定のツールが正規化済みであることを確認
      const gh = config.tools.find((tool) => tool.id === 'gh');
      expect(gh?.id).toBe('gh'); // 小文字
      expect(gh?.repository).toBe('cli/cli'); // 小文字

      const ripgrep = config.tools.find((tool) => tool.id === 'ripgrep');
      expect(ripgrep?.id).toBe('ripgrep'); // 小文字
      expect(ripgrep?.repository).toBe('burntsushi/ripgrep'); // 小文字（BurntSushi → burntsushi）
      expect(ripgrep?.installer).toBe('eget'); // 小文字
    });
  });
});
