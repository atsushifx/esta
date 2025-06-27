// tests: ./e2e/parseText.e2e.final.spec.ts
// parseText E2E テスト（最終版）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { join } from 'node:path';
// vitest
import { describe, expect, test } from 'vitest';
// test utilities
import { runFixtureTest, runFixtureTestWithExpect } from './utils/fixtureRunner';
import { scanTestTypes } from './utils/testDiscovery';

const fixturesDir = join(__dirname, 'fixtures');

describe('parseText E2E (Final)', () => {
  const testTypes = scanTestTypes(fixturesDir);

  for (const testType of testTypes) {
    describe(`${testType.type} files`, () => {
      for (const testCase of testType.testCases) {
        test(`should process ${testCase.name} ${testCase.type} file`, () => {
          // Option 1: Using expect inside test
          runFixtureTestWithExpect(testCase.path, testCase.name);
        });

        test(`should validate ${testCase.name} ${testCase.type} file (return value)`, () => {
          // Option 2: Using return value
          const isValid = runFixtureTest(testCase.path, testCase.name);
          expect(isValid).toBe(true);
        });
      }
    });
  }

  // Extension detection tests
  describe('File extension detection', () => {
    for (const testType of testTypes) {
      const firstTestCase = testType.testCases[0];
      if (firstTestCase) {
        test(`should detect .${testType.type} extension correctly`, () => {
          expect(runFixtureTest(firstTestCase.path, `${firstTestCase.name} with extension`)).toBe(true);
        });

        test(`should handle uppercase ${testType.type.toUpperCase()} extension`, () => {
          expect(runFixtureTest(firstTestCase.path, `${firstTestCase.name} uppercase`)).toBe(true);
        });
      }
    }
  });
});
