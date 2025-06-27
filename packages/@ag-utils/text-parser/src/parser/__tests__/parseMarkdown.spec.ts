// src: ./parser/__tests__/parseMarkdown.spec.ts
// parseMarkdown テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, test } from 'vitest';
// parser : test target
import { parseMarkdown } from '../parseMarkdown';

describe('parseMarkdown', () => {
  test('should convert markdown to AST', () => {
    const markdown = '# Hello World';
    const result = parseMarkdown(markdown);
    expect(result).toHaveProperty('type', 'root');
    expect(result).toHaveProperty('children');
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toHaveProperty('type', 'heading');
    expect(result.children[0]).toHaveProperty('depth', 1);
  });

  test('should handle empty string', () => {
    const result = parseMarkdown('');
    expect(result).toHaveProperty('type', 'root');
    expect(result).toHaveProperty('children');
    expect(result.children).toHaveLength(0);
  });

  test('should parse markdown list to AST', () => {
    const markdown = '- Item 1\n- Item 2';
    const result = parseMarkdown(markdown);
    expect(result).toHaveProperty('type', 'root');
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toHaveProperty('type', 'list');
  });

  test('should parse markdown link to AST', () => {
    const markdown = '[Google](https://google.com)';
    const result = parseMarkdown(markdown);
    expect(result).toHaveProperty('type', 'root');
    expect(result.children[0]).toHaveProperty('type', 'paragraph');
  });
});
