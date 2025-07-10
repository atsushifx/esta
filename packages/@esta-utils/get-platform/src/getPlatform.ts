// src/getPlatform.ts
// @(#) : プラットフォーム判定ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as os from 'os';
// constants
import { PATH_DELIMITER, PLATFORM_MAP } from '@shared/constants';
import { PLATFORM_TYPE } from '@shared/types';
// types
import type { TPlatformKey } from '@shared/constants';

/**
 * 現在のOSの正規化されたプラットフォーム名を返す
 *
 * @param platform - 正規化するプラットフォーム文字列（デフォルトは `os.platform()` の値）
 * @param strict - 未サポートプラットフォームでエラーを投げるかどうか（デフォルトは `true`）
 * @returns 正規化されたプラットフォーム名または `PLATFORM_TYPE.UNKNOWN`
 * @throws プラットフォームが未サポートで `strict` が `true` の場合
 */
export const getPlatform = (
  platform: TPlatformKey | 'unknown' = os.platform() as TPlatformKey,
  strict: boolean = true,
): PLATFORM_TYPE => {
  const platformKey = (platform in PLATFORM_MAP ? platform : 'unknown') as TPlatformKey | 'unknown';
  const result = PLATFORM_MAP[platformKey];

  if (strict && result === PLATFORM_TYPE.UNKNOWN) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return result;
};

/**
 * 現在のOSがWindowsかどうかを判定する
 * @returns Windowsの場合は `true`
 */
export const isWindows = (): boolean => getPlatform() === PLATFORM_TYPE.WINDOWS;

/**
 * 現在のOSがLinuxかどうかを判定する
 * @returns Linuxの場合は `true`
 */
export const isLinux = (): boolean => getPlatform() === PLATFORM_TYPE.LINUX;

/**
 * 現在のOSがmacOSかどうかを判定する
 * @returns macOSの場合は `true`
 */
export const isMacOS = (): boolean => getPlatform() === PLATFORM_TYPE.MACOS;

/**
 * 現在のプラットフォームに適切なPATH区切り文字を返す
 *
 * @returns PATH区切り文字（Windowsの場合は ';'、その他の場合は ':'）
 */
export const getDelimiter = (): string => {
  return isWindows() ? PATH_DELIMITER.WINDOWS : PATH_DELIMITER.UNIX;
};

export default getPlatform;
