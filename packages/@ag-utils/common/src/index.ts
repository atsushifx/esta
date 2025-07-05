// src: index.ts
// @(#) : @ag-utils: common entry point
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import
import { agUtils as commandUtils } from '@ag-utils/command-utils';
import { agUtils as getPlatform } from '@esta-utils/get-platform';

const agUtils = {
  ...getPlatform,
  ...commandUtils,
};

// --- export
// named export
export * from '@ag-utils/command-utils';
export * from '@esta-utils/get-platform';

// namespace / default export
export { agUtils };
