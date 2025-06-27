// src: ./parser/parseText.ts
// テキストデータ解析ルーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { ExtensionList } from '@shared/types/common.types';

// constants
import { TEXT_EXT_TYPE_MAP } from '@shared/types/common.types';

// parsers
import { parsePlainText } from './parser/parsePlainText';

export const parseText = <T = object>(extension: string, raw: string): T => {
  const normalizedExt = extension.replace(/^\./, '').toLowerCase() as ExtensionList;
  const textType = TEXT_EXT_TYPE_MAP[normalizedExt];

  switch (textType) {
    case 'markdown':
      return {} as T;
    case 'void':
      return {} as T;
    case 'plaintext':
      return parsePlainText(raw) as T;
    default:
      return {} as T;
  }
};
