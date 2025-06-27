// tests: ./e2e/parseText.e2e.spec.ts
// parseText E2E テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// types
import type { Root } from 'mdast';
// types
import type { ExpectedConfig } from './utils/validators';
// vitest
import { describe, expect, test } from 'vitest';
// parser
import { parseText } from '../../src/parseText';
// validators
import { validateResult } from './utils/validators';

const fixturesDir = join(__dirname, 'fixtures');

const readFixture = (type: string, testCase: string, filename: string): string => {
  const filePath = join(fixturesDir, type, testCase, filename);
  return readFileSync(filePath, 'utf8');
};

const readExpected = (type: string, testCase: string): ExpectedConfig => {
  const filePath = join(fixturesDir, type, testCase, 'output.json');
  const content = readFileSync(filePath, 'utf8');
  return JSON.parse(content) as ExpectedConfig;
};

describe('parseText E2E', () => {
  describe('PlainText files', () => {
    test('should process basic plaintext file', () => {
      const content = readFixture('plaintext', 'basic', 'input.txt');
      const expected = readExpected('plaintext', 'basic');
      const result = parseText('txt', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });

    test('should process multiline plaintext file', () => {
      const content = readFixture('plaintext', 'multiline', 'input.txt');
      const expected = readExpected('plaintext', 'multiline');
      const result = parseText('txt', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });
  });

  describe('Markdown files', () => {
    test('should process heading markdown file', () => {
      const content = readFixture('markdown', 'heading', 'input.md');
      const expected = readExpected('markdown', 'heading');
      const result = parseText<Root>('md', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });

    test('should process complex markdown file', () => {
      const content = readFixture('markdown', 'complex', 'input.md');
      const expected = readExpected('markdown', 'complex');
      const result = parseText<Root>('md', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });
  });

  describe('File extension detection', () => {
    test('should detect .txt extension correctly', () => {
      const content = readFixture('plaintext', 'basic', 'input.txt');
      const expected = readExpected('plaintext', 'basic');
      const result = parseText('.txt', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });

    test('should detect .md extension correctly', () => {
      const content = readFixture('markdown', 'heading', 'input.md');
      const expected = readExpected('markdown', 'heading');
      const result = parseText('.md', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });

    test('should handle uppercase extensions', () => {
      const content = readFixture('plaintext', 'basic', 'input.txt');
      const expected = readExpected('plaintext', 'basic');
      const result = parseText('TXT', content);
      const isValid = validateResult(result, expected);
      expect(isValid).toBe(true);
    });
  });
});
