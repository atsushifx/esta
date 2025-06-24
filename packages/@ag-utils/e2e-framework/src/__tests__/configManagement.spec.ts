// src: ./src/__tests__/configManagement.spec.ts
// @(#): 設定ファイル管理テスト - AgE2eFileIOFrameworkの設定ファイル作成・管理テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as fs from 'fs';
import * as path from 'path';

// vitest
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

// types
import { AgE2eFileIOFramework } from '../AgE2eFileIoFramework';

import type { AgE2eConfigFileSpec } from '../../shared/types/e2e-framework.types';
import type { TestEnvironment } from '../types';

// test target

describe('Config File Management', () => {
  let framework: AgE2eFileIOFramework;
  let testId: string;
  let env: TestEnvironment;

  beforeEach(() => {
    framework = new AgE2eFileIOFramework();
    testId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    env = framework.setupEnvironment(testId, 'test-config');
  });

  afterEach(() => {
    framework.cleanupEnvironment(testId);
  });

  test('createConfigFile creates file with string content', () => {
    const spec: AgE2eConfigFileSpec = {
      filename: 'test.txt',
      content: 'test content',
    };

    const filePath = framework.createConfigFile(env, spec);

    expect(filePath).toBe(path.join(env.configDir, spec.filename));
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(spec.content);
  });

  test('createConfigFile creates JSON file with object content', () => {
    const spec: AgE2eConfigFileSpec = {
      filename: 'config.json',
      content: { name: 'test', value: 42 },
      format: 'json',
    };

    const filePath = framework.createConfigFile(env, spec);

    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(fileContent).toEqual(spec.content);
  });

  test('createConfigFiles creates multiple files', () => {
    const specs: AgE2eConfigFileSpec[] = [
      { filename: 'config1.json', content: { a: 1 }, format: 'json' },
      { filename: 'config2.txt', content: 'text content' },
    ];

    const filePaths = framework.createConfigFiles(env, specs);

    expect(filePaths).toHaveLength(2);
    filePaths.forEach((filePath) => {
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
