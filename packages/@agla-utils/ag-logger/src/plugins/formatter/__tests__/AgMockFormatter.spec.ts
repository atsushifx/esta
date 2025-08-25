// src/plugins/formatter/__tests__/AgMockFormatter.spec.ts
// @(#) : BDD Tests for AgMockFormatter implementation
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it } from 'vitest';

// Import types and modules
import type { AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';
import { AgMockFormatter } from '../AgMockFormatter';

/**
 * BDD Tests for AgMockFormatter class implementation
 * Following atsushifx式BDD with Red-Green-Refactor cycles
 */
describe('Feature: AgMockFormatter統計機能', () => {
  let mockMessage: AgLogMessage;

  beforeEach(() => {
    mockMessage = {
      logLevel: 4 as AgLogLevel, // AG_LOGLEVEL.INFO
      timestamp: new Date('2025-01-01T12:00:00Z'),
      message: 'test message',
      args: [],
    };
  });

  describe('Feature: フォーマッタの呼び出し回数のカウント', () => {
    it('should increment callCount when execute is called', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Act
      formatter.execute(mockMessage);
      formatter.execute(mockMessage);

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(2);
    });

    it('should start with callCount as 0', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(0);
    });
  });

  describe('Feature: 最終メッセージの取得処理', () => {
    it('should store lastMessage when execute is called', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Act
      formatter.execute(mockMessage);

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toEqual(mockMessage);
    });

    it('should update lastMessage with the most recent message', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);
      const firstMessage = { ...mockMessage, message: 'first message' };
      const secondMessage = { ...mockMessage, message: 'second message' };

      // Act
      formatter.execute(firstMessage);
      formatter.execute(secondMessage);

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toEqual(secondMessage);
    });

    it('should start with lastMessage as null', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toBeNull();
    });
  });

  describe('Feature: 設定されたフォーマットルーチンの呼び出し', () => {
    it('should call the provided format routine and return its result', () => {
      // Arrange
      const customRoutine: AgFormatRoutine = (msg) => `CUSTOM: ${msg.message}`;
      const formatter = new AgMockFormatter(customRoutine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      expect(result).toBe('CUSTOM: test message');
    });

    it('should pass the correct message to the format routine', () => {
      // Arrange
      let receivedMessage: AgLogMessage | null = null;
      const spyRoutine: AgFormatRoutine = (msg) => {
        receivedMessage = msg;
        return msg.message;
      };
      const formatter = new AgMockFormatter(spyRoutine);

      // Act
      formatter.execute(mockMessage);

      // Assert
      expect(receivedMessage).toEqual(mockMessage);
    });

    it('should handle JSON format routine correctly', () => {
      // Arrange
      const jsonRoutine: AgFormatRoutine = (msg) =>
        JSON.stringify({
          timestamp: msg.timestamp.toISOString(),
          logLevel: msg.logLevel,
          message: msg.message,
          ...(msg.args.length > 0 && { args: msg.args }),
        });
      const formatter = new AgMockFormatter(jsonRoutine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      const parsed = JSON.parse(result as string);
      expect(parsed.message).toBe('test message');
      expect(parsed.logLevel).toBe(4);
      expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
    });

    it('should handle passthrough routine correctly', () => {
      // Arrange
      const passthroughRoutine: AgFormatRoutine = (msg) => msg;
      const formatter = new AgMockFormatter(passthroughRoutine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      expect(result).toEqual(mockMessage);
    });
  });

  describe('Feature: reset()でstatsのクリア処理', () => {
    it('should reset callCount to 0', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);
      formatter.execute(mockMessage);
      formatter.execute(mockMessage);

      // Act
      formatter.reset();

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(0);
    });

    it('should reset lastMessage to null', () => {
      // Arrange
      const messageOnlyRoutine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(messageOnlyRoutine);
      formatter.execute(mockMessage);

      // Act
      formatter.reset();

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toBeNull();
    });
  });

  describe('Feature: AgMockConstructor interface compliance', () => {
    it('should have __isMockConstructor property set to true', () => {
      // Assert
      expect(AgMockFormatter.__isMockConstructor).toBe(true);
    });

    it('should be instantiable with AgFormatRoutine', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => msg.message;

      // Act & Assert
      expect(() => new AgMockFormatter(routine)).not.toThrow();
    });

    it('should provide execute method that returns formatted message', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => `formatted: ${msg.message}`;
      const formatter = new AgMockFormatter(routine);

      // Act
      const result = formatter.execute(mockMessage);

      // Assert
      expect(typeof formatter.execute).toBe('function');
      expect(result).toBe('formatted: test message');
    });

    it('should provide getStats method that returns statistics object', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(routine);

      // Act
      const stats = formatter.getStats();

      // Assert
      expect(typeof formatter.getStats).toBe('function');
      expect(stats).toHaveProperty('callCount');
      expect(stats).toHaveProperty('lastMessage');
      expect(typeof stats.callCount).toBe('number');
    });

    it('should provide reset method', () => {
      // Arrange
      const routine: AgFormatRoutine = (msg) => msg.message;
      const formatter = new AgMockFormatter(routine);

      // Assert
      expect(typeof formatter.reset).toBe('function');
      expect(() => formatter.reset()).not.toThrow();
    });
  });

  describe('Feature: ErrorThrowルーチンでのエラー処理', () => {
    it('should throw error when error routine is provided', () => {
      // Arrange
      const errorRoutine: AgFormatRoutine = (_msg): never => {
        throw new Error('Test error from routine');
      };
      const formatter = new AgMockFormatter(errorRoutine);

      // Act & Assert
      expect(() => formatter.execute(mockMessage)).toThrow('Test error from routine');
    });

    it('should still increment callCount even when error is thrown', () => {
      // Arrange
      const errorRoutine: AgFormatRoutine = (_msg): never => {
        throw new Error('Test error');
      };
      const formatter = new AgMockFormatter(errorRoutine);

      // Act
      try {
        formatter.execute(mockMessage);
      } catch {
        // Expected error
      }

      // Assert
      const stats = formatter.getStats();
      expect(stats.callCount).toBe(1);
    });

    it('should still store lastMessage even when error is thrown', () => {
      // Arrange
      const errorRoutine: AgFormatRoutine = (_msg): never => {
        throw new Error('Test error');
      };
      const formatter = new AgMockFormatter(errorRoutine);

      // Act
      try {
        formatter.execute(mockMessage);
      } catch {
        // Expected error
      }

      // Assert
      const stats = formatter.getStats();
      expect(stats.lastMessage).toEqual(mockMessage);
    });
  });
});
