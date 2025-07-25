// src: ./error/EstaError.ts
// @(#): EstaErrorクラス実装
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ERROR_SEVERITY } from '../../shared/constants/errorSeverity';
import type { TErrorSeverity } from '../../shared/constants/errorSeverity';

export class EstaError extends Error {
  readonly code: string;
  readonly severity: TErrorSeverity;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    const trimmedMessage = message.trim();
    super(trimmedMessage);
    this.name = 'EstaError';
    this.code = code;
    this.severity = ERROR_SEVERITY.ERROR;
    this.timestamp = new Date();
    this.context = context;
  }
}
