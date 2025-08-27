// src: src/index.ts
// @(#) : Package entry point for Esta error handling utilities
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @fileoverview Package entry point for Esta error handling utilities.
 * Re-exports all public APIs from the shared types module.
 */

/**
 * Esta error handling exports:
 * - ErrorSeverity: Enum for error severity levels (FATAL, ERROR, WARNING, INFO)
 * - EstaError: Enhanced error class with severity, codes, timestamps, and chaining
 * - isValidErrorSeverity: Type guard function for ErrorSeverity validation
 */
export { ErrorSeverity, EstaError, isValidErrorSeverity } from '../shared/types';
