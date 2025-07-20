// src/defaults.ts
// @(#) : Default ESTA configuration
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { EstaConfig } from '../shared/types/estaConfig.types';
import { LogLevelSymbolMap } from './logLevel';

export const defaultEstaConfig = (): EstaConfig => {
  return {
    toolsConfigPath: './tools.config.json',
    logLevel: LogLevelSymbolMap.INFO,
  };
};
