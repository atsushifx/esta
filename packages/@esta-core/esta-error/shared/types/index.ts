// src: shared/types/index.ts
// @(#) : Shared types index for Esta error handling system
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @fileoverview Shared types index for Esta error handling system.
 * Provides centralized exports for error severity levels and error classes.
 */

/** Error severity levels enum and validation utilities */
export { ErrorSeverity, isValidErrorSeverity } from './ErrorSeverity.types';

/** Esta-specific error class with enhanced functionality */
export { EstaError } from './EstaError.types';
