// src: ./framework/validators/index.ts
// バリデーターエクスポート
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export * from './markdownValidator';
export * from './plaintextValidator';

// types
import type { ExpectedConfig } from '@shared/types';
// validators
import { validateMarkdownResult } from './markdownValidator';
import { validatePlaintextResult } from './plaintextValidator';

// === 外部関数 ===

export const validateResult = (result: unknown, expected: ExpectedConfig): boolean => {
  switch (expected.type) {
    case 'plaintext':
      return validatePlaintextResult(result, expected);
    case 'markdown':
      return validateMarkdownResult(result, expected);
    default:
      throw new Error(`Unknown expected type: ${(expected as { type: string }).type}`);
  }
};
