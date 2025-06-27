// src: ./parser/parsePlaintextConfig.ts
// プレーンテキスト設定ファイルパーサー
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export const parsePlaintextConfig = <T = object>(raw: string | undefined): T => {
  if (raw === undefined) {
    return {} as T;
  }

  return { content: raw } as T;
};
