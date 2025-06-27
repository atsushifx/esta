// src: /shared/types/common.types.ts :
// @(#) : common types definition
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * file ext as supported
 */
export const TEXT_EXT_TYPE_MAP = {
  'md': 'markdown',
  'error': 'void',
} as const;

/**
 * extension constants derived from map keys
 */
export const EXTENSIONS = Object.keys(TEXT_EXT_TYPE_MAP).reduce((acc, key) => {
  acc[key as keyof typeof TEXT_EXT_TYPE_MAP] = key;
  return acc;
}, {} as Record<keyof typeof TEXT_EXT_TYPE_MAP, string>) as {
  readonly [K in keyof typeof TEXT_EXT_TYPE_MAP]: K;
};

/**
 * extension list type
 */
export type ExtensionList = keyof typeof TEXT_EXT_TYPE_MAP;

/**
 * text type list type
 */
export type TextTypeList = typeof TEXT_EXT_TYPE_MAP[keyof typeof TEXT_EXT_TYPE_MAP];
