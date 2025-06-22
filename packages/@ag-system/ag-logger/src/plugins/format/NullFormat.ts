// src: /src/plugins/format/NullFormat.ts
// @(#) : Null Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel } from '@shared/types';

export const NullFormat = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  level: AgLogLevel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...args: unknown[]
): string => {
  return '';
};

export default NullFormat;