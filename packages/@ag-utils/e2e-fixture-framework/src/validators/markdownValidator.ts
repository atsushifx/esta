// src: ./framework/validators/markdownValidator.ts
// Markdown ASTバリデーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { MarkdownExpected } from '@shared/types';
import type { Root } from 'mdast';

// === 内部関数 ===

const _validateChildrenStructure = (
  astResult: Root,
  expectedChildren: Array<{ type: string; depth?: number }>,
): boolean => {
  if (astResult.children.length !== expectedChildren.length) {
    return false;
  }

  return expectedChildren.every((expectedChild, index) => {
    const actualChild = astResult.children[index];
    if (actualChild.type !== expectedChild.type) {
      return false;
    }
    if (expectedChild.depth !== undefined && 'depth' in actualChild && actualChild.depth !== expectedChild.depth) {
      return false;
    }
    return true;
  });
};

const _validateProperties = (
  astResult: Root,
  properties: NonNullable<MarkdownExpected['expected']['properties']>,
): boolean => {
  if (properties.childCount) {
    if (properties.childCount.startsWith('>')) {
      const minCount = parseInt(properties.childCount.slice(1));
      if (astResult.children.length <= minCount) {
        return false;
      }
    } else {
      if (astResult.children.length !== parseInt(properties.childCount)) {
        return false;
      }
    }
  }

  if (properties.hasHeading) {
    const hasHeading = astResult.children.some((child) => child.type === 'heading');
    if (!hasHeading) { return false; }
  }

  if (properties.hasList) {
    const hasList = astResult.children.some((child) => child.type === 'list');
    if (!hasList) { return false; }
  }

  if (properties.hasCode) {
    const hasCode = astResult.children.some((child) => child.type === 'code');
    if (!hasCode) { return false; }
  }

  if (properties.hasBlockquote) {
    const hasBlockquote = astResult.children.some((child) => child.type === 'blockquote');
    if (!hasBlockquote) { return false; }
  }

  if (properties.hasParagraph) {
    const hasParagraph = astResult.children.some((child) => child.type === 'paragraph');
    if (!hasParagraph) { return false; }
  }

  if (properties.hasText) {
    const _hasTextNode = (node: unknown): boolean => {
      const astNode = node as { type: string; children?: unknown[] };
      if (astNode.type === 'text') { return true; }
      if (astNode.children) {
        return astNode.children.some(_hasTextNode);
      }
      return false;
    };
    const hasText = astResult.children.some(_hasTextNode);
    if (!hasText) { return false; }
  }

  return true;
};

// === 外部関数 ===

export const validateMarkdownResult = (result: unknown, expected: MarkdownExpected): boolean => {
  if (!result || typeof result !== 'object' || !('type' in result) || result.type !== 'root') {
    return false;
  }

  const astResult = result as Root;

  const expectedAst = expected.expected;

  if (expectedAst.children) {
    if (!_validateChildrenStructure(astResult, expectedAst.children)) {
      return false;
    }
  }

  if (expectedAst.properties) {
    if (!_validateProperties(astResult, expectedAst.properties)) {
      return false;
    }
  }

  return true;
};
