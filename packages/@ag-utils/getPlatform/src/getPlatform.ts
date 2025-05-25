// src: /src/utils/getPlatform.ts
// @(#) : getPlatform : OS種別取得
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as os from 'os';

// type
/**
 * PlatformType
 *
 * OS種別を表すenum。
 * - `WINDOWS` : Windowsプラットフォーム
 * - `LINUX`   : Linuxプラットフォーム
 * - `MACOS`   : macOSプラットフォーム
 * - `UNKNOWN` : 未サポート・判別不能なプラットフォーム (=0, falsy)
 *
 * 文字列値は比較・判定用に使用。
 * UNKNOWNのみ数値0（falsy）となるため、条件分岐には明示的な比較推奨。
 */
export enum PlatformType {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  UNKNOWN = 0,
}

/**
 * Returns the normalized platform name of the current OS.
 *
 * - Returns 'windows', 'linux', or 'macos' based on Node.js `os.platform()` value.
 * - If the platform is unsupported, throws an error when `strict` is `true` (default),
 *   or returns `undefined` when `strict` is `false`.
 *
 * @param {string} [platform=os.platform()] - The platform string to normalize (defaults to `os.platform()`).
 * @param {boolean} [strict=true] - Whether to throw an error for unsupported platforms (`true`), or return `undefined` (`false`).
 * @returns {'windows' | 'linux' | 'macos' | undefined} Normalized platform name or `undefined`.
 * @throws {Error} If the platform is unsupported and `strict` is `true`.
 */
export const getPlatform = (
  platform: string = os.platform(),
  strict: boolean = true,
): PlatformType => {
  switch (platform) {
    case 'win32':
      return PlatformType.WINDOWS;
    case 'linux':
      return PlatformType.LINUX;
    case 'darwin':
      return PlatformType.MACOS;
  }

  if (strict) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return PlatformType.UNKNOWN;
};

/**
 * Returns true if the current OS matches the specific platform.
 *
 * - isWindows(): 判定対象がWindowsの場合にtrue
 * - isLinux(): 判定対象がLinuxの場合にtrue
 * - isMacOS(): 判定対象がmacOSの場合にtrue
 *
 * @returns {boolean} true if the current OS is the respective platform.
 */
export const isWindows = (): boolean => getPlatform() === PlatformType.WINDOWS;
export const isLinux = (): boolean => getPlatform() === PlatformType.LINUX;
export const isMacOS = (): boolean => getPlatform() === PlatformType.MACOS;

/**
 * Returns the appropriate PATH delimiter for the current platform.
 *
 * - Uses `getPlatform()` to determine the delimiter.
 * - Returns ';' for Windows, ':' for Linux/macOS, or ':' as a safe fallback for unsupported platforms.
 *
 * @returns {string} PATH delimiter (';' for Windows, ':' for others)
 */
export const getDelimiter = (): string => {
  return isWindows() ? ';' : ':';
};

export default getPlatform;
