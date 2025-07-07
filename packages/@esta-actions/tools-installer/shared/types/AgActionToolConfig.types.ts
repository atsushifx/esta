// src: ./shared/types/AgActionToolConfig.types.ts
// @(#) : tool configuration type definitions
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- import
// types
import type { AgActionInstallerType } from './AgActionCommon.types';
import type { AgActionInstallOptions } from './AgActionInstallerHandler.types';

// --- type / interface
type AgActionToolConfigBase = {
  installer: AgActionInstallerType;
  tool: string;
  options?: AgActionInstallOptions;
};

/**
 * eget用ツール設定Entry
 */
export type AgActionEgetToolConfig = {
  package: string;
} & AgActionToolConfigBase;

/**
 * Scriptインストーラ用ツール設定エントリー
 */
export type AgActionScriptToolConfig = {
  repo: string;
  command: string;
} & AgActionToolConfigBase;

/***
 * 設定ファイル用ツール設定エントリー
 */
export type AgActionToolConfig = AgActionEgetToolConfig | AgActionScriptToolConfig;
