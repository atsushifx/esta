// src: ./parser/parseMarkdown.ts
// Markdownパーサー
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { Root } from 'mdast';
import { remark } from 'remark';

export const parseMarkdown = (text: string): Root => {
  return remark().parse(text);
};
