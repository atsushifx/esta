// src: packages/@esta-utils/utils/src/index.ts
// @(#) : @esta-utils/utils: unified entry point for @esta-utils packages
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import
import { estaUtils as commandRunner } from '@esta-utils/command-runner';
import configLoader from '@esta-utils/config-loader';
import { estaUtils as getPlatform } from '@esta-utils/get-platform';

const estaUtils = {
  configLoader,
  ...getPlatform,
  ...commandRunner,
};

// --- export
// named export
export * from '@esta-utils/command-runner';
export * from '@esta-utils/get-platform';

// namespace / default export
export { estaUtils };
export default estaUtils;
