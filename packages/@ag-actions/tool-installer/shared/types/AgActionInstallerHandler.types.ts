// src: /src/shared/types/AgActionInstallerHandler.types.ts
// @(#) : インストーラーハンドラーの型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ---import
// types
import type { AgActionInstallerType } from './AgActionCommon.types';

// --- type / interface
export type AgActionInstallOptions = {
  version?: string;
  installDir?: string;
  args?: string[];
};

export type AgActionInstallerExecutor = {
  execute(options: AgActionInstallOptions): Promise<boolean>;
};

export type AgActionInstallerExecutorsMap = Partial<
  Record<
    AgActionInstallerType,
    AgActionInstallerExecutor
  >
>;
