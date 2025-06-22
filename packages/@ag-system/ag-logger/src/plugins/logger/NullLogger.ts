// src: /src/plugins/logger/NullLogger.ts
// @(#) : Null Logger Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLoggerFunction } from '@shared/types/AgLogger.interface';

export const NullLogger: AgLoggerFunction = () => {
  // Do nothing - null logger implementation
};