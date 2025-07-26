import { describe, expect, it } from 'vitest';
import { AglaError } from '../../../shared/types/error.types';

// Test implementation of AglaError since it's abstract
class TestError extends AglaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('TEST_ERROR', message, context);
  }
}

describe('AglaError', () => {
  describe('constructor', () => {
    it('should set code property correctly', () => {
      const error = new TestError('Test message');
      expect(error.code).toBe('TEST_ERROR');
    });

    it('should set message property correctly', () => {
      const error = new TestError('Test message');
      expect(error.message).toBe('Test message');
    });

    it('should set context property when provided', () => {
      const context = { key: 'value', number: 42 };
      const error = new TestError('Test message', context);
      expect(error.context).toEqual(context);
    });

    it('should set context property to undefined when not provided', () => {
      const error = new TestError('Test message');
      expect(error.context).toBeUndefined();
    });

    it('should set name property to constructor name', () => {
      const error = new TestError('Test message');
      expect(error.name).toBe('TestError');
    });
  });

  describe('toString method', () => {
    it('should format error message without context', () => {
      const error = new TestError('Test message');
      const result = error.toString();
      expect(result).toBe('TEST_ERROR: Test message');
    });

    it('should format error message with context', () => {
      const context = { key: 'value', number: 42 };
      const error = new TestError('Test message', context);
      const result = error.toString();
      expect(result).toBe('TEST_ERROR: Test message {"key":"value","number":42}');
    });

    it('should handle empty context object', () => {
      const error = new TestError('Test message', {});
      const result = error.toString();
      expect(result).toBe('TEST_ERROR: Test message {}');
    });
  });

  describe('inheritance', () => {
    it('should be instance of Error', () => {
      const error = new TestError('Test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of AglaError', () => {
      const error = new TestError('Test message');
      expect(error).toBeInstanceOf(AglaError);
    });
  });

  describe('stack trace', () => {
    it('should have stack property', () => {
      const error = new TestError('Test message');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });
});
