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
import { ConfigType } from '@shared/types';

import { getDelimiter } from '@ag-utils/common';
// --- types

// functions
export const configSearchDirs = (appConfig: string, configType: ConfigType): string[] => {
  const dirs: string[] = [];

  const configDirsSystem = (appConfig: string): string[] => {
    const dirs: string[] = [];
    const HOME = os.homedir();
    const XDG_HOME = process.env.XDG_CONFIG_HOME ?? `${HOME}/.config`;

    // search XDG_CONFIG_DIRS
    const getXdgDirs = () => {
      const delimiter = getDelimiter();
      const XDG_CONFIG_DIRS: string = process.env.XDG_CONFIG_DIRS + delimiter + '/etc/xdg';
      const xdgDirs = XDG_CONFIG_DIRS
        .split(getDelimiter())
        .map((dir) => dir.trim())
        .filter((dir) => (dir.length > 0) && (dir !== 'undefined'));
      return xdgDirs;
    };

    // add dirs
    dirs.push(XDG_HOME + '/' + appConfig);
    dirs.push(`${HOME}/.${appConfig}`);
    const xdgDirs = getXdgDirs();
    xdgDirs.forEach((dir) => dirs.push(`${dir}/${appConfig}`));
    return dirs;
  };
  const configDirsUser = (appConfig: string): string[] => {
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

  if (configType === ConfigType.SYSTEM) {
    dirs.push(...configDirsSystem(appConfig));
  } else {
    dirs.push(...configDirsUser(appConfig));
  }

  // dir to uniq
  const uniqDirs = (dirs: string[]): string[] =>
    dirs
      .filter((dir) => dir.length > 0)
      .reduce<string[]>((acc, dir) => acc.includes(dir) ? acc : [...acc, dir], []);

  return uniqDirs(dirs);
};
