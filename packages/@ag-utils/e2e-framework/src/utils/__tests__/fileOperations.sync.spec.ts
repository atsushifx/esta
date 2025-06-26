// src: ./src/utils/__tests__/fileOperations.sync.spec.ts
// @(#): Synchronous File Operations Test - tests for sync version of file I/O utilities
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
// lib
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// vitest
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

// test target
import {
  createDirectory,
  createTempDirectory,
  fileExists,
  readFileSync,
  removeDirectorySync,
  writeExpectedResult,
  writeFileSync,
} from '../agE2eFileIoUtils';

/**
 * Test suite for synchronous file operations in the E2E file I/O utilities.
 *
 * This suite tests the correctness of synchronous file and directory operations,
 * including directory creation, file writing/reading in multiple formats,
 * existence checks, and directory removal.
 *
 * Each test runs in a temporary isolated directory to avoid side effects.
 */
describe('Sync File Operations', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-file-ops-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Tests for the createDirectory function.
   * Verifies creation of directories including nested paths,
   * and graceful handling of already existing directories.
   */
  describe('createDirectory', () => {
    test('creates directory successfully', () => {
      const dirPath = path.join(tempDir, 'new-directory');

      createDirectory(dirPath);

      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    test('creates nested directories', () => {
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'level3');

      createDirectory(nestedPath);

      expect(fs.existsSync(nestedPath)).toBe(true);
      expect(fs.statSync(nestedPath).isDirectory()).toBe(true);
    });

    test('handles existing directory gracefully', () => {
      const existingDir = path.join(tempDir, 'existing');
      fs.mkdirSync(existingDir);

      expect(() => createDirectory(existingDir)).not.toThrow();
      expect(fs.existsSync(existingDir)).toBe(true);
    });
  });

  /**
   * Tests for the synchronous writeFileSync function.
   * Covers writing of string content and objects serialized as JSON,
   * with support for different file formats.
   */
  describe('writeFileSync', () => {
    test('writes string content to file', () => {
      const filePath = path.join(tempDir, 'test.txt');
      const content = 'Hello, Sync World!';

      writeFileSync(filePath, content);

      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    });

    test('writes object as JSON by default', () => {
      const filePath = path.join(tempDir, 'test.json');
      const content = { key: 'value', number: 42, sync: true };

      writeFileSync(filePath, content);

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object as JSON with json format', () => {
      const filePath = path.join(tempDir, 'test.json');
      const content = { test: true, sync: true };

      writeFileSync(filePath, content, 'json');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object as TypeScript export with typescript format', () => {
      const filePath = path.join(tempDir, 'config.ts');
      const content = { name: 'sync-config', version: '1.0.0' };

      writeFileSync(filePath, content, 'typescript');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(writtenContent).toBe(`export default ${JSON.stringify(content, null, 2)};`);
    });

    test('writes object with yaml format (currently outputs JSON)', () => {
      const filePath = path.join(tempDir, 'test.yaml');
      const content = { sync: true, format: 'yaml' };

      writeFileSync(filePath, content, 'yaml');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object with markdown format', () => {
      const filePath = path.join(tempDir, 'content.md');
      const content = { title: 'Sync Markdown', body: 'Some sync content' };

      writeFileSync(filePath, content, 'markdown');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object with text format', () => {
      const filePath = path.join(tempDir, 'data.txt');
      const content = { message: 'Sync text content' };

      writeFileSync(filePath, content, 'text');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });
  });

  /**
   * Tests for the synchronous readFileSync function.
   * Validates reading string and JSON contents,
   * and correct error throwing for missing files.
   */
  describe('readFileSync', () => {
    test('reads file content as string', () => {
      const filePath = path.join(tempDir, 'read-test.txt');
      const content = 'Sync test file content';
      fs.writeFileSync(filePath, content);

      const result = readFileSync(filePath);

      expect(result).toBe(content);
    });

    test('reads JSON file content', () => {
      const filePath = path.join(tempDir, 'data.json');
      const content = { sync: true, data: [1, 2, 3] };
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

      const result = readFileSync(filePath);
      const parsedResult = JSON.parse(result);

      expect(parsedResult).toEqual(content);
    });

    test('throws error for non-existent file', () => {
      const filePath = path.join(tempDir, 'non-existent.txt');

      expect(() => readFileSync(filePath)).toThrow();
    });
  });

  /**
   * Tests for the fileExists function.
   * Checks correct detection of files and directories,
   * and false return for non-existent paths.
   */
  describe('fileExists', () => {
    test('returns true for existing file', () => {
      const filePath = path.join(tempDir, 'existing.txt');
      fs.writeFileSync(filePath, 'content');

      expect(fileExists(filePath)).toBe(true);
    });

    test('returns true for existing directory', () => {
      const dirPath = path.join(tempDir, 'existing-dir');
      fs.mkdirSync(dirPath);

      expect(fileExists(dirPath)).toBe(true);
    });

    test('returns false for non-existent path', () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist.txt');

      expect(fileExists(nonExistentPath)).toBe(false);
    });
  });

  /**
   * Tests for writeExpectedResult function.
   * Ensures that various result types (string, object, number, boolean, null)
   * are correctly serialized and written to files.
   */
  describe('writeExpectedResult', () => {
    test('writes string result to file', () => {
      const filePath = path.join(tempDir, 'expected.txt');
      const result = 'expected sync string result';

      writeExpectedResult(result, filePath);

      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(result);
    });

    test('writes object result as JSON', () => {
      const filePath = path.join(tempDir, 'expected.json');
      const result = { status: 'success', sync: true, data: [1, 2, 3] };

      writeExpectedResult(result, filePath);

      expect(fs.existsSync(filePath)).toBe(true);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(fileContent).toEqual(result);
    });

    test('writes number result as JSON', () => {
      const filePath = path.join(tempDir, 'expected-number.json');
      const result = 42;

      writeExpectedResult(result, filePath);

      expect(fs.existsSync(filePath)).toBe(true);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(fileContent).toBe(result);
    });

    test('writes boolean result as JSON', () => {
      const filePath = path.join(tempDir, 'expected-boolean.json');
      const result = true;

      writeExpectedResult(result, filePath);

      expect(fs.existsSync(filePath)).toBe(true);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(fileContent).toBe(result);
    });

    test('writes null result as JSON', () => {
      const filePath = path.join(tempDir, 'expected-null.json');
      const result = null;

      writeExpectedResult(result, filePath);

      expect(fs.existsSync(filePath)).toBe(true);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      expect(fileContent).toBe(result);
    });
  });

  /**
   * Integration tests for writing and reading files synchronously.
   */
  describe('integration tests', () => {
    test('write then read same content', () => {
      const filePath = path.join(tempDir, 'roundtrip.txt');
      const originalContent = 'Sync round trip test content';

      writeFileSync(filePath, originalContent);
      const readContent = readFileSync(filePath);

      expect(readContent).toBe(originalContent);
    });

    test('write object then read and parse', () => {
      const filePath = path.join(tempDir, 'roundtrip.json');
      const originalContent = {
        sync: true,
        test: 'integration',
        data: { nested: true, values: [1, 2, 3] },
      };

      writeFileSync(filePath, originalContent, 'json');
      const readContent = readFileSync(filePath);
      const parsedContent = JSON.parse(readContent);

      expect(parsedContent).toEqual(originalContent);
    });
  });

  /**
   * Tests for createTempDirectory utility.
   * Checks creation of temporary directories with specified prefix.
   */
  describe('createTempDirectory', () => {
    test('creates temporary directory with prefix', () => {
      const prefix = 'test-';
      const tempDirPath = createTempDirectory(prefix);

      expect(tempDirPath).toBeTruthy();
      expect(fs.existsSync(tempDirPath)).toBe(true);
      expect(path.basename(tempDirPath).startsWith(prefix)).toBe(true);

      // Cleanup
      fs.rmSync(tempDirPath, { recursive: true, force: true });
    });
  });

  /**
   * Tests for synchronous directory removal function removeDirectorySync.
   * Validates removal of existing directories and handling of non-existent ones without errors.
   */
  describe('removeDirectorySync', () => {
    test('removes existing directory', () => {
      const testDir = path.join(tempDir, 'to-remove');
      fs.mkdirSync(testDir);
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');

      expect(fs.existsSync(testDir)).toBe(true);
      removeDirectorySync(testDir);
      expect(fs.existsSync(testDir)).toBe(false);
    });

    test('handles non-existent directory gracefully', () => {
      const nonExistentDir = path.join(tempDir, 'non-existent');
      expect(() => removeDirectorySync(nonExistentDir)).not.toThrow();
    });
  });
});
