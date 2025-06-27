// src: ./framework/validators/plaintextValidator.ts
// プレーンテキストバリデーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { PlaintextExpected } from '@shared/types';

// ------------------------------------
// 外部関数
// ------------------------------------

export const validatePlaintextResult = (result: unknown, expected: PlaintextExpected): boolean => {
  return _isEqual(result, expected.expected);
};

// ------------------------------------
// 内部関数
// ------------------------------------

const _isEqual = (actual: unknown, expected: unknown): boolean => {
  return actual === expected;
};
