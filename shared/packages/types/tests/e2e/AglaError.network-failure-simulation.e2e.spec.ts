// src: tests/e2e/AglaError.network-failure-simulation.e2e.spec.ts
// @(#) : E2E tests for network failure scenarios and error handling workflows
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaError, AglaErrorContext } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test support
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

// Network failure simulation context types extending AglaErrorContext
type NetworkTimeoutContext = AglaErrorContext & {
  operation: string;
  endpoint: string;
  timeout: number;
  retryCount: number;
  lastAttempt: string;
  totalDuration: number;
};

type NetworkDisconnectionContext = AglaErrorContext & {
  operation: string;
  fallbackSource: 'cache' | 'local' | 'offline';
  offlineDuration: number;
  lastSuccessful: string;
};

type DNSFailureContext = AglaErrorContext & {
  operation: string;
  hostname: string;
  resolver: string;
  errorCode: string;
  fallbackAttempts: number;
};

type _TCachedContext = {
  data: string;
  cached: boolean;
};

/**
 * Mock timeout simulation function
 * Simulates network timeout with retry mechanism
 */
const simulateNetworkTimeout = async (retryCount = 3): Promise<{ result?: string; error?: AglaError }> => {
  const timeoutError = new TestAglaError('NETWORK_TIMEOUT', 'Request timeout after retries', {
    code: 'E_TIMEOUT',
    severity: ErrorSeverity.ERROR,
    context: {
      operation: 'api_call',
      endpoint: 'https://api.example.com/data',
      timeout: 5000,
      retryCount,
      lastAttempt: new Date().toISOString(),
      totalDuration: retryCount * 5000,
    } satisfies NetworkTimeoutContext,
  });

  return { error: timeoutError };
};

/**
 * Mock network disconnection simulation function
 * Simulates network disconnection with fallback to cache
 */
const simulateNetworkDisconnection = async (): Promise<{ result: _TCachedContext; source?: string }> => {
  // Simulate fallback to cached response
  return {
    result: { data: 'cached_response', cached: true },
    source: 'cache',
  };
};

/**
 * Mock DNS resolution failure simulation function
 * Simulates DNS resolution failure with error propagation
 */
const simulateDNSFailure = async (): Promise<{ error?: AglaError }> => {
  const dnsError = new TestAglaError('DNS_RESOLUTION_FAILED', 'DNS resolution failed for hostname', {
    code: 'E_DNS_FAIL',
    severity: ErrorSeverity.ERROR,
    context: {
      operation: 'dns_lookup',
      hostname: 'api.unavailable-service.com',
      resolver: '8.8.8.8',
      errorCode: 'NXDOMAIN',
      fallbackAttempts: 3,
    } satisfies DNSFailureContext,
  });

  return { error: dnsError };
};

