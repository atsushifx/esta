// src: index.ts
// @(#) : @ag-utils: common entry point
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import
import * as _agUtilsGetPlatform from '@ag-utils/get-platform';
const agUtils = _agUtilsGetPlatform;

// --- export
// named export
export * from '@ag-utils/get-platform'; // Individual exports (named exports)

// namespace / default export
export { agUtils };
export default agUtils; // Default export as namespace
