// src: index.ts
// @(#) : getPlatform用バレルファイル
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import all
import { getDelimiter, getPlatform } from '@/getPlatform';
import { PLATFORM_TYPE } from '@shared/types';

// namespace
const estaUtils = {
  getPlatform,
  getDelimiter,
  PLATFORM_TYPE,
};

// --- export
// named export
export * from '@/getPlatform';
export * from '@shared/constants';
export * from '@shared/types';
export { estaUtils };
