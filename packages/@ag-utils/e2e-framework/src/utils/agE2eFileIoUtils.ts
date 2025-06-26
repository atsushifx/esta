// src: ./src/utils/agE2EFileIoUtils.ts
// @(#): AgE2E ファイルI/Oユーティリティ - ファイルとディレクトリの基本操作
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import type { AgE2eFileExtension, AgE2eFileFormat } from '../../shared/types/e2e-framework.types';

import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

// types
import { AG_E2E_FILE_FORMAT_MAP } from '../../shared/types/e2e-framework.types';

// -----------------------------------------------------------------------------
// INTERNAL HELPER FUNCTIONS
// -----------------------------------------------------------------------------

const _convertContentToString = (
  content: string | Record<string, unknown>,
  format?: AgE2eFileFormat,
): string => {
  if (typeof content === 'string') {
    return content;
  }

  switch (format) {
    case 'json':
      return JSON.stringify(content, null, 2);
    case 'yaml':
      return JSON.stringify(content, null, 2); // TODO: Implement proper YAML serialization
    case 'typescript':
      return `export default ${JSON.stringify(content, null, 2)};`;
    case 'markdown':
      return typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
    case 'text':
      return typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
    default:
      return JSON.stringify(content, null, 2);
  }
};

const _ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  if (!fs.existsSync(dirPath)) {
    await fsp.mkdir(dirPath, { recursive: true });
  }
};

const _checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

const _getSupportedExtensions = (): AgE2eFileExtension[] => {
  return Object.keys(AG_E2E_FILE_FORMAT_MAP) as AgE2eFileExtension[];
};

// -----------------------------------------------------------------------------
// PUBLIC API - DIRECTORY OPERATIONS
// -----------------------------------------------------------------------------

// Synchronous Directory Operations
export const createDirectory = (dirPath: string): void => {
  fs.mkdirSync(dirPath, { recursive: true });
};

export const createTempDirectory = (prefix: string): string => {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
};

export const removeDirectorySync = (dirPath: string): void => {
  if (_checkFileExists(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

// Asynchronous Directory Operations
export const removeDirectory = async (dirPath: string): Promise<void> => {
  if (_checkFileExists(dirPath)) {
    await fsp.rm(dirPath, { recursive: true, force: true });
  }
};

// -----------------------------------------------------------------------------
// PUBLIC API - FILE OPERATIONS
// -----------------------------------------------------------------------------

// Synchronous File Operations
export const fileExists = (filePath: string): boolean => {
  return _checkFileExists(filePath);
};

export const readFileSync = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8');
};

export const writeFileSync = (
  filePath: string,
  content: string | Record<string, unknown>,
  format?: AgE2eFileFormat,
): void => {
  const fileContent = _convertContentToString(content, format);
  fs.writeFileSync(filePath, fileContent);
};

// Asynchronous File Operations
export const readFile = async (filePath: string): Promise<string> => {
  return await fsp.readFile(filePath, 'utf8');
};

export const readFileTyped = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).slice(1) as AgE2eFileExtension;
  const supportedExtensions = _getSupportedExtensions();

  if (!supportedExtensions.includes(ext)) {
    throw new Error(`Unsupported file extension: ${ext}. Supported extensions: ${supportedExtensions.join(', ')}`);
  }

  return await fsp.readFile(filePath, 'utf8');
};

export const writeFile = async (
  filePath: string,
  content: string | Record<string, unknown>,
  format?: AgE2eFileFormat,
): Promise<void> => {
  const fileContent = _convertContentToString(content, format);
  const dirPath = path.dirname(filePath);

  await _ensureDirectoryExists(dirPath);
  await fsp.writeFile(filePath, fileContent, 'utf8');
};

// -----------------------------------------------------------------------------
// PUBLIC API - SPECIALIZED OPERATIONS
// -----------------------------------------------------------------------------

// Synchronous Specialized Operations
export const writeExpectedResult = (result: unknown, filePath: string): void => {
  const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  fs.writeFileSync(filePath, content);
};
