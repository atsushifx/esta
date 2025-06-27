// tests: ./e2e/utils/fixtureRunner.ts
// fixture testランナー
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// types
import type { Root } from 'mdast';
// types
import type { ExpectedConfig } from './validators';
// vitest
import { expect } from 'vitest';
// parser
import { parseText } from '../../../src/parseText';
// validators
import { validateResult } from './validators';

export const readInputFile = (testCasePath: string): { content: string; extension: string } => {
  const files = readdirSync(testCasePath);
  const inputFile = files.find((file) => file.startsWith('input.'));

  if (!inputFile) {
    throw new Error(`No input file found in ${testCasePath}`);
  }

  const extension = inputFile.split('.').pop() || '';
  const content = readFileSync(join(testCasePath, inputFile), 'utf8');

  return { content, extension };
};

export const readExpectedConfig = (testCasePath: string): ExpectedConfig => {
  const configPath = join(testCasePath, 'output.json');
  const content = readFileSync(configPath, 'utf8');
  return JSON.parse(content) as ExpectedConfig;
};

export const runFixtureTest = (testCasePath: string, _testName: string): boolean => {
  const { content, extension } = readInputFile(testCasePath);
  const expected = readExpectedConfig(testCasePath);

  let result: unknown;
  if (expected.type === 'markdown') {
    result = parseText<Root>(extension, content);
  } else {
    result = parseText(extension, content);
  }

  return validateResult(result, expected);
};

export const runFixtureTestWithExpect = (testCasePath: string, testName: string): void => {
  const isValid = runFixtureTest(testCasePath, testName);
  expect(isValid).toBe(true);
};
