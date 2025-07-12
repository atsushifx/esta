// src: ./search/__tests__/findConfigFile.spec.ts
// 設定ファイル探索ユーティリティのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as path from 'path';
import process from 'process';

// vitest
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { TSearchConfigFileType } from '../../../shared/types/searchFileType.types';

// test unit

import { findConfigFile } from '../findConfigFile';

// --- types
import type { PathLike } from 'fs';

// mock
let expectedConfigFile: string;
vi.mock('fs', async () => {
  const realFs = await vi.importActual('fs');
  return {
    ...realFs,
    existsSync: (p: PathLike) => {
      return String(p) === expectedConfigFile;
    },
  };
});
// os

const MOCK_HOME = '/mock/home';
vi.mock('os', () => ({
  homedir: () => MOCK_HOME,
  platform: () => 'win32',
}));

// --- test setup
let ORIGINAL_ENV: NodeJS.ProcessEnv;
beforeAll(() => {
  ORIGINAL_ENV = process.env;
});

afterAll(() => {
  // テストごとに環境変数を元に戻す
  Object.assign(process.env, ORIGINAL_ENV);
});

// test main
describe('findConfigFile - Basic functionality', () => {
  // config Files
  const BASE_NAMES = ['app.config'];
  const DIR_NAME = 'testerApp';

  // config file for unittest
  it('finds app.config.json in configs without dot prefix', () => {
    expectedConfigFile = path.resolve('/etc/xdg/testerApp/app.config.json');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.SYSTEM);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds app.config.yaml in configs with dot prefix', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/.app.config.yaml');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds project config file in current directory', () => {
    expectedConfigFile = path.resolve('./app.config.json');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.PROJECT);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds project config file in .config directory', () => {
    expectedConfigFile = path.resolve('./.config/app.config.ts');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.PROJECT);
    expect(result).toBe(expectedConfigFile);
  });
});

describe('findConfigFile - Extension-less files', () => {
  const BASE_NAMES = ['app.config'];
  const DIR_NAME = 'testerApp';

  it('finds extension-less config file', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/app.config');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds dotfile extension-less config file', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/.app.config');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('prioritizes files with extensions over extension-less files', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    // Set up to find the .json file first (higher priority)
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/app.config.json');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });
});

describe('findConfigFile - Multiple config files', () => {
  const BASE_NAMES = ['estarc', 'esta.config'];
  const DIR_NAME = 'testerApp';

  it('finds first available config file (estarc.json)', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/estarc.json');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds second config file when first is not available (esta.config.yaml)', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/esta.config.yaml');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('prioritizes estarc over esta.config in same directory', () => {
    expectedConfigFile = path.resolve('./estarc.ts');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.PROJECT);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds dotfile version of first config (.estarc.json)', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/.estarc.json');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds extension-less first config file (estarc)', () => {
    expectedConfigFile = path.resolve('./estarc');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.PROJECT);
    expect(result).toBe(expectedConfigFile);
  });

  it('falls back to second config when first config not found', () => {
    expectedConfigFile = path.resolve('./.config/esta.config.js');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.PROJECT);
    expect(result).toBe(expectedConfigFile);
  });
});

describe('findConfigFile - Error cases', () => {
  const BASE_NAMES = ['app.config'];
  const DIR_NAME = 'testerApp';

  it('returns null when config file not found', () => {
    // Set expectedConfigFile to a non-matching path
    expectedConfigFile = '/non/existent/path';

    const result = findConfigFile(BASE_NAMES, DIR_NAME, TSearchConfigFileType.USER);
    expect(result).toBeNull();
  });
});
