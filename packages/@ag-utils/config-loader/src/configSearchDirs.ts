// src: ./utils/configSearchDirs.ts
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
import { SearchConfigFileType } from '@shared/types/common.types';

import { getDelimiter } from '@ag-utils/common';

// ----------------
// private
// ----------------

/**
 * XDG設定ディレクトリを取得する内部関数
 */
const _getXdgDirs = (): string[] => {
  const delimiter = getDelimiter();
  const XDG_CONFIG_DIRS: string = process.env.XDG_CONFIG_DIRS + delimiter + '/etc/xdg';
  const xdgDirs = XDG_CONFIG_DIRS
    .split(getDelimiter())
    .map((dir) => dir.trim())
    .filter((dir) => (dir.length > 0) && (dir !== 'undefined'));
  return xdgDirs;
};

/**
 * システム設定ディレクトリを取得する内部関数
 */
const _configDirsSystem = (appConfig: string): string[] => {
  const dirs: string[] = [];
  const HOME = os.homedir();
  const XDG_HOME = process.env.XDG_CONFIG_HOME ?? `${HOME}/.config`;

  // add dirs
  dirs.push(XDG_HOME + '/' + appConfig);
  dirs.push(`${HOME}/.${appConfig}`);
  const xdgDirs = _getXdgDirs();
  xdgDirs.forEach((dir) => dirs.push(`${dir}/${appConfig}`));
  return dirs;
};

/**
 * ユーザー設定ディレクトリを取得する内部関数
 */
const _configDirsUser = (appConfig: string): string[] => {
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
 * ディレクトリ配列から重複を削除する内部関数
 */
const _uniqDirs = (dirs: string[]): string[] =>
  dirs
    .filter((dir) => dir.length > 0)
    .reduce<string[]>((acc, dir) => acc.includes(dir) ? acc : [...acc, dir], []);

// ----------------
// public
// ----------------

/**
 * 設定ファイル検索用ディレクトリリストを作成する
 */
export const configSearchDirs = (appConfig: string, configFileType: SearchConfigFileType): string[] => {
  const dirs: string[] = [];

  if (configFileType === SearchConfigFileType.SYSTEM) {
    dirs.push(..._configDirsSystem(appConfig));
  } else {
    dirs.push(..._configDirsUser(appConfig));
  }

  return _uniqDirs(dirs);
};
