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
// vitest
import { describe, expect, test } from 'vitest';

type ExpectedConfig = {
  type: 'string' | 'ast';
  expected: string | {
    children?: Array<{ type: string; depth?: number }>;
    properties?: {
      childCount?: string;
      hasHeading?: boolean;
      hasList?: boolean;
      hasCode?: boolean;
      hasBlockquote?: boolean;
    };
  };
};
// parser: test target
import { parseText } from '../../src/parseText';

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

const validateResult = (result: unknown, expected: ExpectedConfig): void => {
  switch (expected.type) {
    case 'string':
      expect(result).toBe(expected.expected);
      break;

    case 'ast': {
      const astResult = result as Root;
      expect(astResult).toHaveProperty('type', 'root');

      const expectedAst = expected.expected as Exclude<ExpectedConfig['expected'], string>;

      if (expectedAst.children) {
        expect(astResult.children).toHaveLength(expectedAst.children.length);
        expectedAst.children.forEach((expectedChild, index) => {
          expect(astResult.children[index]).toMatchObject(expectedChild);
        });
      }

      if (expectedAst.properties) {
        const props = expectedAst.properties;

        if (props.childCount) {
          if (props.childCount.startsWith('>')) {
            const minCount = parseInt(props.childCount.slice(1));
            expect(astResult.children.length).toBeGreaterThan(minCount);
          } else {
            expect(astResult.children).toHaveLength(parseInt(props.childCount));
          }
        }

        if (props.hasHeading) {
          const hasHeading = astResult.children.some((child) => child.type === 'heading');
          expect(hasHeading).toBe(true);
        }

        if (props.hasList) {
          const hasList = astResult.children.some((child) => child.type === 'list');
          expect(hasList).toBe(true);
        }

        if (props.hasCode) {
          const hasCode = astResult.children.some((child) => child.type === 'code');
          expect(hasCode).toBe(true);
        }

        if (props.hasBlockquote) {
          const hasBlockquote = astResult.children.some((child) => child.type === 'blockquote');
          expect(hasBlockquote).toBe(true);
        }
      }
      break;
    }

    default:
      throw new Error(`Unknown expected type: ${expected.type}`);
  }
};

describe('parseText E2E', () => {
  describe('PlainText files', () => {
    test('should process basic plaintext file', () => {
      const content = readFixture('plaintext', 'basic', 'input.txt');
      const expected = readExpected('plaintext', 'basic');
      const result = parseText('txt', content);
      validateResult(result, expected);
    });

    test('should process multiline plaintext file', () => {
      const content = readFixture('plaintext', 'multiline', 'input.txt');
      const expected = readExpected('plaintext', 'multiline');
      const result = parseText('txt', content);
      validateResult(result, expected);
    });
  });

  describe('Markdown files', () => {
    test('should process heading markdown file', () => {
      const content = readFixture('markdown', 'heading', 'input.md');
      const expected = readExpected('markdown', 'heading');
      const result = parseText<Root>('md', content);
      validateResult(result, expected);
    });

    test('should process complex markdown file', () => {
      const content = readFixture('markdown', 'complex', 'input.md');
      const expected = readExpected('markdown', 'complex');
      const result = parseText<Root>('md', content);
      validateResult(result, expected);
    });
  });

  describe('File extension detection', () => {
    test('should detect .txt extension correctly', () => {
      const content = readFixture('plaintext', 'basic', 'input.txt');
      const expected = readExpected('plaintext', 'basic');
      const result = parseText('.txt', content);
      validateResult(result, expected);
    });

    test('should detect .md extension correctly', () => {
      const content = readFixture('markdown', 'heading', 'input.md');
      const expected = readExpected('markdown', 'heading');
      const result = parseText('.md', content);
      validateResult(result, expected);
    });

    test('should handle uppercase extensions', () => {
      const content = readFixture('plaintext', 'basic', 'input.txt');
      const expected = readExpected('plaintext', 'basic');
      const result = parseText('TXT', content);
      validateResult(result, expected);
    });
  });
});
