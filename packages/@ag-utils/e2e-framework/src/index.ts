// src/index.ts
// @(#): E2E Test Framework - Barrel File
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Barrel file for the E2E testing framework.
 * Re-exports main framework classes, instances, types, and utility functions
 * for convenient imports throughout the project.
 */

// Framework classes and instances
export { AgE2eFileIOFramework, agE2ETestFramework } from './AgE2eFileIoFramework';

// Types
export type {
  AgE2eConfigFileSpec,
  AgE2eFileExtension,
  AgE2eFileFormat,
  AgE2eTestResult,
  AgE2eTestScenario,
} from '../shared/types/e2e-framework.types';

export { AG_E2E_FILE_FORMAT_MAP } from '../shared/types/e2e-framework.types';

// Utility functions
export {
  createDirectory,
  createTempDirectory,
  fileExists,
  readFile,
  readFileTyped,
  removeDirectory,
  writeExpectedResult,
  writeFile,
} from './utils/agE2eFileIoUtils';
