// src: ./framework/types/validator.types.ts
// バリデーター型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export type PlaintextExpected = {
  type: 'plaintext';
  expected: string;
};

export type MarkdownExpected = {
  type: 'markdown';
  expected: {
    children?: Array<{ type: string; depth?: number }>;
    properties?: {
      childCount?: string;
      hasHeading?: boolean;
      hasList?: boolean;
      hasCode?: boolean;
      hasBlockquote?: boolean;
      hasParagraph?: boolean;
      hasText?: boolean;
    };
  };
};

export type ExpectedConfig = PlaintextExpected | MarkdownExpected;
