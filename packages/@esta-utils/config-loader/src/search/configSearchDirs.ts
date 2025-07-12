// src: ./configSearchDirs.ts
// @(#) : 設定ファイル検索用ディレクトリリスト作成
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- libs
import * as os from 'os';
import process from 'process';

// --- internal libs
import { TSearchConfigFileType } from '../../shared/types/searchFileType.types';

import { getDelimiter } from '@esta-utils/get-platform';

// --- helper functions

/**
 * XDG Base Directory仕様に基づく設定ディレクトリのリストを取得します
 *
 * @returns XDG_CONFIG_DIRS環境変数から取得したディレクトリリスト
 *
 * @description
 * - XDG_CONFIG_DIRS環境変数が設定されている場合はそれを使用
 * - 未設定の場合は `/etc/xdg` をデフォルトとして使用
 * - 空文字列や'undefined'文字列は除外
 */
const getXdgConfigDirs = (): string[] => {
  const delimiter = getDelimiter();
  const XDG_CONFIG_DIRS: string = process.env.XDG_CONFIG_DIRS + delimiter + '/etc/xdg';
  const xdgDirs = XDG_CONFIG_DIRS
    .split(getDelimiter())
    .map((dir) => dir.trim())
    .filter((dir) => (dir.length > 0) && (dir !== 'undefined'));
  return xdgDirs;
};

/**
 * ディレクトリリストから重複を除去し、有効なディレクトリのみを返します
 *
 * @param dirs 重複が含まれる可能性のあるディレクトリリスト
 * @returns 重複除去された有効なディレクトリリスト
 *
 * @description
 * - 空文字列は除外
 * - 同一パスの重複を除去
 * - 元の順序を保持
 */
const uniqDirs = (dirs: string[]): string[] =>
  dirs
    .filter((dir) => dir.length > 0)
    .reduce<string[]>((acc, dir) => acc.includes(dir) ? acc : [...acc, dir], []);

// --- main functions

/**
 * プロジェクト設定用のディレクトリリストを作成します
 *
 * @param appConfig アプリケーション名
 * @returns プロジェクト設定ディレクトリリスト
 *
 * @description
 * プロジェクトローカルな設定ファイルを検索するディレクトリリストを作成します：
 * - `.` - カレントディレクトリ
 * - `./.{appConfig}` - アプリ専用ディレクトリ
 * - `./.config` - 汎用設定ディレクトリ
 * - `./.config/{appConfig}` - .config内のアプリ専用ディレクトリ
 */
const createProjectConfigDirs = (appConfig: string): string[] => {
  const dirs: string[] = [];

  // add dirs
  dirs.push('.');
  dirs.push(`./.${appConfig}`);
  dirs.push('./.config');
  dirs.push(`./.config/${appConfig}`);

  return dirs;
};

/**
 * システム設定用のディレクトリリストを作成します
 *
 * @param appConfig アプリケーション名
 * @returns システム設定ディレクトリリスト
 *
 * @description
 * システム全体の設定ファイルを検索するディレクトリリストを作成します：
 * - XDG_CONFIG_HOME/{appConfig} - XDG設定ディレクトリ
 * - ~/.{appConfig} - ホームディレクトリの隠しディレクトリ
 * - XDG_CONFIG_DIRS内の各ディレクトリ/{appConfig}
 */
const createSystemConfigDirs = (appConfig: string): string[] => {
  const dirs: string[] = [];
  const HOME = os.homedir();
  const XDG_HOME = process.env.XDG_CONFIG_HOME ?? `${HOME}/.config`;

  // add dirs
  dirs.push(XDG_HOME + '/' + appConfig);
  dirs.push(`${HOME}/.${appConfig}`);
  const xdgDirs = getXdgConfigDirs();
  xdgDirs.forEach((dir) => dirs.push(`${dir}/${appConfig}`));

  return dirs;
};

/**
 * ユーザー設定用のディレクトリリストを作成します
 *
 * @param appConfig アプリケーション名
 * @returns ユーザー設定ディレクトリリスト
 *
 * @description
 * ユーザー固有の設定ファイルを検索するディレクトリリストを作成します：
 * - XDG_CONFIG_HOME/{appConfig} - XDG設定ディレクトリ
 * - ~/configs/{appConfig} - 汎用設定ディレクトリ
 * - ~/.configs/{appConfig} - 隠し設定ディレクトリ
 * - ~/.{appConfig} - 伝統的な隠しディレクトリ
 */
const createUserConfigDirs = (appConfig: string): string[] => {
  const dirs: string[] = [];
  const HOME = os.homedir();
  const XDG_HOME = process.env.XDG_CONFIG_HOME ?? `${HOME}/.config`;

  // add dirs
  dirs.push(XDG_HOME + '/' + appConfig);
  dirs.push(`${HOME}/configs/${appConfig}`);
  dirs.push(`${HOME}/.configs/${appConfig}`);
  dirs.push(`${HOME}/.${appConfig}`);

  return dirs;
};

/**
 * 設定ファイル検索用ディレクトリリストを作成します
 *
 * @param appConfig アプリケーション名
 * @param searchType 検索タイプ（PROJECT、USER、または SYSTEM）
 * @returns 重複除去された設定ディレクトリリスト
 *
 * @description
 * 指定された検索タイプに応じて適切なディレクトリリストを作成します：
 * - PROJECT: プロジェクトローカルな設定ファイル用
 * - USER: ユーザー固有の設定ファイル用（デフォルト）
 * - SYSTEM: システム全体の設定ファイル用
 *
 * @example
 * ```typescript
 * // ユーザー設定ディレクトリを取得
 * const userDirs = configSearchDirs('myapp', TSearchConfigFileType.USER);
 * // -> ['~/.config/myapp', '~/configs/myapp', '~/.configs/myapp', '~/.myapp']
 *
 * // プロジェクト設定ディレクトリを取得
 * const projectDirs = configSearchDirs('myapp', TSearchConfigFileType.PROJECT);
 * // -> ['.', './.myapp', './.config', './.config/myapp']
 * ```
 */
export const configSearchDirs = (appConfig: string, searchType: TSearchConfigFileType): string[] => {
  let dirs: string[] = [];

  switch (searchType) {
    case TSearchConfigFileType.PROJECT:
      dirs = createProjectConfigDirs(appConfig);
      break;
    case TSearchConfigFileType.SYSTEM:
      dirs = createSystemConfigDirs(appConfig);
      break;
    case TSearchConfigFileType.USER:
    default:
      dirs = createUserConfigDirs(appConfig);
      break;
  }

  return uniqDirs(dirs);
};

export default configSearchDirs;
