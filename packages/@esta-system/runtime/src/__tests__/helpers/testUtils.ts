// src/__tests__/helpers/testUtils.ts
// @(#) : Test helper functions for runtime tests
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

type RuntimeGlobalThis = {
  Deno?: unknown;
  Bun?: unknown;
  process?: typeof process;
};

/**
 * Mock runtime environment and automatically cleanup after test
 */
export const withMockRuntime = (runtime: 'Deno' | 'Bun' | 'GHA', testFn: () => void): void => {
  let cleanup: (() => void) | undefined;

  if (runtime === 'Deno') {
    (globalThis as RuntimeGlobalThis).Deno = {};
    cleanup = () => delete (globalThis as RuntimeGlobalThis).Deno;
  } else if (runtime === 'Bun') {
    (globalThis as RuntimeGlobalThis).Bun = {};
    cleanup = () => delete (globalThis as RuntimeGlobalThis).Bun;
  } else {
    const originalValue = process.env.GITHUB_ACTIONS;
    process.env.GITHUB_ACTIONS = 'true';
    cleanup = () => {
      if (originalValue === undefined) {
        delete process.env.GITHUB_ACTIONS;
      } else {
        process.env.GITHUB_ACTIONS = originalValue;
      }
    };
  }

  try {
    testFn();
  } finally {
    cleanup();
  }
};

/**
 * Mock environment variable and automatically cleanup after test
 */
export const withEnvVar = (key: string, value: string, testFn: () => void): void => {
  const originalValue = process.env[key];
  process.env[key] = value;

  try {
    testFn();
  } finally {
    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  }
};
