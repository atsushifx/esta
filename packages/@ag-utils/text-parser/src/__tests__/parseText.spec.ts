// src: ./parseText.test.ts
// parseText テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { TEXT_EXT_TYPE_MAP } from '@shared/types/common.types';
// types
import type { Root } from 'mdast';
// vitest
import { describe, expect, test } from 'vitest';
// parser: test target
import { parseText } from '../parseText';

describe('parseText', () => {
  test('should map txt extension to plaintext', () => {
    expect(TEXT_EXT_TYPE_MAP.txt).toBe('plaintext');
  });

  test('should parse txt extension and return raw content', () => {
    const rawText = 'Hello, this is plain text content';
    const result = parseText('txt', rawText);
    expect(result).toBe(rawText);
  });

  test('should handle empty string safely for plaintext', () => {
    const result = parseText('txt', '');
    expect(result).toBe('');
  });

  test('should handle multiline text for plaintext', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    const result = parseText('txt', multilineText);
    expect(result).toBe(multilineText);
  });

  test('should parse markdown extension and return AST', () => {
    const markdown = '# Hello World';
    const result = parseText<Root>('md', markdown);
    expect(result).toHaveProperty('type', 'root');
    expect(result).toHaveProperty('children');
    expect(result.children[0]).toHaveProperty('type', 'heading');
  });
});
