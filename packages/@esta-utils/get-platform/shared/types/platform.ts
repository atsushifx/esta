// shared/types/platform.ts
// @(#) : プラットフォーム関連の型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * PLATFORM_TYPE
 *
 * OS種別を表すenum。
 * - `WINDOWS` : Windowsプラットフォーム
 * - `LINUX`   : Linuxプラットフォーム
 * - `MACOS`   : macOSプラットフォーム
 * - `UNKNOWN` : 未サポート・判別不能なプラットフォーム (空文字列, falsy)
 *
 * 全て文字列値に統一。UNKNOWNは空文字列（falsy）となるため、
 * 条件分岐には明示的な比較を推奨。
 */
export enum PLATFORM_TYPE {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  UNKNOWN = '',
}
