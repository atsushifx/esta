// src/types.ts
// @(#): Internal Type Definitions - Types Exclusively for E2E Framework Internals
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @internal
 * Defines the structure of a test environment used internally
 * within the E2E testing framework. Not intended for external use.
 */
export type TestEnvironment = {
  /** Path to the temporary directory for the test environment */
  tempDir: string;

  /** Path to the configuration directory within the temp environment */
  configDir: string;

  /** Original value of the XDG_CONFIG_HOME environment variable before test setup */
  originalXdgConfigHome: string | undefined;
};
