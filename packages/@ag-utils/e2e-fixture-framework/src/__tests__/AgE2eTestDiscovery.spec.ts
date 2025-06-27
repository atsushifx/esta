// src/AgE2eTestDiscovery.spec.ts
// AgE2eTestDiscovery ユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// vitest
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

// test target
import { AgE2eScanCategorizedTests, AgE2eScanFlatTests } from '../AgE2eTestDiscovery';

// fsモジュールをモック
vi.mock('node:fs', () => ({
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}));

const mockedReaddirSync = readdirSync as Mock;
const mockedStatSync = statSync as Mock;

describe('AgE2eTestDiscovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Flat Tests (1-level structure)', () => {
    describe('AgE2eScanFlatTests', () => {
      it('should scan flat test structure correctly', () => {
        // Arrange
        mockedReaddirSync.mockReturnValueOnce(['basic-test', 'complex-test', '#disabled-test'])
          .mockReturnValueOnce(['input.txt', 'output.json'])
          .mockReturnValueOnce(['input.md', 'output.json']);

        const mockStat = { isDirectory: vi.fn(() => true) };
        mockedStatSync.mockReturnValue(mockStat);

        // Act
        const result = AgE2eScanFlatTests('/fixtures');

        // Assert
        expect(result).toEqual([
          {
            type: 'basic-test',
            name: 'basic-test',
            path: join('/fixtures', 'basic-test'),
          },
          {
            type: 'complex-test',
            name: 'complex-test',
            path: join('/fixtures', 'complex-test'),
          },
        ]);
      });

      it('should skip commented out test directories', () => {
        // Arrange
        mockedReaddirSync.mockReturnValueOnce(['#disabled-test', 'valid-test'])
          .mockReturnValueOnce(['input.txt', 'output.json']);

        const mockStat = { isDirectory: vi.fn(() => true) };
        mockedStatSync.mockReturnValue(mockStat);

        // Act
        const result = AgE2eScanFlatTests('/fixtures');

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('valid-test');
      });

      it('should skip directories without required files', () => {
        // Arrange
        mockedReaddirSync.mockReturnValueOnce(['incomplete-test'])
          .mockReturnValueOnce(['input.txt']); // missing output.json

        const mockStat = { isDirectory: vi.fn(() => true) };
        mockedStatSync.mockReturnValue(mockStat);

        // Act
        const result = AgE2eScanFlatTests('/fixtures');

        // Assert
        expect(result).toHaveLength(0);
      });

      it('should handle directory read errors gracefully', () => {
        // Arrange
        mockedReaddirSync.mockImplementation(() => {
          throw new Error('Directory not found');
        });

        // Act
        const result = AgE2eScanFlatTests('/nonexistent');

        // Assert
        expect(result).toEqual([]);
      });
    });
  });

  describe('Categorized Tests (2-level structure)', () => {
    describe('AgE2eScanCategorizedTests', () => {
      it('should scan categorized test structure correctly', () => {
        // Arrange
        mockedReaddirSync.mockReturnValueOnce(['plaintext', 'markdown', '#disabled-category'])
          .mockReturnValueOnce(['basic', 'complex']) // plaintext category
          .mockReturnValueOnce(['input.txt', 'output.json']) // basic test
          .mockReturnValueOnce(['input.txt', 'output.json']) // complex test
          .mockReturnValueOnce(['heading']) // markdown category
          .mockReturnValueOnce(['input.md', 'output.json']); // heading test

        const mockStat = { isDirectory: vi.fn(() => true) };
        mockedStatSync.mockReturnValue(mockStat);

        // Act
        const result = AgE2eScanCategorizedTests('/fixtures');

        // Assert
        expect(result).toEqual([
          {
            type: 'plaintext',
            name: 'plaintext/basic',
            path: join('/fixtures/plaintext', 'basic'),
          },
          {
            type: 'plaintext',
            name: 'plaintext/complex',
            path: join('/fixtures/plaintext', 'complex'),
          },
          {
            type: 'markdown',
            name: 'markdown/heading',
            path: join('/fixtures/markdown', 'heading'),
          },
        ]);
      });

      it('should skip commented out categories and test cases', () => {
        // Arrange
        mockedReaddirSync.mockReturnValueOnce(['plaintext', '#disabled-category'])
          .mockReturnValueOnce(['valid-test', '#disabled-test'])
          .mockReturnValueOnce(['input.txt', 'output.json']);

        const mockStat = { isDirectory: vi.fn(() => true) };
        mockedStatSync.mockReturnValue(mockStat);

        // Act
        const result = AgE2eScanCategorizedTests('/fixtures');

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'plaintext',
          name: 'plaintext/valid-test',
          path: join('/fixtures/plaintext', 'valid-test'),
        });
      });

      it('should handle empty categories gracefully', () => {
        // Arrange
        mockedReaddirSync.mockReturnValueOnce(['empty-category'])
          .mockReturnValueOnce([]); // no test cases in category

        const mockStat = { isDirectory: vi.fn(() => true) };
        mockedStatSync.mockReturnValue(mockStat);

        // Act
        const result = AgE2eScanCategorizedTests('/fixtures');

        // Assert
        expect(result).toHaveLength(0);
      });

      it('should handle directory read errors gracefully', () => {
        // Arrange
        mockedReaddirSync.mockImplementation(() => {
          throw new Error('Directory not found');
        });

        // Act
        const result = AgE2eScanCategorizedTests('/nonexistent');

        // Assert
        expect(result).toEqual([]);
      });
    });
  });
});
