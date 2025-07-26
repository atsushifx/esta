// src/utils/testIdUtils.ts
// @(#) : Test ID Utility Functions for E2E Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Node.js built-in modules
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';

/**
 * Get normalized basename from identifier, handling file paths and extensions.
 * Removes all extensions, converts to lowercase.
 */
export const getNormalizedBasename = (identifier: string): string => {
  const lowerIdentifier = identifier.toLowerCase();

  // If identifier looks like a file path, extract basename
  if (lowerIdentifier.includes('/') || lowerIdentifier.includes('\\') || lowerIdentifier.includes('.')) {
    let baseName = basename(lowerIdentifier);

    // Remove all extensions starting from first dot
    baseName = baseName.replace(/\.[a-z0-9.]*$/, '');

    return baseName;
  }

  return lowerIdentifier;
};

/**
 * Generate unique string with specified length.
 * @param length - Length of unique string (default: 8, range: 1-32)
 * @returns Unique lowercase string
 */
export const getUniqString = (length: number = 8): string => {
  const DEFAULT_LENGTH = 8;
  const MAX_LENGTH = 32;

  const uniqStringLength = length <= 0
    ? DEFAULT_LENGTH
    : length > MAX_LENGTH
    ? MAX_LENGTH
    : length;

  return randomUUID().replace(/-/g, '').substring(0, uniqStringLength).toLowerCase();
};

/**
 * Utility function to create a unique test ID for parallel test execution.
 * Uses timestamp and unique string to guarantee uniqueness across all test runs.
 *
 * @param identifier - Can be app name, test file basename, or custom identifier
 * @param length - Length of unique string (default: 8, range: 1-32)
 * @returns Unique test ID in format: {identifier}-{timestamp}-{uniqString}
 *
 * @example
 * // Using app name
 * createTestId('ag-logger') // → 'ag-logger-1643723400-abc123'
 *
 * // Using test file path
 * createTestId(__filename) // → 'AgLogger.spec-1643723400-def456'
 *
 * // Using custom identifier with custom length
 * createTestId('integration-test', 12) // → 'integration-test-1643723400-ghi789klm'
 */
export const createTestId = (identifier: string = 'test', length: number = 8): string => {
  const timestamp = Date.now();
  const uniqString = getUniqString(length);
  const normalizedIdentifier = getNormalizedBasename(identifier);

  return `${normalizedIdentifier}-${timestamp}-${uniqString}`;
};
