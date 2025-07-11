// src: packages/@esta-utils/command-runner/src/__tests__/commandExist.spec.ts
// @(#) : Test for command existence checking utility
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// libs
import { type ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
// internal modules
import { getPlatform, PLATFORM_TYPE } from '@esta-utils/get-platform';
// test target
import { commandExist } from '../commandExist';

// Mock dependencies
vi.mock('child_process');
vi.mock('@esta-utils/get-platform');

const mockSpawn = vi.mocked(spawn);
const mockGetPlatform = vi.mocked(getPlatform);

describe('commandExist', () => {
  let mockProcess: EventEmitter;

  beforeEach(() => {
    mockProcess = new EventEmitter();
    mockSpawn.mockReturnValue(mockProcess as ChildProcess);
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
      const promise = commandExist('node');

      // Simulate successful command
      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('cmd', ['/c', 'where node'], { stdio: 'ignore' });
    });

    it('should return false when command does not exist on Windows', async () => {
      const promise = commandExist('nonexistent-command');

      // Simulate command not found
      globalThis.setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith('cmd', ['/c', 'where nonexistent-command'], { stdio: 'ignore' });
    });

    it('should return false when spawn error occurs on Windows', async () => {
      const promise = commandExist('test-command');

      // Simulate spawn error
      globalThis.setTimeout(() => {
        mockProcess.emit('error', new Error('spawn error'));
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
    });
  });

  describe('Linux/macOS platform', () => {
    beforeEach(() => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);
    });

    it('should return true when command exists on Linux', async () => {
      const promise = commandExist('ls');

      // Simulate successful command
      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', 'command -v ls'], { stdio: 'ignore' });
    });

    it('should return false when command does not exist on Linux', async () => {
      const promise = commandExist('nonexistent-command');

      // Simulate command not found
      globalThis.setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', 'command -v nonexistent-command'], { stdio: 'ignore' });
    });

    it('should return false when spawn error occurs on Linux', async () => {
      const promise = commandExist('test-command');

      // Simulate spawn error
      globalThis.setTimeout(() => {
        mockProcess.emit('error', new Error('spawn error'));
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
    });

    it('should work with macOS platform', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.MACOS);

      const promise = commandExist('ls');

      // Simulate successful command
      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', 'command -v ls'], { stdio: 'ignore' });
    });
  });

  describe('edge cases', () => {
    it('should handle empty command string', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);

      const promise = commandExist('');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 10);

      const result = await promise;
      expect(result).toBe(false);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', 'command -v '], { stdio: 'ignore' });
    });

    it('should handle commands with spaces', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.WINDOWS);

      const promise = commandExist('my command');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('cmd', ['/c', 'where my command'], { stdio: 'ignore' });
    });

    it('should handle unknown platform as Linux', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.UNKNOWN);

      const promise = commandExist('ls');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', 'command -v ls'], { stdio: 'ignore' });
    });
  });
});
