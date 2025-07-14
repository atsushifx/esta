import { describe, expect, it } from 'vitest';
import { getPathValidationErrorMessage, validatePath } from '../pathValidation';

describe('validatePath', () => {
  describe('有効なパス', () => {
    it('Unix絶対パス', () => {
      expect(validatePath('/')).toBe(true);
      expect(validatePath('/usr/local/bin')).toBe(true);
      expect(validatePath('/home/user/.config')).toBe(true);
    });

    it('Windows絶対パス', () => {
      expect(validatePath('C:\\')).toBe(true);
      expect(validatePath('C:\\Users\\user')).toBe(true);
      expect(validatePath('D:\\Projects')).toBe(true);
      expect(validatePath('C:/Users/user')).toBe(true);
    });

    it('相対パス（ドット記法）', () => {
      expect(validatePath('.')).toBe(true);
      expect(validatePath('..')).toBe(true);
      expect(validatePath('./config')).toBe(true);
      expect(validatePath('../parent')).toBe(true);
      expect(validatePath('.\\config')).toBe(true);
      expect(validatePath('..\\parent')).toBe(true);
    });

    it('相対パス（直接ディレクトリ名）', () => {
      expect(validatePath('config')).toBe(true);
      expect(validatePath('tools/bin')).toBe(true);
      expect(validatePath('project\\src')).toBe(true);
      expect(validatePath('.tools')).toBe(true);
      expect(validatePath('node_modules')).toBe(true);
    });
  });

  describe('無効なパス', () => {
    it('空文字列・空白', () => {
      expect(validatePath('')).toBe(false);
      expect(validatePath(' ')).toBe(false);
      expect(validatePath('   ')).toBe(false);
    });

    it('無効な文字を含む', () => {
      expect(validatePath('path<file')).toBe(false);
      expect(validatePath('path>file')).toBe(false);
      expect(validatePath('path"file')).toBe(false);
      expect(validatePath('path|file')).toBe(false);
      expect(validatePath('path*file')).toBe(false);
      expect(validatePath('path?file')).toBe(false);
    });

    it('連続するスラッシュ', () => {
      expect(validatePath('path//file')).toBe(false);
      expect(validatePath('path\\\\file')).toBe(false);
      expect(validatePath('//path')).toBe(false);
    });

    it('混在するパス区切り文字（Windowsドライブレター以外）', () => {
      expect(validatePath('path/sub\\file')).toBe(false);
      expect(validatePath('./config\\file')).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('前後の空白は無視される', () => {
      expect(validatePath(' ./config ')).toBe(true);
      expect(validatePath(' /usr/bin ')).toBe(true);
    });

    it('Windowsドライブレターの大文字小文字', () => {
      expect(validatePath('c:\\path')).toBe(true);
      expect(validatePath('Z:\\path')).toBe(true);
    });

    it('長いパス', () => {
      const longPath = './very/long/path/to/some/directory/structure/that/goes/deep';
      expect(validatePath(longPath)).toBe(true);
    });
  });
});

describe('getPathValidationErrorMessage', () => {
  it('適切なエラーメッセージを返す', () => {
    const message = getPathValidationErrorMessage('testField');
    expect(message).toBe(
      'testField must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
    );
  });

  it('異なるフィールド名でエラーメッセージを返す', () => {
    const message = getPathValidationErrorMessage('defaultInstallDir');
    expect(message).toBe(
      'defaultInstallDir must be a valid path (absolute: "/" or "C:\\" or relative: "./" or directory name)',
    );
  });
});
