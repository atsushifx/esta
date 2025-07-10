// shared/constants/platform.ts
// @(#) : プラットフォーム関連の定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Node.js os.platform()の値とPLATFORM_TYPEのマッピング
 */
export const PLATFORM_MAP = {
  win32: 'windows',
  linux: 'linux',
  darwin: 'macos',
} as const;

/**
 * プラットフォーム固有のPATH区切り文字
 */
export const PATH_DELIMITER = {
  WINDOWS: ';',
  UNIX: ':',
} as const;
