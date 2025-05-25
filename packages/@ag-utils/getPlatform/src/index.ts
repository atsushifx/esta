// src: index.ts
// @(#) : getPlatform用バレルファイル
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import all
import * as agUtilsObj from './getPlatform';

// -- Namespaced export object ---
type _agUtilsType = typeof agUtilsObj & {
  PlatformType: typeof agUtilsObj.PlatformType;
};
const agUtils = agUtilsObj as _agUtilsType;

// --- export
export * from './getPlatform'; // named export
export { agUtils }; //            namespace export
export default agUtils;
