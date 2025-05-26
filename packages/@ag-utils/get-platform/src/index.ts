// src: index.ts
// @(#) : getPlatform用バレルファイル
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import all
import * as _agUtilsGetPlatform from './getPlatform';

// 値オブジェクトから型を設定
type _agUtilsType = typeof _agUtilsGetPlatform & {
  PlatformType: typeof _agUtilsGetPlatform.PlatformType;
};
const agUtils = _agUtilsGetPlatform as _agUtilsType;

// --- export
// named export
export * from './getPlatform';

export { agUtils };
export default agUtils;
