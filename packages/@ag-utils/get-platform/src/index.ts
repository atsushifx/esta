// src: index.ts
// @(#) : getPlatform用バレルファイル
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import all
import { getDelimiter, getPlatform, PlatformType } from './getPlatform';

// namespace
const agUtils = {
  getPlatform,
  getDelimiter,
  PlatformType,
};

// --- export
// named export
export * from './getPlatform';
export { agUtils };
