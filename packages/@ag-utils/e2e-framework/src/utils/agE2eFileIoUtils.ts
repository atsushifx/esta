// src: ./src/utils/agE2eFileIoUtils.ts
// @(#): AgE2E File I/O Utilities - Basic file and directory operations
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgE2eFileExtension, AgE2eFileFormat } from '../../shared/types/e2e-framework.types';

// lib
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

// constants
import { AG_E2E_FILE_FORMAT_MAP } from '../../shared/types/e2e-framework.types';

// -----------------------------------------------------------------------------
// INTERNAL HELPER FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Converts content to a string based on the specified format.
 * Supports JSON, YAML (currently JSON output), TypeScript export, Markdown, and plain text.
 *
 * @param content - The content to convert (string or object).
 * @param format - Optional. The target format for conversion.
 * @returns The content serialized as a string.
 */
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

/**
 * Ensures that the specified directory exists, creating it recursively if necessary.
 *
 * @param dirPath - The directory path to ensure.
 */
const _ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  if (!fs.existsSync(dirPath)) {
    await fsp.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Checks synchronously whether a file or directory exists.
 *
 * @param filePath - The path to check.
 * @returns True if the path exists, false otherwise.
 */
const _checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

/**
 * Returns the list of supported file extensions recognized by the framework.
 *
 * @returns Array of supported file extension strings.
 */
const _getSupportedExtensions = (): AgE2eFileExtension[] => {
  return Object.keys(AG_E2E_FILE_FORMAT_MAP) as AgE2eFileExtension[];
};

// -----------------------------------------------------------------------------
// PUBLIC API - DIRECTORY OPERATIONS
// -----------------------------------------------------------------------------

/**
 * Creates a directory synchronously, including nested directories if needed.
 *
 * @param dirPath - The directory path to create.
 */
export const createDirectory = (dirPath: string): void => {
  fs.mkdirSync(dirPath, { recursive: true });
};

/**
 * Creates a temporary directory with the specified prefix in the OS temp folder.
 *
 * @param prefix - The prefix for the temporary directory name.
 * @returns The path of the created temporary directory.
 */
export const createTempDirectory = (prefix: string): string => {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
};

/**
 * Removes a directory synchronously if it exists.
 *
 * @param dirPath - The directory path to remove.
 */
export const removeDirectorySync = (dirPath: string): void => {
  if (_checkFileExists(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

/**
 * Asynchronously removes a directory if it exists.
 *
 * @param dirPath - The directory path to remove.
 */
export const removeDirectory = async (dirPath: string): Promise<void> => {
  if (_checkFileExists(dirPath)) {
    await fsp.rm(dirPath, { recursive: true, force: true });
  }
};

// -----------------------------------------------------------------------------
// PUBLIC API - FILE OPERATIONS
// -----------------------------------------------------------------------------

/**
 * Checks synchronously whether a file or directory exists.
 *
 * @param filePath - The path to check.
 * @returns True if the path exists, false otherwise.
 */
export const fileExists = (filePath: string): boolean => {
  return _checkFileExists(filePath);
};

/**
 * Reads a file synchronously and returns its content as a UTF-8 string.
 *
 * @param filePath - The file path to read.
 * @returns The file content as string.
 */
export const readFileSync = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8');
};

/**
 * Writes content to a file synchronously, creating parent directories as needed.
 * Supports various formats including JSON and TypeScript export.
 *
 * @param filePath - The file path to write to.
 * @param content - The content to write (string or object).
 * @param format - Optional. Format of the file content.
 */
export const writeFileSync = (
  filePath: string,
  content: string | Record<string, unknown>,
  format?: AgE2eFileFormat,
): void => {
  const fileContent = _convertContentToString(content, format);
  fs.writeFileSync(filePath, fileContent);
};

// -----------------------------------------------------------------------------
// ASYNCHRONOUS FILE OPERATIONS
// -----------------------------------------------------------------------------

/**
 * Asynchronously reads a file and returns its content as a UTF-8 string.
 *
 * @param filePath - The file path to read.
 * @returns Promise resolving to the file content string.
 */
export const readFile = async (filePath: string): Promise<string> => {
  return await fsp.readFile(filePath, 'utf8');
};

/**
 * Asynchronously reads a file with type checking on the file extension.
 * Throws an error if the extension is unsupported.
 *
 * @param filePath - The file path to read.
 * @returns Promise resolving to the file content string.
 * @throws Error if file extension is unsupported.
 */
export const readFileTyped = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).slice(1) as AgE2eFileExtension;
  const supportedExtensions = _getSupportedExtensions();

  if (!supportedExtensions.includes(ext)) {
    throw new Error(`Unsupported file extension: ${ext}. Supported extensions: ${supportedExtensions.join(', ')}`);
  }

  return await fsp.readFile(filePath, 'utf8');
};

/**
 * Asynchronously writes content to a file, creating parent directories as needed.
 * Supports various formats including JSON and TypeScript export.
 *
 * @param filePath - The file path to write to.
 * @param content - The content to write (string or object).
 * @param format - Optional. Format of the file content.
 */
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

/**
 * Writes a test result to a file synchronously.
 * If the result is a string, writes as-is; otherwise serializes to JSON.
 *
 * @param result - The test result to write.
 * @param filePath - The file path to write to.
 */
export const writeExpectedResult = (result: unknown, filePath: string): void => {
  const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  fs.writeFileSync(filePath, content);
};
