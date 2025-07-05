// src: ./parser/parseScript.ts
// JavaScript/TypeScript設定ファイル解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export const defineConfig = <T extends object>(config: T): T => config;

export const parseScript = <T = object>(raw: string | undefined): T => {
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
