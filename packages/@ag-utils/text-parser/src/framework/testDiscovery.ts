// src: ./framework/testDiscovery.ts
// テスト走査関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
// types
import type { TestCase, TestTypeInfo } from './types';

// === 内部関数 ===

const _isCommentedOut = (dirName: string): boolean => {
  return dirName.startsWith('#');
};

const _isValidTestDirectory = (dirPath: string): boolean => {
  try {
    const stat = statSync(dirPath);
    if (!stat.isDirectory()) { return false; }

    // input.* と output.json の存在をチェック
    const files = readdirSync(dirPath);
    const hasInput = files.some((file) => file.startsWith('input.'));
    const hasOutput = files.includes('output.json');

    return hasInput && hasOutput;
  } catch {
    return false;
  }
};

// === 外部関数 ===

export const scanTestCases = (typeDir: string, typeName: string): TestCase[] => {
  const testCases: TestCase[] = [];

  try {
    const entries = readdirSync(typeDir);

    for (const entry of entries) {
      // #で始まるディレクトリはコメントアウトとしてスキップ
      if (_isCommentedOut(entry)) {
        continue;
      }

      const testCasePath = join(typeDir, entry);
      if (_isValidTestDirectory(testCasePath)) {
        testCases.push({
          type: typeName,
          name: entry,
          path: testCasePath,
        });
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空配列を返す
  }

  return testCases;
};

export const scanTestTypes = (fixturesDir: string): TestTypeInfo[] => {
  const testTypes: TestTypeInfo[] = [];

  try {
    const entries = readdirSync(fixturesDir);

    for (const entry of entries) {
      // #で始まるディレクトリはコメントアウトとしてスキップ
      if (_isCommentedOut(entry)) {
        continue;
      }

      const typeDir = join(fixturesDir, entry);
      const stat = statSync(typeDir);

      if (stat.isDirectory()) {
        const testCases = scanTestCases(typeDir, entry);
        if (testCases.length > 0) {
          testTypes.push({
            type: entry,
            testCases,
          });
        }
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空配列を返す
  }

  return testTypes;
};
