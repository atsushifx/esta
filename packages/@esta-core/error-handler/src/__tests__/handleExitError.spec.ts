import { ExitCode } from '@shared/constants/exitCode';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitError } from '../error/ExitError';

describe('handleExitError', () => {
  const mockSetFailed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GitHub Actions environment', () => {
    beforeEach(() => {
      // Mock modules for GitHub Actions environment
      vi.doMock('@actions/core', () => ({
        setFailed: mockSetFailed,
      }));
      vi.doMock('@esta-core/feature-flags', () => ({
        estaFeatures: {
          executionMode: 'GHA',
        },
        TEstaExecutionMode: {
          GITHUB_ACTIONS: 'GHA',
          CLI: 'CLI',
        },
      }));
    });

    it('should call core.setFailed for non-fatal error', async () => {
      const { handleExitError } = await import('../handleExitError');
      const error = new ExitError(ExitCode.INVALID_ARGS, 'Test error message', false);

      handleExitError(error);

      expect(mockSetFailed).toHaveBeenCalledWith('[ERROR 13] Test error message');
    });

    it('should call core.setFailed for fatal error', async () => {
      const { handleExitError } = await import('../handleExitError');
      const error = new ExitError(ExitCode.EXEC_FAILURE, 'Fatal error', true);

      handleExitError(error);

      expect(mockSetFailed).toHaveBeenCalledWith('[FATAL 1] Fatal error');
    });
  });
});
