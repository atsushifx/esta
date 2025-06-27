// tests: ./e2e/parseText.e2e.refactored.spec.ts
// parseText E2E テスト（リファクタリング版）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { join } from 'node:path';
// vitest
import { describe, test } from 'vitest';
// test utilities
import { runFixtureTest } from './utils/fixtureRunner';
import { scanTestTypes } from './utils/testDiscovery';

const fixturesDir = join(__dirname, 'fixtures');

describe('parseText E2E (Refactored)', () => {
  const testTypes = scanTestTypes(fixturesDir);

  for (const testType of testTypes) {
    describe(`${testType.type} files`, () => {
      for (const testCase of testType.testCases) {
        test(`should process ${testCase.name} ${testCase.type} file`, () => {
          runFixtureTest(testCase.path, testCase.name);
        });
      }
    });
  }

  // Extension detection tests (dynamic)
  describe('File extension detection', () => {
    for (const testType of testTypes) {
      const firstTestCase = testType.testCases[0];
      if (firstTestCase) {
        test(`should detect .${testType.type} extension correctly`, () => {
          // Use the extension from the input file
          const extension = testType.type === 'plaintext' ? 'txt' : testType.type === 'markdown' ? 'md' : testType.type;
          runFixtureTest(firstTestCase.path, `${firstTestCase.name} with .${extension}`);
        });

        test(`should handle uppercase ${testType.type.toUpperCase()} extension`, () => {
          const extension = testType.type === 'plaintext'
            ? 'TXT'
            : testType.type === 'markdown'
            ? 'MD'
            : testType.type.toUpperCase();
          runFixtureTest(firstTestCase.path, `${firstTestCase.name} with ${extension}`);
        });
      }
    }
  });
});
