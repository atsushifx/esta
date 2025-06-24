// src: ./src/__tests__/contentComparison.spec.ts
// @(#): ファイル内容比較テスト - AgE2eFileIOFrameworkの期待値比較・結果書き込みテスト
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

describe('File Content Comparison', () => {
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

  test('compareWithFileContent returns true for matching JSON content', () => {
    const filePath = path.join(env.configDir, 'expected.json');
    const expectedContent = { name: 'test', value: 42 };
    fs.writeFileSync(filePath, JSON.stringify(expectedContent, null, 2));

    const result = framework.compareWithFileContent(expectedContent, filePath);

    expect(result).toBe(true);
  });

  test('compareWithFileContent returns true for matching string content', () => {
    const filePath = path.join(env.configDir, 'expected.txt');
    const expectedContent = 'test string';
    fs.writeFileSync(filePath, expectedContent);

    const result = framework.compareWithFileContent(expectedContent, filePath);

    expect(result).toBe(true);
  });

  test('compareWithFileContent returns false for non-matching content', () => {
    const filePath = path.join(env.configDir, 'expected.json');
    const fileContent = { name: 'test', value: 42 };
    const testContent = { name: 'different', value: 99 };
    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));

    const result = framework.compareWithFileContent(testContent, filePath);

    expect(result).toBe(false);
  });

  test('compareWithFileContent returns false for non-existent file', () => {
    const filePath = path.join(env.configDir, 'non-existent.json');
    const testContent = { name: 'test' };

    const result = framework.compareWithFileContent(testContent, filePath);

    expect(result).toBe(false);
  });

  test('writeExpectedResult writes string content', () => {
    const filePath = path.join(env.configDir, 'expected.txt');
    const content = 'expected result';

    framework.writeExpectedResult(content, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
  });

  test('writeExpectedResult writes JSON content', () => {
    const filePath = path.join(env.configDir, 'expected.json');
    const content = { name: 'test', value: 42 };

    framework.writeExpectedResult(content, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(fileContent).toEqual(content);
  });
});
