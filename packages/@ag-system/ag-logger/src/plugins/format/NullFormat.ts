// src: /src/plugins/format/NullFormat.ts
// @(#) : Null Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogMessage } from '@shared/types';

export const NullFormat = (
  _logMessage: AgLogMessage,
): string => {
  return '';
};

export default NullFormat;
