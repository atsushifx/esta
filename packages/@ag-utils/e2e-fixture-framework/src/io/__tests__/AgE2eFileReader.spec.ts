// src/io/AgE2eFileReader.test.ts
// AgE2eFileReader ユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// vitest
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

// test target
import { AgE2eFileReader } from '../AgE2eFileReader';

// fsモジュールをモック
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

const mockedReadFileSync = readFileSync as Mock;
const mockedReaddirSync = readdirSync as Mock;

describe('AgE2eFileReader', () => {
  const fileReader = new AgE2eFileReader();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readInputFile', () => {
    it('should read markdown input file correctly', () => {
      // Arrange
      mockedReaddirSync.mockReturnValue(['input.md', 'output.json']);
      mockedReadFileSync.mockReturnValue('# Test Markdown');

      // Act
      const result = fileReader.readInputFile('/test/path');

      // Assert
      expect(result).toEqual({
        content: '# Test Markdown',
        extension: 'md',
      });
      expect(mockedReaddirSync).toHaveBeenCalledWith('/test/path');
      expect(mockedReadFileSync).toHaveBeenCalledWith(join('/test/path', 'input.md'), 'utf8');
    });

    it('should read text input file correctly', () => {
      // Arrange
      mockedReaddirSync.mockReturnValue(['input.txt', 'output.json']);
      mockedReadFileSync.mockReturnValue('Test content');

      // Act
      const result = fileReader.readInputFile('/test/path');

      // Assert
      expect(result).toEqual({
        content: 'Test content',
        extension: 'txt',
      });
    });

    it('should throw error when no input file found', () => {
      // Arrange
      mockedReaddirSync.mockReturnValue(['output.json']);

      // Act & Assert
      expect(() => fileReader.readInputFile('/test/path')).toThrow(
        'No input file found',
      );
    });

    it('should handle file without extension', () => {
      // Arrange
      mockedReaddirSync.mockReturnValue(['input.', 'output.json']);
      mockedReadFileSync.mockReturnValue('content');

      // Act
      const result = fileReader.readInputFile('/test/path');

      // Assert
      expect(result.extension).toBe('');
    });
  });

  describe('readExpectedConfig', () => {
    it('should read and parse JSON config correctly', () => {
      // Arrange
      const config = { type: 'plaintext', expected: 'test result' };
      mockedReadFileSync.mockReturnValue(JSON.stringify(config));

      // Act
      const result = fileReader.readExpectedConfig('/test/path');

      // Assert
      expect(result).toEqual(config);
      expect(mockedReadFileSync).toHaveBeenCalledWith(join('/test/path', 'output.json'), 'utf8');
    });

    it('should handle complex markdown config', () => {
      // Arrange
      const config = {
        type: 'markdown',
        expected: {
          children: [{ type: 'heading', depth: 1 }],
          properties: { hasHeading: true },
        },
      };
      mockedReadFileSync.mockReturnValue(JSON.stringify(config));

      // Act
      const result = fileReader.readExpectedConfig('/test/path');

      // Assert
      expect(result).toEqual(config);
    });
  });
});
