// src: ./src/utils/__tests__/fileOperations.async.spec.ts
// @(#): 非同期ファイル操作テスト - async/await版ファイルI/Oユーティリティのテスト
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
import { readFile, readFileTyped, removeDirectory, writeFile } from '../agE2eFileIoUtils';

describe('Async File Operations', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'async-file-ops-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('writeFile (async)', () => {
    test('writes string content to file', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      const content = 'Hello, Async World!';

      await writeFile(filePath, content);

      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    });

    test('writes object as JSON by default', async () => {
      const filePath = path.join(tempDir, 'test.json');
      const content = { key: 'value', number: 42 };

      await writeFile(filePath, content);

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object as JSON with json format', async () => {
      const filePath = path.join(tempDir, 'test.json');
      const content = { test: true, async: true };

      await writeFile(filePath, content, 'json');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object as TypeScript export with typescript format', async () => {
      const filePath = path.join(tempDir, 'config.ts');
      const content = { name: 'async-config', version: '1.0.0' };

      await writeFile(filePath, content, 'typescript');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(writtenContent).toBe(`export default ${JSON.stringify(content, null, 2)};`);
    });

    test('writes object with yaml format (currently outputs JSON)', async () => {
      const filePath = path.join(tempDir, 'test.yaml');
      const content = { async: true, format: 'yaml' };

      await writeFile(filePath, content, 'yaml');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object with markdown format', async () => {
      const filePath = path.join(tempDir, 'content.md');
      const content = { title: 'Async Markdown', body: 'Some async content' };

      await writeFile(filePath, content, 'markdown');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('writes object with text format', async () => {
      const filePath = path.join(tempDir, 'data.txt');
      const content = { message: 'Async text content' };

      await writeFile(filePath, content, 'text');

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(JSON.parse(writtenContent)).toEqual(content);
    });

    test('creates parent directories if they do not exist', async () => {
      const nestedPath = path.join(tempDir, 'nested', 'deep', 'file.txt');
      const content = 'Content in nested directory';

      await writeFile(nestedPath, content);

      expect(fs.existsSync(nestedPath)).toBe(true);
      expect(fs.readFileSync(nestedPath, 'utf8')).toBe(content);
    });
  });

  describe('readFile (async)', () => {
    test('reads file content as string', async () => {
      const filePath = path.join(tempDir, 'read-test.txt');
      const content = 'Async test file content';
      fs.writeFileSync(filePath, content);

      const result = await readFile(filePath);

      expect(result).toBe(content);
    });

    test('reads JSON file content', async () => {
      const filePath = path.join(tempDir, 'data.json');
      const content = { async: true, data: [1, 2, 3] };
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

      const result = await readFile(filePath);
      const parsedResult = JSON.parse(result);

      expect(parsedResult).toEqual(content);
    });

    test('throws error for non-existent file', async () => {
      const filePath = path.join(tempDir, 'non-existent.txt');

      await expect(readFile(filePath)).rejects.toThrow();
    });

    test('throws error for directory instead of file', async () => {
      const dirPath = path.join(tempDir, 'directory');
      fs.mkdirSync(dirPath);

      await expect(readFile(dirPath)).rejects.toThrow();
    });
  });

  describe('readFileTyped (async)', () => {
    test('reads supported file extensions successfully', async () => {
      const extensions = ['json', 'jsonc', 'yaml', 'ts', 'js', 'md', 'txt'];

      for (const ext of extensions) {
        const filePath = path.join(tempDir, `test.${ext}`);
        const content = `test content for ${ext}`;
        fs.writeFileSync(filePath, content);

        const result = await readFileTyped(filePath);
        expect(result).toBe(content);
      }
    });

    test('throws error for unsupported file extension', async () => {
      const filePath = path.join(tempDir, 'test.unsupported');
      fs.writeFileSync(filePath, 'content');

      await expect(readFileTyped(filePath)).rejects.toThrow('Unsupported file extension');
    });

    test('throws error for file without extension', async () => {
      const filePath = path.join(tempDir, 'no-extension');
      fs.writeFileSync(filePath, 'content');

      await expect(readFileTyped(filePath)).rejects.toThrow('Unsupported file extension');
    });

    test('throws error for non-existent file', async () => {
      const filePath = path.join(tempDir, 'non-existent.json');

      await expect(readFileTyped(filePath)).rejects.toThrow();
    });
  });

  describe('integration tests', () => {
    test('write then read same content', async () => {
      const filePath = path.join(tempDir, 'roundtrip.txt');
      const originalContent = 'Round trip test content';

      await writeFile(filePath, originalContent);
      const readContent = await readFile(filePath);

      expect(readContent).toBe(originalContent);
    });

    test('write object then read and parse', async () => {
      const filePath = path.join(tempDir, 'roundtrip.json');
      const originalContent = {
        async: true,
        test: 'integration',
        data: { nested: true, values: [1, 2, 3] },
      };

      await writeFile(filePath, originalContent, 'json');
      const readContent = await readFile(filePath);
      const parsedContent = JSON.parse(readContent);

      expect(parsedContent).toEqual(originalContent);
    });
  });

  describe('removeDirectory (async)', () => {
    test('removes existing directory', async () => {
      const testDir = path.join(tempDir, 'to-remove');
      fs.mkdirSync(testDir);
      fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');

      expect(fs.existsSync(testDir)).toBe(true);
      await removeDirectory(testDir);
      expect(fs.existsSync(testDir)).toBe(false);
    });

    test('handles non-existent directory gracefully', async () => {
      const nonExistentDir = path.join(tempDir, 'non-existent');
      await expect(removeDirectory(nonExistentDir)).resolves.not.toThrow();
    });
  });
});
