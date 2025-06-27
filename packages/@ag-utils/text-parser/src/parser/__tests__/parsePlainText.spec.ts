// src: ./parser/__tests__/parsePlainText.spec.ts
// parsePlainText テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, test } from 'vitest';
// parser : test target
import { parsePlainText } from '../parsePlainText';

describe('parsePlainText', () => {
  test('should return text as-is', () => {
    const text = 'Hello, this is plain text';
    const result = parsePlainText(text);
    expect(result).toBe(text);
  });

  test('should handle empty string', () => {
    const result = parsePlainText('');
    expect(result).toBe('');
  });

  test('should handle multiline text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    const result = parsePlainText(multilineText);
    expect(result).toBe(multilineText);
  });
});
