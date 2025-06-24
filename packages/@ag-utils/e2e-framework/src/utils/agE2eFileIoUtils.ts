// src: ./src/utils/agE2EFileIoUtils.ts
// @(#): AgE2E ファイルI/Oユーティリティ - ファイルとディレクトリの基本操作
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as fs from 'fs';

/**
 * ディレクトリ作成
 */
export const createDirectory = (dirPath: string): void => {
  fs.mkdirSync(dirPath, { recursive: true });
};

/**
 * ファイル書き込み
 */
export const writeFile = (filePath: string, content: string | Record<string, unknown>, format?: string): void => {
  let fileContent: string;

  if (typeof content === 'string') {
    fileContent = content;
  } else {
    switch (format) {
      case 'json':
      case 'jsonc':
        fileContent = JSON.stringify(content, null, 2);
        break;
      case 'yaml':
        fileContent = JSON.stringify(content, null, 2);
        break;
      case 'ts':
        fileContent = `export default ${JSON.stringify(content, null, 2)};`;
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
