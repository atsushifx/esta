// src: ./constants/errorSeverity.ts
// @(#): エラー重大度定数とTErrorSeverity型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export const ERROR_SEVERITY = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type TErrorSeverity = typeof ERROR_SEVERITY[keyof typeof ERROR_SEVERITY];
