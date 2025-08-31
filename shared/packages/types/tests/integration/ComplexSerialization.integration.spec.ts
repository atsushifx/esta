// src: tests/integration/ComplexSerialization.integration.spec.ts
// @(#) : AglaError 複雑シリアライゼーション統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// Type definitions
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// I-004 グループ: 複雑シリアライゼーション統合
describe('Given complex serialization integration', () => {
  describe('When performing JSON round-trip', () => {
    it('Then 正常系：should maintain round-trip consistency (I-004-01)', () => {
      // Arrange
      const timestamp = new Date('2025-09-01T00:00:00.000Z');
      const error = new TestAglaError('ROUND_TRIP', 'Round trip test', {
        code: 'RT001',
        severity: ErrorSeverity.INFO,
        timestamp,
        context: { a: 1, b: 'two', nested: { ok: true } },
      });

      // Act
      const originalJson = error.toJSON();
      const roundTripped = JSON.parse(JSON.stringify(originalJson));

      // Assert
      expect(roundTripped).toEqual({
        errorType: 'ROUND_TRIP',
        message: 'Round trip test',
        code: 'RT001',
        severity: ErrorSeverity.INFO,
        timestamp: timestamp.toISOString(),
        context: { a: 1, b: 'two', nested: { ok: true } },
      });
      expect(roundTripped).toEqual(originalJson);
    });

    it('Then 異常系：should handle multiple format conversion', () => {
      // Arrange
      const error = new TestAglaError('MULTI_FORMAT', 'Multi format test', {
        code: 'MF001',
        severity: ErrorSeverity.ERROR,
        context: { format: 'multi', conversion: true },
      });

      // Act: 複数フォーマット間変換をシミュレート
      const jsonFormat = error.toJSON();
      const xmlFormat = `<error><errorType>${error.errorType}</errorType><message>${error.message}</message></error>`;
      const stringFormat = error.toString();

      // Assert
      expect(xmlFormat).toContain(error.errorType);
      expect(xmlFormat).toContain(error.message);
      expect(stringFormat).toContain(error.errorType);
      expect(stringFormat).toContain(error.message);
      expect(jsonFormat.errorType).toBe('MULTI_FORMAT');
    });

    it('Then エッジケース：should support streaming serialization', () => {
      // Arrange
      const largeContext = {
        data: new Array(1000).fill('streaming-data'),
        metadata: { size: 1000, type: 'stream' },
      };
      const error = new TestAglaError('STREAMING_TEST', 'Streaming serialization test', {
        context: largeContext,
      });

      // Act: ストリーミングシリアライゼーションをシミュレート
      const json = JSON.stringify(error.toJSON());
      const chunks: string[] = [];
      const chunkSize = 100;

      for (let i = 0; i < json.length; i += chunkSize) {
        chunks.push(json.slice(i, i + chunkSize));
      }

      const streamedResult = chunks.join('');

      // Assert
      expect(streamedResult).toBe(json);
      expect(streamedResult).toContain(error.message);
      expect(chunks.length).toBeGreaterThan(1); // 複数チャンクに分割されている
      expect(JSON.parse(streamedResult)).toEqual(error.toJSON());
    });
  });
});
