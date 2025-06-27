// tests: ./e2e/framework.e2e.spec.ts
// Fixture Framework E2E テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { join } from 'node:path';
// vitest
import { describe, expect, test } from 'vitest';
// framework
import { runFixtureTest, scanTestTypes } from '../../src';

const fixturesDir = join(__dirname, 'fixtures');

// モックテスト関数（実際の使用では実際のパーサー関数を渡す）
const mockTestFunction = (extension: string, content: string): unknown => {
  if (extension === 'md') {
    // Markdownコンテンツを解析してモックレスポンスを生成
    const lines = content.split('\n');
    const children = [];

    for (const line of lines) {
      if (line.startsWith('# ')) {
        children.push({ type: 'heading', depth: 1 });
      } else if (line.startsWith('## ')) {
        children.push({ type: 'heading', depth: 2 });
      } else if (line.startsWith('### ')) {
        children.push({ type: 'heading', depth: 3 });
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        children.push({ type: 'list' });
      } else if (line.startsWith('```')) {
        children.push({ type: 'code' });
      } else if (line.startsWith('> ')) {
        children.push({ type: 'blockquote' });
      } else if (
        line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')
        && !line.startsWith('```') && !line.startsWith('>')
      ) {
        children.push({ type: 'paragraph' });
      }
    }

    return {
      type: 'root',
      children,
    };
  } else {
    // Plaintext用のモックレスポンス
    return content.trim();
  }
};

describe('Fixture Framework E2E', () => {
  const testTypes = scanTestTypes(fixturesDir);

  for (const testType of testTypes) {
    describe(`${testType.type} files`, () => {
      for (const testCase of testType.testCases) {
        test(`should process ${testCase.name} ${testCase.type} file`, () => {
          const isValid = runFixtureTest(testCase.path, testCase.name, mockTestFunction);
          expect(isValid).toBe(true);
        });
      }
    });
  }

  // Extension detection tests
  describe('File extension detection', () => {
    for (const testType of testTypes) {
      if (testType.testCases.length > 0) {
        const firstTestCase = testType.testCases[0];
        test(`should detect .${testType.type} extension correctly`, () => {
          expect(runFixtureTest(firstTestCase.path, `${firstTestCase.name} with extension`, mockTestFunction)).toBe(
            true,
          );
        });

        test(`should handle uppercase ${testType.type.toUpperCase()} extension`, () => {
          expect(runFixtureTest(firstTestCase.path, `${firstTestCase.name} uppercase`, mockTestFunction)).toBe(true);
        });
      }
    }
  });
});
