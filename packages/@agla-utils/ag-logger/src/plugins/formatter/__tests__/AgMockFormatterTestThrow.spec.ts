// src/plugins/formatter/__tests__/AgMockFormatterTestThrow.spec.ts
// @(#) : AgMockFormatterTestThrow - BDD tests for testThrow formatter mock
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

import type { AgLogMessage } from '../../../../shared/types';
import { AgMockFormatterTestThrow } from '../AgMockFormatterTestThrow';

describe('AgMockFormatterTestThrow', () => {
  describe('when creating a new instance', () => {
    it('should create an instance with default empty error message', () => {
      const formatter = new AgMockFormatterTestThrow();

      expect(formatter.errorMessage).toBe('');
    });

    it('should create an instance with specified error message in constructor', () => {
      const errorMessage = 'Test error message';
      const formatter = new AgMockFormatterTestThrow(errorMessage);

      expect(formatter.errorMessage).toBe(errorMessage);
    });
  });

  describe('when setting error message', () => {
    it('should update error message via setter', () => {
      const formatter = new AgMockFormatterTestThrow();
      const newErrorMessage = 'Updated error message';

      formatter.errorMessage = newErrorMessage;

      expect(formatter.errorMessage).toBe(newErrorMessage);
    });

    it('should allow empty string as error message', () => {
      const formatter = new AgMockFormatterTestThrow('initial message');

      formatter.errorMessage = '';

      expect(formatter.errorMessage).toBe('');
    });

    it('should handle multiline error messages', () => {
      const formatter = new AgMockFormatterTestThrow();
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      formatter.errorMessage = multilineMessage;

      expect(formatter.errorMessage).toBe(multilineMessage);
    });
  });

  describe('when getting error message', () => {
    it('should return current error message via getter', () => {
      const errorMessage = 'Current error message';
      const formatter = new AgMockFormatterTestThrow(errorMessage);

      const retrievedMessage = formatter.errorMessage;

      expect(retrievedMessage).toBe(errorMessage);
    });

    it('should return updated message after setter call', () => {
      const formatter = new AgMockFormatterTestThrow('initial');
      const updatedMessage = 'updated message';

      formatter.errorMessage = updatedMessage;
      const retrievedMessage = formatter.errorMessage;

      expect(retrievedMessage).toBe(updatedMessage);
    });
  });

  describe('when executing format routine', () => {
    const mockLogMessage: AgLogMessage = {
      logLevel: 4,
      message: 'Test log message',
      timestamp: new Date(),
      args: [],
    };

    it('should throw error with configured error message', () => {
      const errorMessage = 'Configured error for testing';
      const formatter = new AgMockFormatterTestThrow(errorMessage);

      expect(() => formatter.execute(mockLogMessage)).toThrow(errorMessage);
    });

    it('should throw error with updated error message', () => {
      const formatter = new AgMockFormatterTestThrow('initial');
      const newErrorMessage = 'Updated error message';
      formatter.errorMessage = newErrorMessage;

      expect(() => formatter.execute(mockLogMessage)).toThrow(newErrorMessage);
    });

    it('should throw error with empty message when error message is empty', () => {
      const formatter = new AgMockFormatterTestThrow('');

      expect(() => formatter.execute(mockLogMessage)).toThrow('');
    });

    it('should throw Error instance with correct message', () => {
      const errorMessage = 'Test error instance';
      const formatter = new AgMockFormatterTestThrow(errorMessage);

      expect(() => formatter.execute(mockLogMessage)).toThrow(new Error(errorMessage));
    });

    it('should increment call count even when throwing error', () => {
      const formatter = new AgMockFormatterTestThrow('test error');

      expect(() => formatter.execute(mockLogMessage)).toThrow();

      const stats = formatter.getStats();
      expect(stats.callCount).toBe(1);
    });

    it('should update last message even when throwing error', () => {
      const formatter = new AgMockFormatterTestThrow('test error');

      expect(() => formatter.execute(mockLogMessage)).toThrow();

      const stats = formatter.getStats();
      expect(stats.lastMessage).toBe(mockLogMessage);
    });

    it('should accumulate call count on multiple error throws', () => {
      const formatter = new AgMockFormatterTestThrow('test error');

      expect(() => formatter.execute(mockLogMessage)).toThrow();
      expect(() => formatter.execute(mockLogMessage)).toThrow();
      expect(() => formatter.execute(mockLogMessage)).toThrow();

      const stats = formatter.getStats();
      expect(stats.callCount).toBe(3);
    });
  });

  describe('when inheriting from AgMockFormatter', () => {
    it('should have static __isMockConstructor property', () => {
      expect(AgMockFormatterTestThrow.__isMockConstructor).toBe(true);
    });

    it('should provide reset functionality', () => {
      const formatter = new AgMockFormatterTestThrow('test error');
      const mockLogMessage: AgLogMessage = {
        logLevel: 4,
        message: 'Test log message',
        timestamp: new Date(),
        args: [],
      };

      expect(() => formatter.execute(mockLogMessage)).toThrow();
      formatter.reset();

      const stats = formatter.getStats();
      expect(stats.callCount).toBe(0);
      expect(stats.lastMessage).toBeNull();
    });
  });
});
