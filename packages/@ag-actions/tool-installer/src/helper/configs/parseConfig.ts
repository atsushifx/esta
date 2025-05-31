// src: ./utils/parseConfig.ts
// 設定データ解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { parse as parseJsonc } from 'comment-json';
export const parseJsoncConfig = (raw: string | undefined): object => {
  if (!raw) {
    return {};
  }
  const parsed = parseJsonc(raw);
  return parsed as object;
};
