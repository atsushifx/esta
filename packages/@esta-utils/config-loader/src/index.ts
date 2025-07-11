// src: index.ts
// @(#): main entry point / barrel file
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
export * from '../shared/types';

// modules
export * from './loadConfig';
export * from './parseConfig';
export * from './search/findConfigFile';

// functions
import { loadConfig } from './loadConfig';
import { normalizeExtension, parseConfig } from './parseConfig';
import { findConfigFile } from './search/findConfigFile';

// types

// constants
import { EstaExtensionToFileTypeMap, EstaSupportedExtensions } from '../shared/types';

// default export
const configLoader = {
  // functions
  findConfigFile,
  loadConfig,
  parseConfig,
  normalizeExtension,

  // constants
  EstaExtensionToFileTypeMap,
  EstaSupportedExtensions,
};

export default configLoader;
