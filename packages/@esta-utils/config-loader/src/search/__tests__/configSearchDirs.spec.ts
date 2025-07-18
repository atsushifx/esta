// src: ./search/__tests__/configSearchDirs.spec.ts
// 設定ファイル検索用ディレクトリリストのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- libs
import process from 'process';

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { TSearchConfigFileType } from '../../../shared/types/searchFileType.types';

import { getDelimiter } from '@esta-utils/get-platform';
// vitest

// os モジュールをモック
vi.mock('os', () => ({
  homedir: () => '/mock/home',
  platform: () => 'win32',
}));

// test unit
import { configSearchDirs } from '../configSearchDirs';

let ORIGINAL_ENV: NodeJS.ProcessEnv;
const MOCK_HOME = '/mock/home';
beforeAll(() => {
  ORIGINAL_ENV = { ...process.env };
  // MOCK
});

// test main
describe('configSearchDirs - Project', () => {
  it('includes project root directory', () => {
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.PROJECT);
    expect(dirs).toContain('.');
  });

  it('includes app-specific directory', () => {
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.PROJECT);
    expect(dirs).toContain('./.appConfig');
  });

  it('includes .config directory', () => {
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.PROJECT);
    expect(dirs).toContain('./.config');
  });

  it('includes .config/appName directory', () => {
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.PROJECT);
    expect(dirs).toContain('./.config/appConfig');
  });

  it('returns all expected project directories', () => {
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT);
    const expectedDirs = ['.', './.myapp', './.config', './.config/myapp'];

    expectedDirs.forEach((expectedDir) => {
      expect(dirs).toContain(expectedDir);
    });
  });

  it('uses default baseDirectory when not specified', () => {
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT);
    expect(dirs).toContain('.');
    expect(dirs).toContain('./.myapp');
    expect(dirs).toContain('./.config');
    expect(dirs).toContain('./.config/myapp');
  });

  it('uses custom baseDirectory when specified', () => {
    const customBase = '/custom/path';
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT, customBase);
    expect(dirs).toContain('/custom/path');
    expect(dirs).toContain('/custom/path/.myapp');
    expect(dirs).toContain('/custom/path/.config');
    expect(dirs).toContain('/custom/path/.config/myapp');
  });

  it('uses relative baseDirectory when specified', () => {
    const customBase = '../relative/path';
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT, customBase);
    expect(dirs).toContain('../relative/path');
    expect(dirs).toContain('../relative/path/.myapp');
    expect(dirs).toContain('../relative/path/.config');
    expect(dirs).toContain('../relative/path/.config/myapp');
  });

  it('handles empty baseDirectory gracefully', () => {
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT, '');
    expect(dirs).toContain('/.myapp');
    expect(dirs).toContain('/.config');
    expect(dirs).toContain('/.config/myapp');
  });

  it('handles baseDirectory with trailing slash', () => {
    const customBase = '/custom/path/';
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT, customBase);
    expect(dirs).toContain('/custom/path/');
    expect(dirs).toContain('/custom/path//.myapp');
    expect(dirs).toContain('/custom/path//.config');
    expect(dirs).toContain('/custom/path//.config/myapp');
  });

  it('handles special characters in baseDirectory', () => {
    const customBase = '/path with spaces/special-chars_123';
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT, customBase);
    expect(dirs).toContain('/path with spaces/special-chars_123');
    expect(dirs).toContain('/path with spaces/special-chars_123/.myapp');
    expect(dirs).toContain('/path with spaces/special-chars_123/.config');
    expect(dirs).toContain('/path with spaces/special-chars_123/.config/myapp');
  });
});

