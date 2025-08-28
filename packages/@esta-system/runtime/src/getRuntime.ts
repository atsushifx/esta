// src/getRuntime.ts
// @(#) : Runtime detection function
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TExecRuntime } from '../shared/types/TExecRuntime.types';

// Type declarations for global objects
declare global {
  var Deno: unknown;
  var Bun: unknown;
}

export const getRuntime = (): TExecRuntime => {
  // 1. GitHub Actions detection (highest priority)
  if (process.env.GITHUB_ACTIONS === 'true') {
    return TExecRuntime.GHA;
  }

  // 2. Deno detection (higher priority than Node.js)
  if (typeof Deno !== 'undefined') {
    return TExecRuntime.Deno;
  }

  // 3. Bun detection
  if (typeof Bun !== 'undefined') {
    return TExecRuntime.Bun;
  }

  // 4. Node.js detection
  if (typeof process !== 'undefined' && 'versions' in process && process.versions?.node) {
    return TExecRuntime.Node;
  }

  return TExecRuntime.Unknown;
};
