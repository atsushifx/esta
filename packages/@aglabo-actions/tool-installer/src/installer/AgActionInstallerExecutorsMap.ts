// src/installer/AgActionExecutorsMap.ts
// @(#) : ハンドラー用ExecutorMap
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// typed module
import { AgActionInstallerType } from '@shared/types';

// executor
import EgetInitializer from './executor/EgetInitializer';
import NullExecutor from './executor/NullExecutor';

// type
import type { AgActionInstallerExecutorsMap } from '@shared/types';

// map
export const AgExecutorsMap: AgActionInstallerExecutorsMap = {
  [AgActionInstallerType.EGET_INITIALIZE]: new EgetInitializer(),
  [AgActionInstallerType.EGET]: new NullExecutor(),
  // [AgActionInstallerType.SCRIPT]: new NullExecutor
};
