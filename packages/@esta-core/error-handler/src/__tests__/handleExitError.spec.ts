// src: ./__tests__/handleExitError.spec.ts
// @(#): handleExitError関数のユニットテスチE//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { EXIT_CODE } from '@shared/constants';
// test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// modules
import { initEstaFeatures, TEstaExecutionMode } from '@esta-core/feature-flags';
// classes
import { ExitError } from '../error/ExitError';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  setFailed: vi.fn(),
}));

// test target
import { handleExitError } from '../handleExitError';

describe('handleExitError', () => {
  const mockProcessExit = vi.fn() as unknown as (code?: string | number | null | undefined) => never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GitHub Actions environment', () => {
    beforeEach(() => {
      // Set GitHub Actions execution mode
      initEstaFeatures(TEstaExecutionMode.GITHUB_ACTIONS);
    });

    it('should call core.setFailed for non-fatal error', async () => {
      const error = new ExitError(EXIT_CODE.INVALID_ARGS, 'Test error message', false);
      const core = await import('@actions/core');

      handleExitError(error);

      expect(core.setFailed).toHaveBeenCalledWith('[ERROR 13] Test error message');
    });

    it('should call core.setFailed for fatal error', async () => {
      const error = new ExitError(EXIT_CODE.EXEC_FAILURE, 'Fatal error', true);
      const core = await import('@actions/core');

      handleExitError(error);

      expect(core.setFailed).toHaveBeenCalledWith('[FATAL 1] Fatal error');
    });
  });

  describe('CLI environment', () => {
    beforeEach(() => {
      // Set CLI execution mode
      initEstaFeatures(TEstaExecutionMode.CLI);

      // Mock process.exit
      vi.spyOn(process, 'exit').mockImplementation(mockProcessExit);
    });

    it('should call process.exit for non-fatal error', () => {
      const error = new ExitError(EXIT_CODE.INVALID_ARGS, 'CLI error message', false);

      handleExitError(error);

      expect(mockProcessExit).toHaveBeenCalledWith(EXIT_CODE.INVALID_ARGS);
    });

    it('should call process.exit for fatal error', () => {
      const error = new ExitError(EXIT_CODE.EXEC_FAILURE, 'Fatal CLI error', true);

      handleExitError(error);

      expect(mockProcessExit).toHaveBeenCalledWith(EXIT_CODE.EXEC_FAILURE);
    });

    it('should call process.exit with correct code for SUCCESS', () => {
      const error = new ExitError(EXIT_CODE.SUCCESS, 'Success message', false);

      handleExitError(error);

      expect(mockProcessExit).toHaveBeenCalledWith(EXIT_CODE.SUCCESS);
    });

    it('should call process.exit with correct code for UNKNOWN_ERROR', () => {
      const error = new ExitError(EXIT_CODE.UNKNOWN_ERROR, 'Unknown error', true);

      handleExitError(error);

      expect(mockProcessExit).toHaveBeenCalledWith(EXIT_CODE.UNKNOWN_ERROR);
    });
  });
});
