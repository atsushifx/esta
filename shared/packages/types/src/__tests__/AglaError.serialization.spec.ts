import { describe, expect, it } from 'vitest';
import { TestAglaError } from './helpers/TestAglaError.class.js';

/**
 * AglaError Serialization Unit Tests
 * Moved from E2E tests - these are unit-level tests for serialization functionality
 */

// Helper function for creating complex context
const createComplexContext = (): Record<string, unknown> => ({
  user: { id: '123', roles: ['admin', 'user'] },
  operation: { type: 'CREATE', timestamp: new Date('2025-01-01T00:00:00Z').toISOString() },
  metadata: { version: '1.0', tags: ['critical'] },
});

describe('Given AglaError serialization functionality', () => {
  describe('When serializing different implementations to JSON', () => {
    it('Then should maintain consistent JSON structure', () => {
      const implementations = [
        new TestAglaError('TEST_ERROR', 'Test message'),
      ];

      const serializedErrors = implementations.map((impl) => impl.toJSON());

      serializedErrors.forEach((serialized) => {
        expect(serialized).toHaveProperty('errorType');
        expect(serialized).toHaveProperty('message');
        expect(typeof serialized.errorType).toBe('string');
        expect(typeof serialized.message).toBe('string');
      });
    });

    it('Then should support round-trip serialization', () => {
      const originalErrors = [
        new TestAglaError('TEST_ERROR', 'Test message'),
      ];

      const jsonStrings = originalErrors.map((error) => JSON.stringify(error.toJSON()));
      const parsed = jsonStrings.map((json) => JSON.parse(json));

      parsed.forEach((parsedError, index) => {
        const original = originalErrors[index];
        expect(parsedError.errorType).toBe(original.errorType);
        expect(parsedError.message).toBe(original.message);
      });
    });
  });

  describe('When handling complex context objects', () => {
    it('Then should serialize nested context consistently', () => {
      const complexContext = createComplexContext();
      const implementations = [
        new TestAglaError('TEST_COMPLEX', 'Complex message', { context: complexContext }),
      ];

      const serialized = implementations.map((impl) => impl.toJSON());

      serialized.forEach((result) => {
        expect(result).toHaveProperty('context');
        expect(result.context).toBeDefined();
        expect(typeof result.context).toBe('object');
        expect(result.context).not.toBeNull();

        const context = result.context as Record<string, unknown>;
        expect(context).toHaveProperty('user');
        expect(context.user).toBeDefined();
        expect(typeof context.user).toBe('object');
        expect(context.user).not.toBeNull();

        const user = context.user as Record<string, unknown>;
        expect(user).toHaveProperty('roles');
        expect(Array.isArray(user.roles)).toBe(true);
      });
    });
  });
});
