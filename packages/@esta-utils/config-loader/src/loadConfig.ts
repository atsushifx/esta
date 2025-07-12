// src: ./loadConfig.ts
// @(#): 設定ファイル読み込みユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as fs from 'fs';
import { extname } from 'path';

// error handling
import { ExitError } from '@esta-core/error-handler';
import { ExitCode } from '@shared/constants';

// types
import { TSearchConfigFileType } from '../shared/types/searchFileType.types';

/**
 * loadConfig関数のオプション設定
 */
export type LoadConfigOptions = {
  /** 設定ファイルのベース名（拡張子なし）または複数のベース名の配列 */
  baseNames: string | readonly string[];
  /** アプリケーション名（検索ディレクトリの構築に使用、デフォルト: process.cwd()） */
  appName?: string;
  /** 検索タイプ（PROJECT、USER、または SYSTEM、デフォルト: USER） */
  searchType?: TSearchConfigFileType;
};

// modules
import { parseConfig } from './parseConfig';
import { findConfigFile } from './search/findConfigFile';

/**
 * エラーがファイル I/O エラーかどうかを判定します
 *
 * @param error 判定対象のエラー
 * @returns ファイル I/O エラーの場合は true
 *
 * @throws なし
 */
const isFileIOError = (error: Error): boolean => {
  const nodeError = error as NodeJS.ErrnoException;

  // Node.js のファイル I/O エラーコード
  const fileIOErrorCodes = [
    'ENOENT', // ファイルまたはディレクトリが存在しない
    'EACCES', // アクセス権限エラー
    'EPERM', // 操作が許可されていない
    'EISDIR', // ディレクトリに対する不正な操作
    'ENOTDIR', // ディレクトリではない
    'EMFILE', // ファイルハンドル上限
    'ENFILE', // システムファイルテーブル満杯
    'ENOSPC', // デバイス容量不足
    'EROFS', // 読み取り専用ファイルシステム
    'ELOOP', // シンボリックリンクのループ
    'ENAMETOOLONG', // ファイル名が長すぎる
  ];

  return nodeError.code !== undefined && fileIOErrorCodes.includes(nodeError.code);
};

/**
 * 設定ファイルを読み込み、解析して設定オブジェクトを返します
 *
 * @template T 設定オブジェクトの型
 * @param options 設定オプション
 * @returns 解析された設定オブジェクト、設定ファイルが見つからない場合はnull
 *
 * @throws {ExitError} ファイル I/O エラーが発生した場合（エラーコード: FILE_IO_ERROR）
 * @throws {ExitError} 設定ファイルの解析に失敗した場合（エラーコード: CONFIG_ERROR）
 * @throws {ExitError} 不明なエラーが発生した場合（エラーコード: UNKNOWN_ERROR）
 *
 * @example
 * ```typescript
 * // オブジェクト形式（推奨）
 * const config1 = await loadConfig({
 *   baseNames: 'myapp',
 *   appName: 'myapp',
 *   searchType: TSearchConfigFileType.USER
 * });
 *
 * // 複数の設定ファイルから検索（優先順位順）
 * const config2 = await loadConfig({
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
  const actualOptions: Required<LoadConfigOptions> = {
    baseNames: options.baseNames,
    appName: options.appName ?? process.cwd(),
    searchType: options.searchType ?? TSearchConfigFileType.USER,
  };

  const baseNameArray = Array.isArray(actualOptions.baseNames) ? actualOptions.baseNames : [actualOptions.baseNames];
  const configFilePath = findConfigFile(baseNameArray, actualOptions.appName, actualOptions.searchType);

  if (configFilePath === null) {
    return null;
  }

  try {
    const rawContent = fs.readFileSync(configFilePath, 'utf-8');
    const extension = extname(configFilePath);

    return await parseConfig<T>(extension, rawContent);
  } catch (error) {
    if (error instanceof Error) {
      // ファイル I/O エラーの検出
      if (isFileIOError(error)) {
        throw new ExitError(
          ExitCode.FILE_IO_ERROR,
          `File I/O error accessing config file '${configFilePath}': ${error.message}`,
        );
      }
      // その他のエラーは設定エラーとして扱う
      throw new ExitError(ExitCode.CONFIG_ERROR, `Failed to parse config file '${configFilePath}': ${error.message}`);
    }
    // 不明なエラー
    throw new ExitError(ExitCode.UNKNOWN_ERROR, `Unknown error occurred while loading config file '${configFilePath}'`);
  }
};

export default loadConfig;
