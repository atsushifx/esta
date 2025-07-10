// shared/constants/platform.ts
// @(#) : プラットフォーム関連の定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PLATFORM_TYPE } from '@shared/types';

/**
 * Node.js os.platform()の値とPLATFORM_TYPEのマッピング
 */
export const PLATFORM_MAP = {
  'win32': PLATFORM_TYPE.WINDOWS,
  'linux': PLATFORM_TYPE.LINUX,
  'darwin': PLATFORM_TYPE.MACOS,
  'unknown': PLATFORM_TYPE.UNKNOWN,
} as const;

/**
 * プラットフォームキーの型
 */
export type TPlatformKey = keyof typeof PLATFORM_MAP;

/**
 * サポートされているプラットフォームの型
 */
export type TSupportedPlatform = typeof PLATFORM_MAP[TPlatformKey];

/**
 * プラットフォーム固有のPATH区切り文字
 */
export const PATH_DELIMITER = {
  WINDOWS: ';',
  UNIX: ':',
} as const;
