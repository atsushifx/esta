// src: src/__tests__/types/EstaError.spec.ts
// @(#) : Unit tests for EstaError class functionality and methods
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - Testing utilities and assertions
import { describe, expect, it } from 'vitest';

// Local modules - Application code and utilities from current package
import { ErrorSeverity, EstaError } from '../../../shared/types';

describe('EstaError class', () => {
  it('should extend AglaError correctly', () => {
    const error = new EstaError('TEST_ERROR', 'Test message', 'TEST_001', ErrorSeverity.ERROR);

    expect(error).toBeInstanceOf(Error);
    expect(error.errorType).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
  });

  it('should initialize with required constructor parameters', () => {
    const error = new EstaError(
      'VALIDATION_ERROR',
      'Invalid input provided',
      'VAL_001',
      ErrorSeverity.WARNING,
    );

    expect(error.errorType).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid input provided');
  });

  it('should set code property correctly', () => {
    const error = new EstaError('CONFIG_ERROR', 'Config not found', 'CFG_404', ErrorSeverity.ERROR);

    expect(error.code).toBe('CFG_404');
  });

  it('should set severity property correctly', () => {
    const error = new EstaError('NETWORK_ERROR', 'Connection failed', 'NET_001', ErrorSeverity.FATAL);

    expect(error.severity).toBe(ErrorSeverity.FATAL);
  });

  it('should auto-generate timestamp property', () => {
    const beforeCreation = new Date();
    const error = new EstaError('TIME_ERROR', 'Time test', 'TIME_001', ErrorSeverity.INFO);
    const afterCreation = new Date();

    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(error.timestamp.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });

  it('should convert to JSON with all required fields', () => {
    const error = new EstaError('JSON_ERROR', 'JSON test', 'JSON_001', ErrorSeverity.ERROR);
    const json = error.toJSON();

    expect(json).toHaveProperty('errorType', 'JSON_ERROR');
    expect(json).toHaveProperty('message', 'JSON test');
    expect(json).toHaveProperty('code', 'JSON_001');
    expect(json).toHaveProperty('severity', ErrorSeverity.ERROR);
    expect(json).toHaveProperty('timestamp');
  });

  it('should include context in JSON when provided', () => {
    const context = { userId: 123, action: 'login' };
    const error = new EstaError('AUTH_ERROR', 'Auth failed', 'AUTH_001', ErrorSeverity.WARNING, context);
    const json = error.toJSON();

    expect(json).toHaveProperty('context', context);
  });

  it('should not include context in JSON when not provided', () => {
    const error = new EstaError('NO_CONTEXT_ERROR', 'No context', 'NC_001', ErrorSeverity.INFO);
    const json = error.toJSON();

    expect(json).not.toHaveProperty('context');
  });

  it('should format toString with EstaError specific format', () => {
    const error = new EstaError('STRING_ERROR', 'String test', 'STR_001', ErrorSeverity.ERROR);
    const str = error.toString();

    expect(str).toContain('[ERROR]');
    expect(str).toMatch(/^\[ERROR\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    expect(str).toContain('STRING_ERROR');
    expect(str).toContain('String test');
  });

  it('should include severity and timestamp in toString output', () => {
    const error = new EstaError('TIME_STRING_ERROR', 'Time string test', 'TS_001', ErrorSeverity.WARNING);
    const str = error.toString();

    expect(str).toContain('[WARNING]');
    expect(str).toContain(error.timestamp.toISOString());
  });

  it('should chain error with cause information', () => {
    const originalError = new Error('Original failure');
    const estaError = new EstaError('CHAIN_ERROR', 'Chain test', 'CHAIN_001', ErrorSeverity.ERROR);
    const chainedError = estaError.chain(originalError);

    expect(chainedError).toBeInstanceOf(EstaError);
    expect(chainedError.message).toContain('Chain test');
    expect(chainedError.message).toContain('caused by: Original failure');
  });

  it('should preserve error properties in chained error', () => {
    const originalError = new Error('Nested error');
    const estaError = new EstaError('PRESERVE_ERROR', 'Preserve test', 'PRES_001', ErrorSeverity.FATAL);
    const chainedError = estaError.chain(originalError);

    expect(chainedError.errorType).toBe('PRESERVE_ERROR');
    expect(chainedError.code).toBe('PRES_001');
    expect(chainedError.severity).toBe(ErrorSeverity.FATAL);
  });

  it('should include cause information in chained error context', () => {
    const originalError = new Error('Root cause');
    const estaError = new EstaError('CONTEXT_ERROR', 'Context test', 'CTX_001', ErrorSeverity.WARNING);
    const chainedError = estaError.chain(originalError);

    expect(chainedError.context).toHaveProperty('cause', 'Root cause');
  });
});
