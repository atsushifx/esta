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

// ------------------------------------
// 外部関数
// ------------------------------------

export const validateMarkdownResult = (result: unknown, expected: MarkdownExpected): boolean => {
  if (!_isValidMarkdownAst(result)) {
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

// ------------------------------------
// 内部関数
// ------------------------------------

const _isValidMarkdownAst = (result: unknown): boolean => {
  return !!(result && typeof result === 'object' && 'type' in result && result.type === 'root');
};

const _validateChildrenStructure = (
  astResult: Root,
  expectedChildren: Array<{ type: string; depth?: number }>,
): boolean => {
  if (astResult.children.length !== expectedChildren.length) {
    return false;
  }

  return expectedChildren.every((expectedChild, index) => {
    const actualChild = astResult.children[index];
    return _isMatchingChild(actualChild, expectedChild);
  });
};

const _isMatchingChild = (
  actualChild: { type: string; depth?: number },
  expectedChild: { type: string; depth?: number },
): boolean => {
  if (actualChild.type !== expectedChild.type) {
    return false;
  }
  if (expectedChild.depth !== undefined && 'depth' in actualChild && actualChild.depth !== expectedChild.depth) {
    return false;
  }
  return true;
};

const _validateProperties = (
  astResult: Root,
  properties: NonNullable<MarkdownExpected['expected']['properties']>,
): boolean => {
  if (properties.childCount && !_validateChildCount(astResult, properties.childCount)) {
    return false;
  }

  const validationChecks = [
    { prop: properties.hasHeading, type: 'heading' },
    { prop: properties.hasList, type: 'list' },
    { prop: properties.hasCode, type: 'code' },
    { prop: properties.hasBlockquote, type: 'blockquote' },
    { prop: properties.hasParagraph, type: 'paragraph' },
  ];

  for (const check of validationChecks) {
    if (check.prop && !_hasChildType(astResult, check.type)) {
      return false;
    }
  }

  if (properties.hasText && !_hasTextContent(astResult)) {
    return false;
  }

  return true;
};

const _validateChildCount = (astResult: Root, childCount: string): boolean => {
  if (childCount.startsWith('>')) {
    const minCount = parseInt(childCount.slice(1));
    return astResult.children.length > minCount;
  } else {
    return astResult.children.length === parseInt(childCount);
  }
};

const _hasChildType = (astResult: Root, type: string): boolean => {
  return astResult.children.some((child) => child.type === type);
};

const _hasTextContent = (astResult: Root): boolean => {
  return astResult.children.some(_hasTextNode);
};

const _hasTextNode = (node: unknown): boolean => {
  const astNode = node as { type: string; children?: unknown[] };
  if (astNode.type === 'text') { return true; }
  if (astNode.children) {
    return astNode.children.some(_hasTextNode);
  }
  return false;
};
