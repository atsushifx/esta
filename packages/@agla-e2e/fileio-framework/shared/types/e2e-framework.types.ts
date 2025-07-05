// src: shared/types/e2e-framework.types.ts
// @(#): Type Definitions for E2E Framework - Public AgE2e Types
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Mapping between supported file extensions and their corresponding content formats.
 * This map is used to determine how to parse or handle files based on their extension.
 */
export const AG_E2E_FILE_FORMAT_MAP = {
  json: 'json',
  jsonc: 'json',
  yaml: 'yaml',
  ts: 'typescript',
  js: 'typescript',
  md: 'markdown',
  txt: 'text',
} as const;

/**
 * Supported file extensions recognized by the E2E testing framework.
 * These extensions are keys in the AG_E2E_FILE_FORMAT_MAP.
 */
export type AgE2eFileExtension = keyof typeof AG_E2E_FILE_FORMAT_MAP;

/**
 * Supported file content formats corresponding to the recognized file extensions.
 * This type is derived from the values of AG_E2E_FILE_FORMAT_MAP.
 */
export type AgE2eFileFormat = typeof AG_E2E_FILE_FORMAT_MAP[AgE2eFileExtension];

/**
 * Specification of configuration files used within E2E tests.
 *
 * - `filename`: The name of the configuration file.
 * - `content`: The raw content of the file, either as a string or an object.
 * - `format`: Optional. The format/type of the file content, such as 'json', 'yaml', etc.
 */
export type AgE2eConfigFileSpec = {
  filename: string;
  content: string | Record<string, unknown>;
  format?: AgE2eFileFormat;
};

/**
 * Defines an individual test scenario for E2E testing.
 *
 * - `description`: A human-readable summary of the test scenario.
 * - `configFiles`: An array of configuration files to set up the test environment.
 * - `functionArgs`: The arguments to be passed into the test function.
 * - `expectedResult`: Optional. The expected output or result of the test.
 * - `shouldThrow`: Optional. Indicates if the test expects an error to be thrown.
 * - `expectedError`: Optional. A string message expected if an error is thrown.
 */
export type AgE2eTestScenario = {
  description: string;
  configFiles: AgE2eConfigFileSpec[];
  functionArgs: unknown[];
  expectedResult?: unknown;
  shouldThrow?: boolean;
  expectedError?: string;
};

/**
 * Represents the result of an E2E test execution.
 *
 * - `scenario`: The test scenario that was executed.
 * - `result`: The outcome of the test, either a successful result of generic type `T` or an Error instance if the test failed.
 */
export type AgE2eTestResult<T> = {
  scenario: AgE2eTestScenario;
  result: T | Error;
};
