// src: shared/types/TExecRuntime.types.ts
// @(#) : TypeScript execution runtime enum
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export enum TExecRuntime {
  Node = 'Node',
  Deno = 'Deno',
  Bun = 'Bun',
  GHA = 'GitHubActions',
  Unknown = 'Unknown',
}
