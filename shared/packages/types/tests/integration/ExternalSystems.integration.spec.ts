// src: tests/integration/ExternalSystems.integration.spec.ts
// @(#): External systems integration tests (FS/HTTP/GitHub Actions)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Type definitions
import type { AglaError } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

const mockFs = { readFile: vi.fn(), writeFile: vi.fn(), access: vi.fn() };
const mockHttp = { get: vi.fn(), post: vi.fn(), request: vi.fn() };
const mockCore = { setFailed: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };

const handleFileOperation = async (
  filePath: string,
  options?: { fs?: typeof mockFs },
): Promise<{ error?: AglaError; result?: unknown }> => {
  const fs = options?.fs ?? mockFs;
  try {
    return { result: await fs.readFile(filePath, 'utf8') };
  } catch (cause) {
    const error = new TestAglaError('FILE_READ_ERROR', `Failed to read file: ${filePath}`, {
      severity: ErrorSeverity.ERROR,
      context: { filePath, systemCode: (cause as { code?: string }).code, operation: 'readFile' },
    });
    return { error };
  }
};

const handleHttpRequest = async (
  url: string,
  options?: { http?: typeof mockHttp },
): Promise<{ error?: AglaError; result?: unknown }> => {
  const http = options?.http ?? mockHttp;
  try {
    return { result: await http.get(url) };
  } catch (cause) {
    const error = new TestAglaError('HTTP_REQUEST_ERROR', `HTTP request failed: ${url}`, {
      severity: ErrorSeverity.ERROR,
      context: { url, method: 'GET', cause: (cause as Error).message },
    });
    return { error };
  }
};

const handleGitHubActionsError = (aglaError: AglaError, core = mockCore): void => {
  const actionMessage = `${aglaError.errorType}: ${aglaError.message}`;
  const errorCode = aglaError.code ?? 'GA001';
  core.setFailed(actionMessage);
  core.error(`Error Code: ${errorCode} - ${aglaError.message}`);
  if (aglaError.context) { core.info(`Context: ${JSON.stringify(aglaError.context)}`); }
};

/**
 * External systems integration tests
 * Tests AglaError integration with filesystem, HTTP, and GitHub Actions using mocks
 */
describe('External Systems Integration (mocked)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  /**
   * Filesystem integration scenarios
   */
  describe('Filesystem', () => {
    // Filesystem error wrapping: converts ENOENT to AglaError with system context
    it('wraps ENOENT errors with context', async () => {
      const fsError = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' });
      mockFs.readFile.mockRejectedValue(fsError);
      const res = await handleFileOperation('/nonexistent/file.json', { fs: mockFs });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.systemCode).toBe('ENOENT');
      expect(res.error!.errorType).toBe('FILE_READ_ERROR');
    });
  });

  /**
   * HTTP client integration scenarios
   */
  describe('HTTP', () => {
    // Network error handling: wraps connection failures with request context
    it('wraps network errors with url/method in context', async () => {
      const networkError = new Error('ECONNREFUSED: Connection refused');
      mockHttp.get.mockRejectedValue(networkError);
      const res = await handleHttpRequest('https://example.com/api', { http: mockHttp });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.url).toBe('https://example.com/api');
      expect(res.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });

    // Rate limiting: preserves HTTP 429 status information in error context
    it('handles rate limit (429) message propagation', async () => {
      const rateLimit = new Error('429 Too Many Requests');
      mockHttp.get.mockRejectedValue(rateLimit);
      const res = await handleHttpRequest('https://rate.example.com/api', { http: mockHttp });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.cause).toContain('429');
      expect(res.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });
  });

  /**
   * GitHub Actions integration scenarios
   */
  describe('GitHub Actions formatting', () => {
    // Actions annotation: formats AglaError for GitHub Actions output
    it('formats message and emits annotations', () => {
      const agla = new TestAglaError('GITHUB_ACTION_ERROR', 'Action execution failed', {
        code: 'GA001',
        severity: ErrorSeverity.ERROR,
        context: { workflow: 'test-workflow', step: 'tool-installation' },
      });
      handleGitHubActionsError(agla, mockCore);
      expect(mockCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('GITHUB_ACTION_ERROR'));
      expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining('GA001'));
      expect(mockCore.info).toHaveBeenCalled();
    });

    // Default error code: applies GA001 when no explicit code provided
    it('applies default error code when not provided (GA001)', () => {
      const agla = new TestAglaError('GITHUB_ACTION_ERROR', 'No code provided');
      handleGitHubActionsError(agla, mockCore);
      // 1回以上呼ばれていること
      expect(mockCore.error).toHaveBeenCalledWith(
        expect.stringContaining('GA001'),
      );
    });
  });
});