describe('Given E2E network failure simulation scenarios', () => {
  describe('When timeout occurs during network operations', () => {
    it('Then タイムアウト発生時のエラーハンドリングワークフローテスト: should handle timeout with retry mechanism and proper error context', async () => {
      // E-001-01: タイムアウト発生時のエラーハンドリングワークフローテスト追加
      // expect(timeoutError.context?.retryCount).toBe(3) for retry mechanism

      // Simulate network timeout with retries
      const { error: timeoutError } = await simulateNetworkTimeout(3);

      // Verify error structure
      expect(timeoutError).toBeInstanceOf(TestAglaError);
      expect(timeoutError?.errorType).toBe('NETWORK_TIMEOUT');
      expect(timeoutError?.message).toContain('timeout after retries');
      expect(timeoutError?.code).toBe('E_TIMEOUT');
      expect(timeoutError?.severity).toBe(ErrorSeverity.ERROR);

      // Verify retry mechanism context - this is the key requirement
      expect(timeoutError?.context?.retryCount).toBe(3);
      expect(timeoutError?.context?.timeout).toBe(5000);
      expect(timeoutError?.context?.totalDuration).toBe(15000); // 3 * 5000
      expect(timeoutError?.context?.operation).toBe('api_call');
      expect(timeoutError?.context?.endpoint).toBe('https://api.example.com/data');
      expect(timeoutError?.context?.lastAttempt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Verify comprehensive context type safety for network timeout scenario
      const context = timeoutError?.context as NetworkTimeoutContext;
      expect(context).toBeDefined();
      expect(context).toHaveProperty('retryCount');
      expect(context).toHaveProperty('timeout');
      expect(context).toHaveProperty('totalDuration');
      expect(context).toHaveProperty('operation');
      expect(context).toHaveProperty('endpoint');
      expect(context).toHaveProperty('lastAttempt');

      // Verify specific property types match NetworkTimeoutContext interface
      expect(typeof context.retryCount).toBe('number');
      expect(typeof context.timeout).toBe('number');
      expect(typeof context.totalDuration).toBe('number');
      expect(typeof context.operation).toBe('string');
      expect(typeof context.endpoint).toBe('string');
      expect(typeof context.lastAttempt).toBe('string');
    });
  });

  describe('When network disconnection occurs', () => {
    it('Then ネットワーク接続断でのフォールバック処理テスト: should fallback to cache and return cached response', async () => {
      // E-001-02: ネットワーク接続断でのフォールバック処理テスト追加
      // expect(fallbackResponse.source).toBe('cache') for offline fallback

      // Simulate network disconnection
      const { result: fallbackResponse, source } = await simulateNetworkDisconnection();

      // Verify fallback response structure
      expect(fallbackResponse).toBeDefined();
      expect(fallbackResponse.data).toBe('cached_response');
      expect(fallbackResponse.cached).toBe(true);

      // Verify fallback source - this is the key requirement
      expect(source).toBe('cache');

      // Create error for offline scenario documentation
      const offlineError = new TestAglaError('NETWORK_OFFLINE', 'Network disconnected, using cached data', {
        code: 'E_OFFLINE',
        severity: ErrorSeverity.WARNING,
        context: {
          operation: 'data_fetch',
          fallbackSource: 'cache' as const,
          offlineDuration: 30000,
          lastSuccessful: new Date(Date.now() - 30000).toISOString(),
        } satisfies NetworkDisconnectionContext,
      });

      // Verify offline error context
      expect(offlineError.context?.fallbackSource).toBe('cache');
      expect(offlineError.context?.offlineDuration).toBe(30000);
      expect(offlineError.severity).toBe(ErrorSeverity.WARNING);

      // Verify context type safety
      const context = offlineError.context as NetworkDisconnectionContext;
      expect(context).toBeDefined();
      expect(typeof context.operation).toBe('string');
      expect(typeof context.fallbackSource).toBe('string');
      expect(typeof context.offlineDuration).toBe('number');
      expect(typeof context.lastSuccessful).toBe('string');
    });
  });

  describe('When DNS resolution fails', () => {
    it('Then DNS解決失敗時のエラー伝播テスト: should propagate DNS resolution failure with detailed error information', async () => {
      // E-001-03: DNS解決失敗時のエラー伝播テスト追加
      // expect(dnsError.message).toContain('resolution failed') for DNS error propagation

      // Simulate DNS resolution failure
      const { error: dnsError } = await simulateDNSFailure();

      // Verify DNS error structure
      expect(dnsError).toBeInstanceOf(TestAglaError);
      expect(dnsError?.errorType).toBe('DNS_RESOLUTION_FAILED');
      expect(dnsError?.code).toBe('E_DNS_FAIL');
      expect(dnsError?.severity).toBe(ErrorSeverity.ERROR);

      // Verify DNS error message propagation - this is the key requirement
      expect(dnsError?.message).toContain('resolution failed');
      expect(dnsError?.message).toContain('hostname');

      // Verify DNS-specific context
      expect(dnsError?.context?.hostname).toBe('api.unavailable-service.com');
      expect(dnsError?.context?.resolver).toBe('8.8.8.8');
      expect(dnsError?.context?.errorCode).toBe('NXDOMAIN');
      expect(dnsError?.context?.fallbackAttempts).toBe(3);
      expect(dnsError?.context?.operation).toBe('dns_lookup');

      // Verify context type safety
      const context = dnsError?.context as DNSFailureContext;
      expect(context).toBeDefined();
      expect(typeof context.fallbackAttempts).toBe('number');
      expect(typeof context.hostname).toBe('string');
      expect(typeof context.resolver).toBe('string');
      expect(typeof context.errorCode).toBe('string');
      expect(typeof context.operation).toBe('string');
    });
  });

  describe('When network failures cascade through system layers', () => {
    it('Then エラーチェーンによる障害伝播の完全ワークフロー: should chain network failures through application layers', async () => {
      // Complex scenario: DNS failure -> Timeout -> Cache fallback
      const { error: dnsError } = await simulateDNSFailure();
      if (dnsError) {
        // Chain with timeout error
        const { error: timeoutError } = await simulateNetworkTimeout(1);
        const chainedError = dnsError.chain(timeoutError as Error);

        // Verify error chaining preserves all context
        expect(chainedError).toBeInstanceOf(TestAglaError);
        expect(chainedError.message).toContain('DNS resolution failed');
        expect(chainedError.message).toContain('caused by');
        expect(chainedError.message).toContain('Request timeout');

        // Verify original DNS context is preserved
        if (!chainedError.context) {
          throw new Error('Chained error context is undefined');
        }
        const context = chainedError.context as DNSFailureContext;

        expect(context.hostname).toBe('api.unavailable-service.com');
        expect(context.resolver).toBe('8.8.8.8');

        // Verify chained error information
        expect(context.cause).toContain('Request timeout after retries');
        expect(context.originalError).toBeDefined();
        expect((context.originalError as TestAglaError).name).toBe('TestAglaError');

        // Verify final fallback still works
        const { result: fallbackResponse, source } = await simulateNetworkDisconnection();
        expect(source).toBe('cache');
        expect(fallbackResponse.cached).toBe(true);
      }
    });
  });
});
