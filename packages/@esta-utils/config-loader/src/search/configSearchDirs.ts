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
 * XDG設定ディレクトリのリストを取得
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
 * ディレクトリリストから重複を除去
 */
const uniqDirs = (dirs: string[]): string[] =>
  dirs
    .filter((dir) => dir.length > 0)
    .reduce<string[]>((acc, dir) => acc.includes(dir) ? acc : [...acc, dir], []);

// --- main functions

/**
 * プロジェクト設定用のディレクトリリストを作成
 *
 * @param appConfig アプリケーション名
 * @returns プロジェクト設定ディレクトリリスト
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
 * システム設定用のディレクトリリストを作成
 *
 * @param appConfig アプリケーション名
 * @returns システム設定ディレクトリリスト
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
 * ユーザー設定用のディレクトリリストを作成
 *
 * @param appConfig アプリケーション名
 * @returns ユーザー設定ディレクトリリスト
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
 * 設定ファイル検索用ディレクトリリストを作成
 *
 * @param appConfig アプリケーション名
 * @param searchType 検索タイプ（PROJECT、USER、または SYSTEM）
 * @returns 重複除去された設定ディレクトリリスト
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
