// src: ./helper/configs/__tests__/configSearchDirs.spec.ts
// @(#) : 設定ファイル検索用ディレクトリリストのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- libs
import process from 'process';

import { getDelimiter } from '@ag-utils/common';
// vitest
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// os モジュールをモック
vi.mock('os', () => ({
  homedir: () => '/mock/home',
  platform: () => 'win32',
}));

// libs
import { ConfigType } from '@shared/types';

// test unit
import { configSearchDirs } from '../configSearchDirs';

let ORIGINAL_ENV: NodeJS.ProcessEnv;
const MOCK_HOME = '/mock/home';
beforeAll(() => {
  ORIGINAL_ENV = { ...process.env };
  // MOCK
});

// test main
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

    const dirs = configSearchDirs('appConfig', ConfigType.SYSTEM);
    expect(dirs).toContain('/home/tester/.config/appConfig');
  });

  it('falls back to HOME/.config when XDG_CONFIG_HOME is undefined', () => {
    delete process.env.XDG_CONFIG_HOME;

    const dirs = configSearchDirs('appConfig', ConfigType.SYSTEM);
    const expected = `${MOCK_HOME}/.config/appConfig`;
    expect(dirs).toContain(expected);
  });

  it('include unix dotfiles directory', () => {
    const dirs = configSearchDirs('appConfig', ConfigType.SYSTEM);
    const expected = `${MOCK_HOME}/.appConfig`;
    expect(dirs).toContain(expected);
  });

  it('search XDG_CONFIG_DIRS', () => {
    process.env.XDG_CONFIG_DIRS = '/usr/local/etc' + getDelimiter() + '/etc';
    const dirs = configSearchDirs('appConfig', ConfigType.SYSTEM);
    const expected = `/usr/local/etc/appConfig`;

    expect(dirs).toContain(expected);
  });

  it('XDG_CONFIG_DIRS is undefined: use /etc/xdg', () => {
    delete process.env.XDG_CONFIG_DIRS;
    const dirs = configSearchDirs('appConfig', ConfigType.SYSTEM);
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

    const dirs = configSearchDirs('appConfig', ConfigType.USER);
    expect(dirs).toContain('/home/tester/.config/appConfig');
  });

  it('falls back to HOME/.config when XDG_CONFIG_HOME is undefined', () => {
    delete process.env.XDG_CONFIG_HOME;

    const dirs = configSearchDirs('appConfig', ConfigType.USER);
    const expected = `${MOCK_HOME}/.config/appConfig`;
    expect(dirs).toContain(expected);
  });

  it('check if default config directory is included', () => {
    delete process.env.XDG_CONFIG_HOME;

    const dirs = configSearchDirs('appConfig', ConfigType.USER);
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
