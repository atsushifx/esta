/**
 * @fileoverview プラットフォーム判定ユーティリティ
 * @author atsushifx <https://github.com/atsushifx>
 * @license MIT
 * @copyright 2025 atsushifx
 */

import * as os from 'os';
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
 * 現在のOSの正規化されたプラットフォーム名を返す
 *
 * @param platform - 正規化するプラットフォーム文字列（デフォルトは `os.platform()` の値）
 * @param strict - 未サポートプラットフォームでエラーを投げるかどうか（デフォルトは `true`）
 * @returns 正規化されたプラットフォーム名または `PlatformType.UNKNOWN`
 * @throws プラットフォームが未サポートで `strict` が `true` の場合
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
 * 現在のOSがWindowsかどうかを判定する
 * @returns Windowsの場合は `true`
 */
export const isWindows = (): boolean => getPlatform() === PlatformType.WINDOWS;

/**
 * 現在のOSがLinuxかどうかを判定する
 * @returns Linuxの場合は `true`
 */
export const isLinux = (): boolean => getPlatform() === PlatformType.LINUX;

/**
 * 現在のOSがmacOSかどうかを判定する
 * @returns macOSの場合は `true`
 */
export const isMacOS = (): boolean => getPlatform() === PlatformType.MACOS;

/**
 * 現在のプラットフォームに適切なPATH区切り文字を返す
 *
 * @returns PATH区切り文字（Windowsの場合は ';'、その他の場合は ':'）
 */
export const getDelimiter = (): string => {
  return isWindows() ? ';' : ':';
};

export default getPlatform;
