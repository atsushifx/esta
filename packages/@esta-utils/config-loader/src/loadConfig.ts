// src: ./loadConfig.ts
// @(#): 設定ファイル読み込みユーチE��リチE��
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as fs from 'fs';
import { extname } from 'path';

// error handling
import { errorExit } from '@esta-core/error-handler';
import { EXIT_CODE } from '@shared/constants';

// types
import { TSearchConfigFileType } from '../shared/types/searchFileType.types';

/**
 * loadConfig関数のオプション設宁E */
export type LoadConfigOptions = {
  /** 設定ファイルのベース名 (拡張子なし) またはベース名一覧 */
  baseNames: string | readonly string[];
  /** アプリケーション名（検索ディレクトリの構築に使用、デフォルト: process.cwd() */
  appName?: string;
  /** 検索タイプ PROJECT、USER、または SYSTEM、デフォルト: USER */
  searchType?: TSearchConfigFileType;
  /** 検索ベースディレクトリを指定された場合、このディレクトリから検索を開始 */
  baseDirectory?: string;
};

// modules
import { parseConfig } from './parseConfig';
import { findConfigFile } from './search/findConfigFile';

/**
 * エラーがファイル I/O エラーかどぁE��を判定しまぁE *
 * @param error 判定対象のエラー
 * @returns ファイル I/O エラーの場合�E true
 *
 * @throws なぁE */
const isFileIOError = (error: Error): boolean => {
  const nodeError = error as NodeJS.ErrnoException;

  // Node.js のファイル I/O エラーコード
  const fileIOErrorCodes = [
    'ENOENT', // ファイルまたはディレクトリが存在しない
    'EACCES', // アクセス権限エラー
    'EPERM', // 操作が許可されていない
    'EISDIR', // ディレクトリに対する不正な走査
    'ENOTDIR', // チェック対象がディレクトリではない
    'EMFILE', // ファイルハンドル上限
    'ENFILE', // システムファイル数上限
    'ENOSPC', // ディスク容量不足
    'EROFS', // 読み取り専用ファイル
    'ELOOP', // シンボリックリンクのループ
    'ENAMETOOLONG', // ファイル名が長すぎる
  ];

  return nodeError.code !== undefined && fileIOErrorCodes.includes(nodeError.code);
};

/**
 * 設定ファイルを読み込み、解析して設定オブジェクトを返しまぁE *
 * @template T 設定オブジェクト�E垁E
 * @param options 設定オプション
 * @returns 解析された設定オブジェクト、設定ファイルが見つからない場合 null
 *
 * @throws {ExitError} ファイル I/O エラーが発生した場合（エラーコード EXIT_CODE.FILE_IO_ERROR)
 * @throws {ExitError} 設定ファイルが見つからない場合（エラーコード EXIT_CODE.CONFIG_FILE_NOT_FOUND)
 * @throws {ExitError} 設定ファイルの解析に失敗した場合（エラーコード EXIT_CODE.CONFIG_PARSE_ERROR)
 * @throws {ExitError} 設定ファイルの解析に失敗した場合（エラーコード EXIT_CODE.CONFIG_ERROR)
 * @throws {ExitError} 不明なエラーが発生した場合（エラーコード EXIT_CODE.UNKNOWN_ERROR)
 *
 * @example
 * ```typescript
 *  // オブジェクト形式（推奨
 * const config1 = await loadConfig({})
 *   baseNames: 'myapp',
 *   appName: 'myapp',
 *   searchType: TSearchConfigFileType.USER
 * });
 *
 * // 優先された設定ファイルから検索
 *  const config2 = await loadConfig({
 *   baseNames: ['estarc', 'esta.config'],
 *   appName: 'myapp'
 * });
 *
 * // 型安全な設定読み込み
 * interface AppConfig {
 *   name: string;
 *   version: string;
 * }
 * const typedConfig = await loadConfig<AppConfig>({
 *   baseNames: 'myapp',
 *   appName: 'myapp'
 * });
 *
 * ```
 */
export const loadConfig = async <T = object>(options: LoadConfigOptions): Promise<T | null> => {
  const actualOptions: Required<Omit<LoadConfigOptions, 'baseDirectory'>> & { baseDirectory?: string } = {
    baseNames: options.baseNames,
    appName: options.appName ?? process.cwd(),
    searchType: options.searchType ?? TSearchConfigFileType.USER,
    baseDirectory: options.baseDirectory,
  };

  const baseNameArray = Array.isArray(actualOptions.baseNames) ? actualOptions.baseNames : [actualOptions.baseNames];

  // baseDirectoryが指定された場合�E、それを使用して検索
  const configFilePath = findConfigFile(
    baseNameArray,
    actualOptions.appName,
    actualOptions.searchType,
    actualOptions.baseDirectory,
  );

  if (configFilePath === null) {
    return null;
  }

  try {
    const rawContent = fs.readFileSync(configFilePath, 'utf-8');
    const extension = extname(configFilePath);

    return await parseConfig<T>(extension, rawContent);
  } catch (error) {
    if (error instanceof Error) {
      // ファイル I/O エラーの検�E
      if (isFileIOError(error)) {
        errorExit(
          EXIT_CODE.FILE_IO_ERROR,
          `File I/O error accessing config file '${configFilePath}': ${error.message}`,
        );
      }
      // そ�E他�Eエラーは設定エラーとして扱ぁE      errorExit(EXIT_CODE.CONFIG_ERROR, `Failed to parse config file '${configFilePath}': ${error.message}`);
    }
    // 不�Eなエラー
    errorExit(EXIT_CODE.UNKNOWN_ERROR, `Unknown error occurred while loading config file '${configFilePath}'`);
  }
};

export default loadConfig;
