// src: ./parser/parseScript.ts
// JavaScript/TypeScript設定ファイル解析ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { spawn } from 'child_process';
import { unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * 設定オブジェクトの型安全性を提供するヘルパー関数
 *
 * @template T 設定オブジェクトの型
 * @param config 設定オブジェクト
 * @returns 渡された設定オブジェクトをそのまま返す
 *
 * @example
 * ```typescript
 * // TypeScript設定ファイルで使用
 * export default defineConfig({
 *   name: 'my-app',
 *   version: '1.0.0'
 * });
 * ```
 */
export const defineConfig = <T extends object>(config: T): T => config;

const executeScriptViaTsx = async <T>(filePath: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const child = spawn('tsx', [filePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result as T);
        } catch (e) {
          reject(new Error(`Failed to parse JSON output: ${String(e)}`));
        }
      } else {
        reject(new Error(`tsx execution failed: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

const executeScriptViaTempFile = async <T>(code: string): Promise<T> => {
  const tempFilePath = join(tmpdir(), `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.ts`);

  try {
    // TypeScriptファイルとして保存し、結果をJSON出力するラッパーを追加
    const wrappedCode = `
// defineConfig関数を定義
const defineConfig = <T extends object>(config: T): T => config;

${code}

// 設定結果をJSON形式で出力
console.log(JSON.stringify(config));
`;
    writeFileSync(tempFilePath, wrappedCode);

    return await executeScriptViaTsx<T>(tempFilePath);
  } finally {
    try {
      unlinkSync(tempFilePath);
    } catch {
      // クリーンアップエラーは無視
    }
  }
};

/**
 * JavaScript/TypeScript設定ファイルの内容を解析して設定オブジェクトを返します
 *
 * @template T 解析結果の型
 * @param raw 解析対象の JavaScript/TypeScript コード文字列
 * @returns 解析された設定オブジェクト
 *
 * @description
 * 以下の形式をサポートします：
 * - `export default { ... }` - ES6 エクスポート形式
 * - `defineConfig({ ... })` - 型安全な設定定義
 * - `{ ... }` - オブジェクトリテラル形式
 *
 * 安全性のため、tsx を使用してコードを実行し、`new Function()` は使用しません。
 *
 * @example
 * ```typescript
 * // export default形式
 * const config1 = await parseScript('export default { name: "app" }');
 *
 * // defineConfig形式
 * const config2 = await parseScript('defineConfig({ port: 3000 })');
 *
 * // オブジェクトリテラル形式
 * const config3 = await parseScript('{ debug: true }');
 * ```
 */
export const parseScript = async <T = object>(raw: string | undefined): Promise<T> => {
  if (!raw) {
    return {} as T;
  }

  try {
    let code = raw.trim();

    // export default 形式をhandle
    if (code.startsWith('export default')) {
      code = code.replace(/^export\s+default\s+/, 'const config = ');
    } // defineConfig形式をhandle
    else if (code.includes('defineConfig(')) {
      code = `const config = ${code}`;
    } // シンプルなオブジェクトリテラル形式をhandle
    else if (code.startsWith('{') && code.endsWith('}')) {
      code = `const config = ${code}`;
    } else {
      // その他の形式はサポートしない
      return {} as T;
    }

    return await executeScriptViaTempFile<T>(code);
  } catch {
    return {} as T;
  }
};
