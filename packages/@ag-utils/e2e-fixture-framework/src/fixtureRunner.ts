// src: ./framework/fixtureRunner.ts
// AgE2e Fixture Framework
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { ExpectedConfig, MarkdownExpected, PlaintextExpected } from '@shared/types';
// framework
import { AgE2eFileReader } from './io';

// === 型定義 ===

export type AgE2eTestFunction<T = unknown> = (extension: string, content: string) => T;

// === AgE2e Fixture Framework クラス ===

export class AgE2eFixtureFramework<T = unknown> {
  private fileReader: AgE2eFileReader;

  constructor(private testFunction: AgE2eTestFunction<T>) {
    this.fileReader = new AgE2eFileReader();
  }

  /**
   * フィクスチャテストを実行
   */
  runTest(testCasePath: string): boolean {
    const { content, extension } = this.fileReader.readInputFile(testCasePath);
    const expected = this.fileReader.readExpectedConfig(testCasePath);

    const result = this.testFunction(extension, content);

    return this.validateResult(result, expected);
  }

  /**
   * 結果をバリデーション
   */
  private validateResult(result: unknown, expected: ExpectedConfig): boolean {
    switch (expected.type) {
      case 'plaintext':
        return this.validatePlaintext(result, expected);
      case 'markdown':
        return this.validateMarkdown(result, expected);
      default:
        throw new Error(`Unknown expected type: ${(expected as { type: string }).type}`);
    }
  }

  /**
   * Markdownバリデーション
   */
  private validateMarkdown(result: unknown, expected: MarkdownExpected): boolean {
    if (!result || typeof result !== 'object' || !('type' in result) || result.type !== 'root') {
      return false;
    }

    const astResult = result as {
      type: 'root';
      children: Array<{
        type: string;
        depth?: number;
        children?: unknown[];
      }>;
    };

    const expectedAst = expected.expected;

    if (expectedAst.children) {
      if (!this.validateChildrenStructure(astResult, expectedAst.children)) {
        return false;
      }
    }

    if (expectedAst.properties) {
      if (!this.validateProperties(astResult, expectedAst.properties)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Plaintextバリデーション
   */
  private validatePlaintext(result: unknown, expected: PlaintextExpected): boolean {
    return result === expected.expected;
  }

  /**
   * 子要素構造バリデーション
   */
  private validateChildrenStructure(
    astResult: { children: Array<{ type: string; depth?: number }> },
    expectedChildren: Array<{ type: string; depth?: number }>,
  ): boolean {
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
  }

  /**
   * プロパティバリデーション
   */
  private validateProperties(
    astResult: { children: Array<{ type: string; children?: unknown[] }> },
    properties: NonNullable<MarkdownExpected['expected']['properties']>,
  ): boolean {
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
      const hasTextNode = (node: unknown): boolean => {
        const astNode = node as { type: string; children?: unknown[] };
        if (astNode.type === 'text') { return true; }
        if (astNode.children) {
          return astNode.children.some(hasTextNode);
        }
        return false;
      };
      const hasText = astResult.children.some(hasTextNode);
      if (!hasText) { return false; }
    }

    return true;
  }
}
