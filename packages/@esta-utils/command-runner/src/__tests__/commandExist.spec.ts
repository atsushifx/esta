// src: packages/@esta-utils/command-runner/src/__tests__/commandExist.spec.ts
// @(#) : Test for command existence checking utility
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// internal modules
import { getPlatform, PLATFORM_TYPE } from '@esta-utils/get-platform';
import { EXIT_CODE } from '@shared/constants';
// test target
import { commandExist } from '../commandExist';
import { runCommand } from '../runCommand';

// Mock dependencies
vi.mock('@esta-utils/get-platform');
vi.mock('../runCommand');

const mockGetPlatform = vi.mocked(getPlatform);
const mockRunCommand = vi.mocked(runCommand);

describe('commandExist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Windows platform', () => {
    beforeEach(() => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.WINDOWS);
    });

    it('should return true when command exists on Windows', async () => {
      mockRunCommand.mockResolvedValue(EXIT_CODE.SUCCESS);

      const result = await commandExist('node');
      expect(result).toBe(true);
      expect(mockRunCommand).toHaveBeenCalledWith('where', ['node'], PLATFORM_TYPE.WINDOWS);
    });

    it('should return false when command does not exist on Windows', async () => {
      mockRunCommand.mockResolvedValue(EXIT_CODE.EXEC_FAILURE);

      const result = await commandExist('nonexistent-command');
      expect(result).toBe(false);
      expect(mockRunCommand).toHaveBeenCalledWith('where', ['nonexistent-command'], PLATFORM_TYPE.WINDOWS);
    });

    it('should return false when spawn error occurs on Windows', async () => {
      mockRunCommand.mockResolvedValue(EXIT_CODE.EXEC_FAILURE);

      const result = await commandExist('test-command');
      expect(result).toBe(false);
    });
  });

  describe('Linux/macOS platform', () => {
    beforeEach(() => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);
    });

    it('should return true when command exists on Linux', async () => {
      mockRunCommand.mockResolvedValue(EXIT_CODE.SUCCESS);

      const result = await commandExist('ls');
      expect(result).toBe(true);
      expect(mockRunCommand).toHaveBeenCalledWith('command', ['-v', 'ls'], PLATFORM_TYPE.LINUX);
    });

    it('should return false when command does not exist on Linux', async () => {
      mockRunCommand.mockResolvedValue(EXIT_CODE.EXEC_FAILURE);

      const result = await commandExist('nonexistent-command');
      expect(result).toBe(false);
      expect(mockRunCommand).toHaveBeenCalledWith('command', ['-v', 'nonexistent-command'], PLATFORM_TYPE.LINUX);
    });

    it('should return false when spawn error occurs on Linux', async () => {
      mockRunCommand.mockResolvedValue(EXIT_CODE.EXEC_FAILURE);

      const result = await commandExist('test-command');
      expect(result).toBe(false);
    });

    it('should work with macOS platform', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.MACOS);
      mockRunCommand.mockResolvedValue(EXIT_CODE.SUCCESS);

      const result = await commandExist('ls');
      expect(result).toBe(true);
      expect(mockRunCommand).toHaveBeenCalledWith('command', ['-v', 'ls'], PLATFORM_TYPE.MACOS);
    });
  });

  describe('edge cases', () => {
    it('should handle empty command string', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);
      mockRunCommand.mockResolvedValue(EXIT_CODE.EXEC_FAILURE);

      const result = await commandExist('');
      expect(result).toBe(false);
      expect(mockRunCommand).toHaveBeenCalledWith('command', ['-v', ''], PLATFORM_TYPE.LINUX);
    });

    it('should handle commands with spaces', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.WINDOWS);
      mockRunCommand.mockResolvedValue(EXIT_CODE.SUCCESS);

      const result = await commandExist('my command');
      expect(result).toBe(true);
      expect(mockRunCommand).toHaveBeenCalledWith('where', ['my command'], PLATFORM_TYPE.WINDOWS);
    });

    it('should handle unknown platform as Linux', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.UNKNOWN);
      mockRunCommand.mockResolvedValue(EXIT_CODE.SUCCESS);

      const result = await commandExist('ls');
      expect(result).toBe(true);
      expect(mockRunCommand).toHaveBeenCalledWith('command', ['-v', 'ls'], PLATFORM_TYPE.UNKNOWN);
    });
  });
});
