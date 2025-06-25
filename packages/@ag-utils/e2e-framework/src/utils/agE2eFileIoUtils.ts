// src: ./src/utils/agE2EFileIoUtils.ts
// @(#): AgE2E ファイルI/Oユーティリティ - ファイルとディレクトリの基本操作
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as fs from 'fs';
import * as path from 'path';

// types
import type { AgE2eFileExtension, AgE2eFileFormat } from '../../shared/types/e2e-framework.types';

/**
 * ディレクトリ作成
 */
export const createDirectory = (dirPath: string): void => {
  fs.mkdirSync(dirPath, { recursive: true });
};

/**
 * ファイル書き込み
 */
export const writeFile = (
  filePath: string,
  content: string | Record<string, unknown>,
  format?: AgE2eFileFormat,
): void => {
  let fileContent: string;

  if (typeof content === 'string') {
    fileContent = content;
  } else {
    switch (format) {
      case 'json':
        fileContent = JSON.stringify(content, null, 2);
        break;
      case 'yaml':
        fileContent = JSON.stringify(content, null, 2); // TODO: Implement proper YAML serialization
        break;
      case 'typescript':
        fileContent = `export default ${JSON.stringify(content, null, 2)};`;
        break;
      case 'markdown':
        fileContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
        break;
      case 'text':
        fileContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
        break;
      default:
        fileContent = JSON.stringify(content, null, 2);
    }
  }

  fs.writeFileSync(filePath, fileContent);
};

/**
 * ファイル読み込み
 */
export const readFile = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8');
};

/**
 * 型安全なファイル読み込み（拡張子チェック付き）
 */
export const readFileTyped = (filePath: string): string => {
  const ext = path.extname(filePath).slice(1) as AgE2eFileExtension;

  // サポートされる拡張子かチェック
  const supportedExtensions: AgE2eFileExtension[] = ['json', 'jsonc', 'yaml', 'ts', 'js', 'md', 'txt'];
  if (!supportedExtensions.includes(ext)) {
    throw new Error(`Unsupported file extension: ${ext}. Supported extensions: ${supportedExtensions.join(', ')}`);
  }

  return fs.readFileSync(filePath, 'utf8');
};

/**
 * ファイル存在確認
 */
export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

/**
 * 期待値ファイルへの結果書き込み
 */
export const writeExpectedResult = (result: unknown, filePath: string): void => {
  if (typeof result === 'string') {
    fs.writeFileSync(filePath, result);
  } else {
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  }
};
