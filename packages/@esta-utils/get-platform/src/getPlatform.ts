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
import { PATH_DELIMITER, PLATFORM_MAP } from '../shared/constants';
import { PLATFORM_TYPE } from '../shared/types';
// types
import type { TPlatformKey } from '../shared/constants';

// キャッシュ用の変数
let platformCache: PLATFORM_TYPE | undefined;

/**
 * 現在のOSの正規化されたプラットフォーム名を返す
 *
 * @param platform - 正規化するプラットフォーム文字列（デフォルトは空文字列、空文字列の場合は `os.platform()` の値を使用）
 * @param strict - 未サポートプラットフォームでエラーを投げるかどうか（デフォルトは `true`）
 * @returns 正規化されたプラットフォーム名または `PLATFORM_TYPE.UNKNOWN`
 * @throws プラットフォームが未サポートで `strict` が `true` の場合
 */
export const getPlatform = (
  platform: TPlatformKey | 'unknown' | '' = '',
  strict: boolean = true,
): PLATFORM_TYPE => {
  const isEmptyString = platform === '';

  // 空文字列の場合はキャッシュがあればそれを使用、なければos.platform()を使用
  if (isEmptyString) {
    if (platformCache !== undefined) {
      return platformCache;
    }
    platform = os.platform() as TPlatformKey;
  }

  const platformKey = (platform in PLATFORM_MAP ? platform : 'unknown') as TPlatformKey | 'unknown';
  const result = PLATFORM_MAP[platformKey];

  if (strict && result === PLATFORM_TYPE.UNKNOWN) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // 空文字列から取得した場合はキャッシュに保存
  if (isEmptyString) {
    platformCache = result;
  }

  return result;
};

/**
 * プラットフォームキャッシュをクリアする（主にテスト用）
 */
export const clearPlatformCache = (): void => {
  platformCache = undefined;
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
