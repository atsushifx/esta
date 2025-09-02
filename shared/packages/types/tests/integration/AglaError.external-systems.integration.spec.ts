// src: tests/integration/AglaError.external-systems.integration.spec.ts
// @(#) : AglaError 外部システム連携テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// Type definitions
import type { AglaError } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

/**
 * Phase 2: Mock Integration Tests (E2E-I001~I999)
 * Tests AglaError integration with mocked external systems
 * Following atsushifx式 BDD methodology
 */

// Mock implementations for external systems
const mockFs = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
};

const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  request: vi.fn(),
};

const mockCore = {
  setFailed: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

// Helper functions to simulate external system operations
const handleFileOperation = async (
  filePath: string,
  options?: { fs?: typeof mockFs },
): Promise<{ error?: AglaError; result?: unknown }> => {
  const fs = options?.fs ?? mockFs;

  try {
    const result = await fs.readFile(filePath, 'utf8');
    return { result };
  } catch (cause) {
    const error = new TestAglaError('FILE_READ_ERROR', `Failed to read file: ${filePath}`, {
      severity: ErrorSeverity.ERROR,
      context: {
        filePath,
        systemCode: (cause as { code?: string }).code,
        operation: 'readFile',
      },
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
    const result = await http.get(url);
    return { result };
  } catch (cause) {
    const error = new TestAglaError('HTTP_REQUEST_ERROR', `HTTP request failed: ${url}`, {
      severity: ErrorSeverity.ERROR,
      context: {
        url,
        method: 'GET',
        cause: (cause as Error).message,
      },
    });
    return { error };
  }
};

const handleGitHubActionsError = (aglaError: AglaError, core?: typeof mockCore): void => {
  const coreModule = core ?? mockCore;

  // Format error message for GitHub Actions
  const actionMessage = `${aglaError.errorType}: ${aglaError.message}`;
  const errorCode = aglaError.code ?? 'GA001';

  // Set the action as failed
  coreModule.setFailed(actionMessage);

  // Add error annotation
  coreModule.error(`Error Code: ${errorCode} - ${aglaError.message}`);

  // Add context if available
  if (aglaError.context) {
    coreModule.info(`Context: ${JSON.stringify(aglaError.context)}`);
  }
};

describe('Given AglaError integration with mocked external systems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('When handling file system errors', () => {
    it('Then should wrap fs errors correctly', async () => {
      // Arrange - E2E-I203a: Mock fs error with code: 'ENOENT'
      const fsError = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' });
      mockFs.readFile.mockRejectedValue(fsError);

      // Act - E2E-I203c: Execute file operation
      const result = await handleFileOperation('/nonexistent/file.json', { fs: mockFs });

      // Assert - E2E-I203d,e,f: Verify error wrapping
      expect(result.error).toBeInstanceOf(TestAglaError);
      expect(result.error!.context?.systemCode).toBe('ENOENT');
      expect(result.error!.errorType).toBe('FILE_READ_ERROR');
    });

    it('Then should handle permission errors appropriately', async () => {
      // Arrange - E2E-I211a: Mock fs error with code: 'EACCES'
      const permissionError = Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
      mockFs.readFile.mockRejectedValue(permissionError);

      // Act - E2E-I211b: Execute file operation with permission denied
      const result = await handleFileOperation('/protected/file.json', { fs: mockFs });

      // Assert - E2E-I211c,d: Verify error wrapping and context
      expect(result.error).toBeInstanceOf(TestAglaError);
      expect(result.error!.context?.systemCode).toBe('EACCES');
      expect(result.error!.severity).toBe(ErrorSeverity.ERROR);
      expect(result.error!.context?.filePath).toBe('/protected/file.json');
    });
  });

  describe('When handling network errors', () => {
    it('Then should wrap HTTP errors appropriately', async () => {
      // Arrange - E2E-I302a: Create mockHttp with E-CONN-REFUSED error
      const networkError = new Error('ECONNREFUSED: Connection refused');
      mockHttp.get.mockRejectedValue(networkError);

      // Act - E2E-I302b: Execute HTTP request
      const result = await handleHttpRequest('https://example.com/api', { http: mockHttp });

      // Assert - E2E-I302c,d,e: Verify HTTP error wrapping
      expect(result.error).toBeInstanceOf(TestAglaError);
      expect(result.error!.severity).toBe(ErrorSeverity.ERROR);
      expect(result.error!.context?.url).toBe('https://example.com/api');
      expect(result.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });

    it('Then should handle timeout errors with context', async () => {
      // Arrange - E2E-I311a: Mock HTTP timeout error
      const timeoutError = Object.assign(new Error('Request timeout'), { code: 'ETIMEOUT' });
      mockHttp.get.mockRejectedValue(timeoutError);

      // Act
      const result = await handleHttpRequest('https://slow.example.com/api', { http: mockHttp });

      // Assert - E2E-I311b,c: Verify timeout-specific error context
      expect(result.error).toBeInstanceOf(TestAglaError);
      expect(result.error!.context?.url).toBe('https://slow.example.com/api');
      expect(result.error!.context?.cause).toContain('Request timeout');
    });
  });

  describe('When integrating with GitHub Actions', () => {
    it('Then should format errors for Actions output', () => {
      // Arrange - E2E-I402a,b: Create mock core and aglaError
      const aglaError = new TestAglaError('GITHUB_ACTION_ERROR', 'Action execution failed', {
        code: 'GA001',
        severity: ErrorSeverity.ERROR,
        context: { workflow: 'test-workflow', step: 'tool-installation' },
      });

      // Act - E2E-I402c: Execute GitHub Actions error handling
      handleGitHubActionsError(aglaError, mockCore);

      // Assert - E2E-I402d,e: Verify Actions output formatting
      expect(mockCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('GITHUB_ACTION_ERROR: Action execution failed'),
      );
      expect(mockCore.error).toHaveBeenCalledWith(
        expect.stringContaining('GA001'),
      );
    });

    it('Then should create appropriate annotations', () => {
      // Arrange - E2E-I411a,b,c: Test severity mapping and context inclusion
      const warningError = new TestAglaError('WARNING_ERROR', 'Non-critical issue', {
        severity: ErrorSeverity.WARNING,
        context: { component: 'test-runner', phase: 'setup' },
      });

      const errorError = new TestAglaError('CRITICAL_ERROR', 'Critical failure', {
        severity: ErrorSeverity.ERROR,
        context: { component: 'installer', phase: 'execution' },
      });

      // Act
      handleGitHubActionsError(warningError, mockCore);
      handleGitHubActionsError(errorError, mockCore);

      // Assert - Verify annotation format compliance
      expect(mockCore.setFailed).toHaveBeenCalledTimes(2);
      expect(mockCore.error).toHaveBeenCalledTimes(2);
      expect(mockCore.info).toHaveBeenCalledWith(
        expect.stringContaining('component'),
      );
    });
  });
});
