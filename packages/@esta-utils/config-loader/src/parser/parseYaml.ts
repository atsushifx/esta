// src: ./parser/parseYaml.ts
// YAML設定ファイル解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { parse } from 'yaml';

/**
 * YAML形式の文字列を解析して設定オブジェクトを返します
 *
 * @template T 解析結果の型
 * @param raw 解析対象のYAML文字列
 * @returns 解析された設定オブジェクト
 *
 * @description
 * - YAML 1.2仕様をサポート
 * - ネストした構造、配列、複数ドキュメントをサポート
 * - 空文字列やundefinedの場合は空オブジェクトを返却
 *
 * @example
 * ```typescript
 * // YAML設定の解析
 * const config = parseYaml(`
 * name: my-app
 * version: 1.0.0
 * database:
 *   host: localhost
 *   port: 5432
 * features:
 *   - auth
 *   - logging
 * `);
 * ```
 */
export const parseYaml = <T = object>(raw: string | undefined): T => {
  if (!raw) {
    return {} as T;
  }
  const parsed = parse(raw);
  return parsed as T;
};
