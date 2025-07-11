// shared/constants/shell.ts
// @(#) : プラットフォーム->シェル+オプション対応マップ
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PLATFORM_TYPE } from '@esta-utils/get-platform';

/**
 * シェルコマンドとオプションの設定
 */
export type IShellConfig = {
  /** シェルコマンド名 */
  shell: string;
  /** シェルオプション */
  option: string;
};

/**
 * プラットフォーム別のシェル設定マップ
 */
export const PLATFORM_SHELL_MAP: Record<PLATFORM_TYPE, IShellConfig> = {
  [PLATFORM_TYPE.WINDOWS]: {
    shell: 'cmd',
    option: '/c',
  },
  [PLATFORM_TYPE.LINUX]: {
    shell: 'sh',
    option: '-c',
  },
  [PLATFORM_TYPE.MACOS]: {
    shell: 'sh',
    option: '-c',
  },
  [PLATFORM_TYPE.UNKNOWN]: {
    shell: 'sh',
    option: '-c',
  },
};
