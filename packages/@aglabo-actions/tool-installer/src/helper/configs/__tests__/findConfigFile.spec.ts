// src: ./helper/configs/__tests__/findConfigFile.spec.ts
// @(#) : 設定ファイル探索ユーティリティ（prefix/extension 固定版）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs

import * as path from 'path';

// vitest
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// test unit
import { ConfigType } from '@/shared/types';

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
describe('findConfigFile', () => {
  // config Files
  const BASE_NAMES = ['app.config'];
  const DIR_NAME = 'testerApp';

  // config file for unittest
  it('finds app.config.json in configs without dot prefix', () => {
    expectedConfigFile = path.resolve('/etc/xdg/testerApp/app.config.json');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, ConfigType.SYSTEM);
    expect(result).toBe(expectedConfigFile);
  });

  it('finds app.config.yaml in configs with dot prefix', () => {
    process.env.XDG_CONFIG_HOME = MOCK_HOME + '/.config';
    expectedConfigFile = path.resolve(MOCK_HOME + '/.config/' + DIR_NAME + '/.app.config.yaml');

    const result = findConfigFile(BASE_NAMES, DIR_NAME, ConfigType.USER);
    expect(result).toBe(expectedConfigFile);
  });

  it('throws when only the extension-less .config file would match', () => {
    // Even if we set the “expected” path to the plain .config file,
    // none of the generated candidates include an extension-less name,
    // so existsSync always returns false and we get an exception.
    expectedConfigFile = path.resolve(MOCK_HOME + '/configs/app.config');

    expect(() => findConfigFile(BASE_NAMES, DIR_NAME, ConfigType.USER))
      .toThrow('Config file not found.');
  });
});
