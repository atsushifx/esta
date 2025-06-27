// tests: ./e2e/utils/validators/plaintextValidator.ts
// プレーンテキストバリデーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { PlaintextExpected } from './types';

export const validatePlaintextResult = (result: unknown, expected: PlaintextExpected): boolean => {
  return result === expected.expected;
};
