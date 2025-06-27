// src: ./framework/fixtureRunner.ts
// fixture testランナー
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { Root } from 'mdast';
// parser
import { parseText } from '../parseText';
// framework
import { readExpectedConfig, readInputFile } from './io';
import { validateResult } from './validators';

// === 外部関数 ===

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
