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
import { AgE2eFixtureFramework, AgE2eScanCategorizedTests, AgE2eScanFlatTests, type TestCase } from '../../src';

const fixturesDir = join(__dirname, 'fixtures');
const fixturesFlatDir = join(__dirname, 'fixtures-flat');

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
  const testCases = AgE2eScanCategorizedTests(fixturesDir);

  // タイプ別にグループ化
  const testTypeMap = new Map<string, TestCase[]>();
  for (const testCase of testCases) {
    if (!testTypeMap.has(testCase.type)) {
      testTypeMap.set(testCase.type, []);
    }
    testTypeMap.get(testCase.type)!.push(testCase);
  }

  for (const [type, cases] of testTypeMap) {
    describe(`${type} files`, () => {
      for (const testCase of cases) {
        test(`should process ${testCase.name}`, () => {
          const framework = new AgE2eFixtureFramework(mockTestFunction);
          const isValid = framework.runTest(testCase.path);
          expect(isValid).toBe(true);
        });
      }
    });
  }

  // Extension detection tests
  describe('File extension detection', () => {
    for (const [type, cases] of testTypeMap) {
      if (cases.length > 0) {
        const firstTestCase = cases[0];
        test(`should detect .${type} extension correctly`, () => {
          const framework = new AgE2eFixtureFramework(mockTestFunction);
          expect(framework.runTest(firstTestCase.path)).toBe(
            true,
          );
        });

        test(`should handle uppercase ${type.toUpperCase()} extension`, () => {
          const framework = new AgE2eFixtureFramework(mockTestFunction);
          expect(framework.runTest(firstTestCase.path)).toBe(true);
        });
      }
    }
  });
});

describe('Fixture Framework E2E - Flat Structure', () => {
  const testCases = AgE2eScanFlatTests(fixturesFlatDir);

  // 基本的なフラット構造テスト
  describe('Flat structure tests', () => {
    for (const testCase of testCases) {
      test(`should process flat test ${testCase.name}`, () => {
        const framework = new AgE2eFixtureFramework(mockTestFunction);
        const isValid = framework.runTest(testCase.path);
        expect(isValid).toBe(true);
      });
    }
  });

  // コメントアウト機能テスト
  test('should skip commented out tests in flat structure', () => {
    const allTestCases = AgE2eScanFlatTests(fixturesFlatDir);
    const disabledTests = allTestCases.filter((tc) => tc.name.startsWith('#'));
    expect(disabledTests).toHaveLength(0);
  });

  // フラット構造の特性テスト
  test('should have type equal to name in flat structure', () => {
    const flatTestCases = AgE2eScanFlatTests(fixturesFlatDir);
    for (const testCase of flatTestCases) {
      expect(testCase.type).toBe(testCase.name);
    }
  });
});
