// src: ./parser/parseYaml.ts
// YAML設定ファイル解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { parse } from 'yaml';

export const parseYaml = <T = object>(raw: string | undefined): T => {
  if (!raw) {
    return {} as T;
  }
  const parsed = parse(raw);
  return parsed as T;
};
