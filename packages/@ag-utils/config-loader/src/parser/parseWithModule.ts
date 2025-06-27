// src: ./parser/parseWithModule.ts
// 設定データ解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { parse as parseJsonc } from 'comment-json';
import { parse as parseYaml } from 'yaml';

// ----------------
// public
// ----------------

/**
 * TypeScript/JavaScript設定ファイル用のヘルパー関数
 *
 * 設定オブジェクトの型情報を保持したまま、そのまま返す関数です。
 * TypeScript/JavaScript設定ファイルで型安全性とIntelliSenseサポートを提供します。
 *
 * @template T - 設定オブジェクトの型
 * @param config - 設定オブジェクト
 * @returns 渡された設定オブジェクトをそのまま返す
 *
 * @example
 * ```typescript
 * // tsconfig.js
 * export default defineConfig({
 *   compilerOptions: {
 *     target: 'es2020',
 *     module: 'commonjs'
 *   }
 * });
 * ```
 */
export const defineConfig = <T extends object>(config: T): T => config;

export const parseJsoncConfig = <T = object>(raw: string | undefined): T => {
  if (!raw) {
    return {} as T;
  }
  const parsed = parseJsonc(raw);
  return parsed as T;
};

export const parseYamlConfig = <T = object>(raw: string | undefined): T => {
  if (!raw) {
    return {} as T;
  }
  const parsed = parseYaml(raw);
  return parsed as T;
};

export const parseTSConfig = <T = object>(raw: string | undefined): T => {
  if (!raw) {
    return {} as T;
  }
  try {
    let code = raw.trim();

    // export default 形式をhandle
    if (code.startsWith('export default')) {
      code = code.replace(/^export\s+default\s+/, 'return ');
    } // defineConfig形式をhandle
    else if (code.includes('defineConfig(')) {
      code = `return ${code}`;
    } // シンプルなオブジェクトリテラル形式をhandle
    else if (code.startsWith('{') && code.endsWith('}')) {
      code = `return ${code}`;
    }

    const func = new Function('defineConfig', code);
    const parsed = func(defineConfig);
    return parsed as T;
  } catch {
    return {} as T;
  }
};
