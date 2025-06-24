// src: ./__tests__/loadConfig.spec.ts
// @(#): loadConfig E2E テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// vitest
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// types
import { SearchConfigFileType } from '@shared/types/common.types';

// test unit
import { loadConfig } from '@/loadConfig';

describe('loadConfig E2E', () => {
  let tempDir: string;
  let configDir: string;
  let originalXdgConfigHome: string | undefined;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-loader-test-'));
    configDir = path.join(tempDir, 'testapp');
    fs.mkdirSync(configDir, { recursive: true });

    // XDG_CONFIG_HOME環境変数を設定してconfigDirを検索対象にする
    originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
    process.env.XDG_CONFIG_HOME = tempDir;
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // 環境変数を元に戻す
    if (originalXdgConfigHome !== undefined) {
      process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
    } else {
      delete process.env.XDG_CONFIG_HOME;
    }
  });

  it('loads JSON config file', () => {
    const configPath = path.join(configDir, 'myapp.json');
    const configData = { name: 'Test App', version: '1.0.0', debug: true };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

    const result = loadConfig<typeof configData>('myapp', 'testapp');

    expect(result).toEqual(configData);
  });

  it('loads YAML config file', () => {
    const configPath = path.join(configDir, 'myapp.yaml');
    const configData = `
name: Test App
version: 1.0.0
debug: true
features:
  - auth
  - logging
`;

    fs.writeFileSync(configPath, configData);

    const result = loadConfig('myapp', 'testapp');

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
      features: ['auth', 'logging'],
    });
  });

  it('loads JSONC config file with comments', () => {
    const configPath = path.join(configDir, 'myapp.jsonc');
    const configData = `{
  // Application configuration
  "name": "Test App",
  "version": "1.0.0",
  /* Multi-line comment
     for debug flag */
  "debug": true
}`;

    fs.writeFileSync(configPath, configData);

    const result = loadConfig('myapp', 'testapp');

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
    });
  });

  it('loads TypeScript config file', () => {
    const configPath = path.join(configDir, 'myapp.ts');
    const configData = `export default {
  name: 'Test App',
  version: '1.0.0',
  debug: true,
  database: {
    host: 'localhost',
    port: 5432
  }
};`;

    fs.writeFileSync(configPath, configData);

    const result = loadConfig('myapp', 'testapp');

    expect(result).toEqual({
      name: 'Test App',
      version: '1.0.0',
      debug: true,
      database: {
        host: 'localhost',
        port: 5432,
      },
    });
  });

  it('loads config with dot prefix', () => {
    const configPath = path.join(configDir, '.myapp.json');
    const configData = { hidden: true, name: 'Hidden Config' };

    fs.writeFileSync(configPath, JSON.stringify(configData));

    const result = loadConfig('myapp', 'testapp');

    expect(result).toEqual(configData);
  });

  it('prioritizes files without dot prefix over files with dot prefix', () => {
    const configPath1 = path.join(configDir, 'myapp.json');
    const configPath2 = path.join(configDir, '.myapp.json');
    const configData1 = { priority: 'normal', name: 'Normal Config' };
    const configData2 = { priority: 'hidden', name: 'Hidden Config' };

    fs.writeFileSync(configPath1, JSON.stringify(configData1));
    fs.writeFileSync(configPath2, JSON.stringify(configData2));

    const result = loadConfig('myapp', 'testapp');

    expect(result).toEqual(configData1);
  });

  it('throws error when config file not found', () => {
    expect(() => {
      loadConfig('nonexistent', 'testapp');
    }).toThrow('Config file not found.');
  });

  it('uses current working directory as default', () => {
    // テスト用のホームディレクトリ設定ファイルを作成
    const configPath = path.join(tempDir, 'testconfig', 'testconfig.json');
    const configData = { test: true };

    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(configData));

    const result = loadConfig('testconfig', 'testconfig');
    expect(result).toEqual(configData);
  });

  describe('SearchConfigFileType tests', () => {
    it('loads config with USER search type (default)', () => {
      const configPath = path.join(configDir, 'userapp.json');
      const configData = { type: 'user', name: 'User Config' };

      fs.writeFileSync(configPath, JSON.stringify(configData));

      const result = loadConfig('userapp', 'testapp', SearchConfigFileType.USER);

      expect(result).toEqual(configData);
    });

    it('loads config with SYSTEM search type', () => {
      const configPath = path.join(configDir, 'systemapp.json');
      const configData = { type: 'system', name: 'System Config' };

      fs.writeFileSync(configPath, JSON.stringify(configData));

      const result = loadConfig('systemapp', 'testapp', SearchConfigFileType.SYSTEM);

      expect(result).toEqual(configData);
    });

    it('defaults to USER search type when not specified', () => {
      const configPath = path.join(configDir, 'defaultapp.json');
      const configData = { type: 'default', name: 'Default Config' };

      fs.writeFileSync(configPath, JSON.stringify(configData));

      // SearchConfigFileTypeを指定しない場合、デフォルトでUSERが使用される
      const result = loadConfig('defaultapp', 'testapp');

      expect(result).toEqual(configData);
    });
  });
});
