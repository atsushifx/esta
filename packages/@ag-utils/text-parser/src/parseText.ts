// src: ./parser/parseText.ts
// テキストデータ解析ルーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { type ExtensionList, TEXT_EXT_TYPE_MAP } from '@shared/types/common.types';

export const parseText = <T = object>(extension: string, _raw: string | undefined): T => {
  const normalizedExt = extension.replace(/^\./, '').toLowerCase() as ExtensionList;
  const textType = TEXT_EXT_TYPE_MAP[normalizedExt];

  switch (textType) {
    case 'markdown':
      return {} as T;
    case 'void':
      return {} as T;
    default:
      return {} as T;
  }
};
