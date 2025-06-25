// src: ./src/utils/__tests__/agE2EFileIoUtils.spec.ts
// @(#): AgE2E ファイルI/Oユーティリティテスト - ファイル操作機能のテスト
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
  fileExists,
  readFile,
  readFileTyped,
  writeExpectedResult,
  writeFile,
} from '../agE2eFileIoUtils';

describe('createDirectory', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-io-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('creates directory successfully', () => {
    const testDir = path.join(tempDir, 'test-directory');

    createDirectory(testDir);

    expect(fs.existsSync(testDir)).toBe(true);
    expect(fs.statSync(testDir).isDirectory()).toBe(true);
  });

  test('creates nested directories', () => {
    const nestedDir = path.join(tempDir, 'level1', 'level2', 'level3');

    createDirectory(nestedDir);

    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.statSync(nestedDir).isDirectory()).toBe(true);
  });

  test('handles existing directory gracefully', () => {
    const existingDir = path.join(tempDir, 'existing');
    fs.mkdirSync(existingDir);

    expect(() => createDirectory(existingDir)).not.toThrow();
    expect(fs.existsSync(existingDir)).toBe(true);
  });
});

describe('writeFile', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-io-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('writes string content to file', () => {
    const filePath = path.join(tempDir, 'test.txt');
    const content = 'Hello, World!';

    writeFile(filePath, content);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
  });

  test('writes object as JSON by default', () => {
    const filePath = path.join(tempDir, 'test.json');
    const content = { key: 'value', number: 42 };

    writeFile(filePath, content);

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toEqual(content);
  });

  test('writes object as JSON with json format', () => {
    const filePath = path.join(tempDir, 'test.json');
    const content = { test: true };

    writeFile(filePath, content, 'json');

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toEqual(content);
  });

  test('writes object as JSON with json format (unified)', () => {
    const filePath = path.join(tempDir, 'test.json');
    const content = { test: true };

    writeFile(filePath, content, 'json');

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toEqual(content);
  });

  test('writes object as JSON with yaml format', () => {
    const filePath = path.join(tempDir, 'test.yaml');
    const content = { test: true };

    writeFile(filePath, content, 'yaml');

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toEqual(content);
  });

  test('writes object as TypeScript export with typescript format', () => {
    const filePath = path.join(tempDir, 'test.ts');
    const content = { key: 'value' };

    writeFile(filePath, content, 'typescript');

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(writtenContent).toBe(`export default ${JSON.stringify(content, null, 2)};`);
  });

  test('writes string content as markdown format', () => {
    const filePath = path.join(tempDir, 'test.md');
    const content = '# Test Markdown\n\nThis is a test.';

    writeFile(filePath, content, 'markdown');

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(writtenContent).toBe(content);
  });

  test('writes string content as text format', () => {
    const filePath = path.join(tempDir, 'test.txt');
    const content = 'Plain text content';

    writeFile(filePath, content, 'text');

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(writtenContent).toBe(content);
  });
});

describe('readFile', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-io-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('reads file content as string', () => {
    const filePath = path.join(tempDir, 'test.txt');
    const content = 'Test file content';
    fs.writeFileSync(filePath, content, 'utf8');

    const result = readFile(filePath);

    expect(result).toBe(content);
  });

  test('throws error for non-existent file', () => {
    const nonExistentPath = path.join(tempDir, 'non-existent.txt');

    expect(() => readFile(nonExistentPath)).toThrow();
  });
});

describe('readFileTyped', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-io-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('reads supported file extensions successfully', () => {
    const supportedExtensions = ['json', 'yaml', 'ts', 'js', 'md', 'txt'];

    supportedExtensions.forEach((ext) => {
      const filePath = path.join(tempDir, `test.${ext}`);
      const content = `Test content for ${ext}`;
      fs.writeFileSync(filePath, content, 'utf8');

      const result = readFileTyped(filePath);
      expect(result).toBe(content);
    });
  });

  test('throws error for unsupported file extension', () => {
    const filePath = path.join(tempDir, 'test.unsupported');
    fs.writeFileSync(filePath, 'content', 'utf8');

    expect(() => readFileTyped(filePath)).toThrow('Unsupported file extension: unsupported');
  });

  test('throws error for file without extension', () => {
    const filePath = path.join(tempDir, 'test');
    fs.writeFileSync(filePath, 'content', 'utf8');

    expect(() => readFileTyped(filePath)).toThrow('Unsupported file extension: ');
  });
});

describe('fileExists', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-io-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

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
    const nonExistentPath = path.join(tempDir, 'non-existent.txt');

    expect(fileExists(nonExistentPath)).toBe(false);
  });
});

describe('writeExpectedResult', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-io-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('writes string result to file', () => {
    const filePath = path.join(tempDir, 'result.txt');
    const result = 'Test result';

    writeExpectedResult(result, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(result);
  });

  test('writes object result as JSON', () => {
    const filePath = path.join(tempDir, 'result.json');
    const result = { success: true, value: 42 };

    writeExpectedResult(result, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toEqual(result);
  });

  test('writes number result as JSON', () => {
    const filePath = path.join(tempDir, 'result.json');
    const result = 123;

    writeExpectedResult(result, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toBe(result);
  });

  test('writes boolean result as JSON', () => {
    const filePath = path.join(tempDir, 'result.json');
    const result = true;

    writeExpectedResult(result, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toBe(result);
  });

  test('writes null result as JSON', () => {
    const filePath = path.join(tempDir, 'result.json');
    const result = null;

    writeExpectedResult(result, filePath);

    expect(fs.existsSync(filePath)).toBe(true);
    const writtenContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(writtenContent)).toBe(result);
  });
});
