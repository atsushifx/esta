// src: ./__tests__/loadConfig.illegal_config.spec.ts
// loadConfig エラーハンドリングのE2Eテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as fs from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EXIT_CODE } from '@shared/constants';

import { TSearchConfigFileType } from '../../shared/types/searchFileType.types';
import { loadConfig } from '../loadConfig';

// fs.readFileSyncをMock
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

// findConfigFileをMock
vi.mock('../search/findConfigFile', () => ({
  findConfigFile: vi.fn(),
}));

const mockReadFileSync = vi.mocked(fs.readFileSync);
const { findConfigFile } = await import('../search/findConfigFile');
const mockFindConfigFile = vi.mocked(findConfigFile);

/**
 * loadConfig関数のエラーハンドリングユニットテスト
 *
 * @module loadConfig.illegal_config.spec
 */
describe('loadConfig - エラーハンドリング', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @description ファイル I/O エラーのハンドリングテスト
   * ファイルシステム関連のエラー（ENOENT、EACCESなど）が
   * FILE_IO_ERRORとして適切に処理されることを検証します。
   */
  describe('ファイル I/O エラー', () => {
    it('ファイルが存在しない場合にFILE_IO_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.json';
      mockFindConfigFile.mockReturnValue(testPath);

      const fileError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
      fileError.code = 'ENOENT';
      mockReadFileSync.mockImplementation(() => {
        throw fileError;
      });

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.FILE_IO_ERROR,
          message: expect.stringContaining('File I/O error accessing config file'),
        }),
      );
    });

    it('アクセス権限エラーの場合にFILE_IO_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.json';
      mockFindConfigFile.mockReturnValue(testPath);

      const accessError = new Error('EACCES: permission denied') as NodeJS.ErrnoException;
      accessError.code = 'EACCES';
      mockReadFileSync.mockImplementation(() => {
        throw accessError;
      });

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.FILE_IO_ERROR,
          message: expect.stringContaining('File I/O error accessing config file'),
        }),
      );
    });

    it('その他ファイルI/Oエラーの場合にFILE_IO_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.json';
      mockFindConfigFile.mockReturnValue(testPath);

      const ioErrors = ['EPERM', 'EISDIR', 'ENOTDIR', 'EMFILE', 'ENFILE', 'ENOSPC', 'EROFS', 'ELOOP', 'ENAMETOOLONG'];

      for (const errorCode of ioErrors) {
        const ioError = new Error(`${errorCode}: I/O error`) as NodeJS.ErrnoException;
        ioError.code = errorCode;
        mockReadFileSync.mockImplementation(() => {
          throw ioError;
        });

        await expect(
          loadConfig({
            baseNames: 'test',
            searchType: TSearchConfigFileType.PROJECT,
          }),
        ).rejects.toThrow(
          expect.objectContaining({
            code: EXIT_CODE.FILE_IO_ERROR,
          }),
        );
      }
    });
  });

  /**
   * @description 設定ファイルパースエラーのハンドリングテスト
   * 不正なJSON、YAML、TypeScriptスクリプトなどの解析エラーが
   * CONFIG_ERRORとして適切に処理されることを検証します。
   */
  describe('設定パースエラー', () => {
    it('不正なJSONの場合にCONFIG_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.json';
      mockFindConfigFile.mockReturnValue(testPath);
      mockReadFileSync.mockReturnValue('{ invalid json }');

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.CONFIG_ERROR,
          message: expect.stringContaining('Failed to parse config file'),
        }),
      );
    });

    it('不正なYAMLの場合にCONFIG_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.yaml';
      mockFindConfigFile.mockReturnValue(testPath);
      mockReadFileSync.mockReturnValue('invalid: [\n  - invalid\n  yaml: structure\n}');

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.CONFIG_ERROR,
          message: expect.stringContaining('Failed to parse config file'),
        }),
      );
    });

    it('不正なTypeScriptスクリプトの場合にCONFIG_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.ts';
      mockFindConfigFile.mockReturnValue(testPath);
      mockReadFileSync.mockReturnValue('export default { syntax error }');

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.CONFIG_ERROR,
          message: expect.stringContaining('Failed to parse config file'),
        }),
      );
    });

    it('サポートされていないスクリプト形式の場合にCONFIG_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.js';
      mockFindConfigFile.mockReturnValue(testPath);
      mockReadFileSync.mockReturnValue('module.exports = { unsupported: "format" }');

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.CONFIG_ERROR,
          message: expect.stringContaining('Failed to parse config file'),
        }),
      );
    });
  });

  /**
   * @description 不正なエラーのハンドリングテスト
   * Errorオブジェクトではない外や予期しないエラーが
   * UNKNOWN_ERRORとして適切に処理されることを検証します。
   */
  describe('不正なエラー', () => {
    it('予期しないエラーの場合にUNKNOWN_ERRORをthrowすべき', async () => {
      const testPath = '/test/config.json';
      mockFindConfigFile.mockReturnValue(testPath);
      mockReadFileSync.mockImplementation(() => {
        throw 'string error'; // Error オブジェクトではない
      });

      await expect(
        loadConfig({
          baseNames: 'test',
          searchType: TSearchConfigFileType.PROJECT,
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: EXIT_CODE.UNKNOWN_ERROR,
          message: expect.stringContaining('Unknown error occurred'),
        }),
      );
    });
  });

  /**
   * @description 設定ファイルが見つからない場合の動作テスト
   * 設定ファイルが存在しない場合に、エラーを投げずに
   * nullを返す正常な動作を検証します。
   */
  describe('設定ファイルが見つからない場合', () => {
    it('設定ファイルが見つからない場合はnullを返すべき', async () => {
      mockFindConfigFile.mockReturnValue(null);

      const result = await loadConfig({
        baseNames: 'nonexistent',
        searchType: TSearchConfigFileType.PROJECT,
      });

      expect(result).toBeNull();
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });
  });
});
