// src: ./parser/parseJsonc.ts
// JSONC設定ファイル解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { parse } from 'comment-json';

/**
 * JSONC（コメント付きJSON）形式の文字列を解析して設定オブジェクトを返します
 *
 * @template T 解析結果の型
 * @param raw 解析対象のJSONC文字列
 * @returns 解析された設定オブジェクト
 *
 * @description
 * - 標準JSON形式をサポート
 * - 行コメント（//）とブロックコメント（/ * * /）をサポート
 * - 空文字列やundefinedの場合は空オブジェクトを返却
 *
 * @example
 * ```typescript
 * // コメント付きJSONの解析
 * const config = parseJsonc(JSON.stringify({
 *   name: "my-app",
 *   version: "1.0.0"
 * }));
 * ```
 */
export const parseJsonc = <T = object>(raw: string | undefined): T => {
  if (!raw) {
    return {} as T;
  }
  const parsed = parse(raw);
  return parsed as T;
};
