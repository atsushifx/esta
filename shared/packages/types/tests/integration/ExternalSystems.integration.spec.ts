// src: tests/integration/ExternalSystems.integration.spec.ts
// @(#) : 外部システム（FS/HTTP/GitHub Actions相当）との最小統合テスト

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';
import type { AglaError } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

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

describe('External Systems Integration (mocked)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  describe('Filesystem', () => {
    it('wraps ENOENT errors with context', async () => {
      const fsError = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' });
      mockFs.readFile.mockRejectedValue(fsError);
      const res = await handleFileOperation('/nonexistent/file.json', { fs: mockFs });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.systemCode).toBe('ENOENT');
      expect(res.error!.errorType).toBe('FILE_READ_ERROR');
    });
  });

  describe('HTTP', () => {
    it('wraps network errors with url/method in context', async () => {
      const networkError = new Error('ECONNREFUSED: Connection refused');
      mockHttp.get.mockRejectedValue(networkError);
      const res = await handleHttpRequest('https://example.com/api', { http: mockHttp });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.url).toBe('https://example.com/api');
      expect(res.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });

    it('handles rate limit (429) message propagation', async () => {
      const rateLimit = new Error('429 Too Many Requests');
      mockHttp.get.mockRejectedValue(rateLimit);
      const res = await handleHttpRequest('https://rate.example.com/api', { http: mockHttp });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.cause).toContain('429');
      expect(res.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });
  });

  describe('GitHub Actions formatting', () => {
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
