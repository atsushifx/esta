// src: ./src/__tests__/fileOperations.spec.ts
// @(#): ファイル操作テスト - AgE2eFileIOFrameworkとfileIoUtilsの統合テスト
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

import type { TestEnvironment } from '../types';

// test target

describe('AgE2eFileIOFramework Integration with FileIoUtils', () => {
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

  test('framework uses fileIoUtils for directory creation during setup', () => {
    expect(fs.existsSync(env.configDir)).toBe(true);
  });

  test('framework integrates with fileIoUtils for file content comparison', () => {
    const testFilePath = path.join(env.configDir, 'comparison-test.json');
    const testContent = { test: 'data', value: 123 };

    fs.writeFileSync(testFilePath, JSON.stringify(testContent, null, 2));

    const result = framework.compareWithFileContent(testContent, testFilePath);

    expect(result).toBe(true);
  });

  test('framework integrates with fileIoUtils for writing expected results', () => {
    const testFilePath = path.join(env.configDir, 'expected-result.json');
    const testResult = { status: 'success', data: [1, 2, 3] };

    framework.writeExpectedResult(testResult, testFilePath);

    expect(fs.existsSync(testFilePath)).toBe(true);
    const fileContent = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
    expect(fileContent).toEqual(testResult);
  });
});
