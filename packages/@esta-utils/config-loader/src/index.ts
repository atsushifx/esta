// src: index.ts
// @(#): main entry point / barrel file
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
export * from '../shared/types';

// modules
export * from './findConfigFile';
export * from './loadConfig';
export * from './parseConfig';

// functions
import { findConfigFile } from './findConfigFile';
import { loadConfig } from './loadConfig';
import { normalizeExtension, parseConfig } from './parseConfig';

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
