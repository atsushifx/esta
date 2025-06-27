// src: ./framework/fixtureRunner.ts
// fixture testランナー
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// framework
import { readExpectedConfig, readInputFile } from './io';
import { validateResult } from './validators';

// === 型定義 ===

export type TestFunction<T = unknown> = (extension: string, content: string) => T;

// === 外部関数 ===

export const runFixtureTest = <T = unknown>(
  testCasePath: string,
  _testName: string,
  testFunction: TestFunction<T>,
): boolean => {
  const { content, extension } = readInputFile(testCasePath);
  const expected = readExpectedConfig(testCasePath);

  const result = testFunction(extension, content);

  return validateResult(result, expected);
};
