// src: ./framework/io/fileReader.ts
// ファイル読み込み関数
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

// === 外部関数 ===

export const readInputFile = (testCasePath: string): FileInput => {
  const files = readdirSync(testCasePath);
  const inputFile = files.find((file) => file.startsWith('input.'));

  if (!inputFile) {
    throw new Error(`No input file found in ${testCasePath}`);
  }

  const extension = inputFile.split('.').pop() ?? '';
  const content = readFileSync(join(testCasePath, inputFile), 'utf8');

  return { content, extension };
};

export const readExpectedConfig = (testCasePath: string): ExpectedConfig => {
  const configPath = join(testCasePath, 'output.json');
  const content = readFileSync(configPath, 'utf8');
  return JSON.parse(content) as ExpectedConfig;
};