describe('configSearchDirs - System', () => {
  beforeEach(() => {
    delete process.env.XDG_CONFIG_HOME;
  });

  afterEach(() => {
    // テストごとに環境変数を元に戻す
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('includes XDG_CONFIG_HOME/appName directory in system mode', () => {
    process.env.XDG_CONFIG_HOME = '/home/tester/.config';

    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.SYSTEM);
    expect(dirs).toContain('/home/tester/.config/appConfig');
  });

  it('falls back to HOME/.config when XDG_CONFIG_HOME is undefined', () => {
    delete process.env.XDG_CONFIG_HOME;

    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.SYSTEM);
    const expected = `${MOCK_HOME}/.config/appConfig`;
    expect(dirs).toContain(expected);
  });

  it('include unix dotfiles directory', () => {
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.SYSTEM);
    const expected = `${MOCK_HOME}/.appConfig`;
    expect(dirs).toContain(expected);
  });

  it('search XDG_CONFIG_DIRS', () => {
    process.env.XDG_CONFIG_DIRS = '/usr/local/etc' + getDelimiter() + '/etc';
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.SYSTEM);
    const expected = `/usr/local/etc/appConfig`;

    expect(dirs).toContain(expected);
  });

  it('XDG_CONFIG_DIRS is undefined: use /etc/xdg', () => {
    delete process.env.XDG_CONFIG_DIRS;
    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.SYSTEM);
    const expected = '/etc/xdg/appConfig';

    expect(dirs).toContain(expected);
  });
});

describe('configSearchDirs - User', () => {
  beforeEach(() => {
    delete process.env.XDG_CONFIG_HOME;
  });

  afterEach(() => {
    // テストごとに環境変数を元に戻す
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('includes XDG_CONFIG_HOME/appName directory in system mode', () => {
    process.env.XDG_CONFIG_HOME = '/home/tester/.config';

    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.USER);
    expect(dirs).toContain('/home/tester/.config/appConfig');
  });

  it('falls back to HOME/.config when XDG_CONFIG_HOME is undefined', () => {
    delete process.env.XDG_CONFIG_HOME;

    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.USER);
    const expected = `${MOCK_HOME}/.config/appConfig`;
    expect(dirs).toContain(expected);
  });

  it('check if default config directory is included', () => {
    delete process.env.XDG_CONFIG_HOME;

    const dirs = configSearchDirs('appConfig', TSearchConfigFileType.USER);
    const expected1 = `${MOCK_HOME}/configs/appConfig`;
    expect(dirs).toContain(expected1);

    const expected2 = `${MOCK_HOME}/.configs/appConfig`;
    expect(dirs).toContain(expected2);

    const expected3 = `${MOCK_HOME}/.config/appConfig`;
    expect(dirs).toContain(expected3);

    const expected4 = `${MOCK_HOME}/.appConfig`;
    expect(dirs).toContain(expected4);
  });
});

describe('configSearchDirs - Edge Cases', () => {
  beforeEach(() => {
    delete process.env.XDG_CONFIG_HOME;
    delete process.env.XDG_CONFIG_DIRS;
  });

  afterEach(() => {
    // テストごとに環境変数を元に戻す
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('handles empty appConfig name', () => {
    const dirs = configSearchDirs('', TSearchConfigFileType.USER);
    expect(dirs).toContain(`${MOCK_HOME}/.config/`);
    expect(dirs).toContain(`${MOCK_HOME}/configs/`);
  });

  it('handles special characters in appConfig name', () => {
    const appName = 'app-with_special.chars';
    const dirs = configSearchDirs(appName, TSearchConfigFileType.USER);
    expect(dirs).toContain(`${MOCK_HOME}/.config/${appName}`);
    expect(dirs).toContain(`${MOCK_HOME}/.${appName}`);
  });

  it('removes duplicate directories', () => {
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT);
    const uniqueDirs = [...new Set(dirs)];
    expect(dirs).toEqual(uniqueDirs);
  });

  it('filters out empty directories', () => {
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.USER);
    dirs.forEach((dir) => {
      expect(dir).not.toBe('');
      expect(dir.length).toBeGreaterThan(0);
    });
  });

  it('handles baseDirectory parameter for non-PROJECT types', () => {
    const dirs = configSearchDirs('myapp', TSearchConfigFileType.USER, '/ignored/path');
    expect(dirs).not.toContain('/ignored/path');
    expect(dirs).toContain(`${MOCK_HOME}/.config/myapp`);
  });
});
