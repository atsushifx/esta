// src: ./parser/parseMarkdownConfig.ts
// マークダウン設定ファイルパーサー
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { marked } from 'marked';

export const parseMarkdownConfig = <T = object>(raw: string | undefined): T => {
  if (raw === undefined) {
    return {} as T;
  }

  try {
    const html = marked(raw);
    return { html, raw } as T;
  } catch {
    return { content: raw } as T;
  }
};
