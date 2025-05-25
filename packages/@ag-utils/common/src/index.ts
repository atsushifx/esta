// src: index.ts
// @(#) : @ag-utils: common entry point
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import
import * as agUtilsGetPlatform from '@ag-utils/get-platform';

// --- export
// named export
export * from '@ag-utils/get-platform'; // Individual exports (named exports)

// set namespace
export const agUtils = {
  ...agUtilsGetPlatform,
};

export default agUtils; // Default export as namespace
