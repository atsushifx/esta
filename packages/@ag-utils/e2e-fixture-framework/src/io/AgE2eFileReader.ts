// src: ./framework/io/AgE2eFileReader.ts
// ファイルIOユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// types
import type { ExpectedConfig, FileInput } from '@shared/types';

export class AgE2eFileReader {
  // ------------------------------------
  // 外部メソッド
  // ------------------------------------

  readInputFile(testCasePath: string): FileInput {
    const files = this._readDirectory(testCasePath);
    const inputFile = this._findInputFile(files);

    const extension = this._extractExtension(inputFile);
    const content = this._readFile(join(testCasePath, inputFile));

    return { content, extension };
  }

  readExpectedConfig(testCasePath: string): ExpectedConfig {
    const configPath = join(testCasePath, 'output.json');
    const content = this._readFile(configPath);
    return JSON.parse(content) as ExpectedConfig;
  }

  // ------------------------------------
  // 内部メソッド
  // ------------------------------------

  private _readDirectory(dirPath: string): string[] {
    return readdirSync(dirPath);
  }

  private _readFile(filePath: string): string {
    return readFileSync(filePath, 'utf8');
  }

  private _findInputFile(files: string[]): string {
    const inputFile = files.find((file) => file.startsWith('input.'));
    if (!inputFile) {
      throw new Error('No input file found');
    }
    return inputFile;
  }

  private _extractExtension(fileName: string): string {
    return fileName.split('.').pop() ?? '';
  }
}
