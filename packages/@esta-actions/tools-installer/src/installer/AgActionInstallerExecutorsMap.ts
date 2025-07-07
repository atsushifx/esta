// src: ./src/installer/AgActionInstallerExecutorsMap.ts
// @(#) : executor map for installer handlers
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { AgActionInstallerType } from '@shared/types';
// executor
import type { AgActionInstallerExecutorsMap } from '@shared/types';

import EgetInitializer from './executor/EgetInitializer';
import NullExecutor from './executor/NullExecutor';

// map
export const AgExecutorsMap: AgActionInstallerExecutorsMap = {
  [AgActionInstallerType.EGET_INITIALIZE]: new EgetInitializer(),
  [AgActionInstallerType.EGET]: new NullExecutor(),
  // [AgActionInstallerType.SCRIPT]: new NullExecutor
};
