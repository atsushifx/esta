// src: packages/@esta-utils/command-runner/src/__tests__/runCommand.spec.ts
// @(#) : Test for command execution utility
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
import { runCommand } from '../runCommand';

// Mock dependencies
vi.mock('child_process');
vi.mock('@esta-utils/get-platform');

const mockSpawn = vi.mocked(spawn);
const mockGetPlatform = vi.mocked(getPlatform);

describe('runCommand', () => {
  let mockProcess: EventEmitter;

  beforeEach(() => {
    mockProcess = new EventEmitter();
    mockSpawn.mockReturnValue(mockProcess as ChildProcess);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('basic functionality', () => {
    beforeEach(() => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);
    });

    it('should execute command without arguments', async () => {
      const promise = runCommand('echo');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`echo`'], { stdio: 'ignore' });
    });

    it('should execute command with single argument', async () => {
      const promise = runCommand('echo', ['hello']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`echo "hello"`'], { stdio: 'ignore' });
    });

    it('should execute command with multiple arguments', async () => {
      const promise = runCommand('ls', ['-la', '/tmp']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`ls "-la" "/tmp"`'], { stdio: 'ignore' });
    });

    it('should handle empty arguments array', async () => {
      const promise = runCommand('pwd', []);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`pwd`'], { stdio: 'ignore' });
    });

    it('should use default empty arguments when not provided', async () => {
      const promise = runCommand('pwd');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`pwd`'], { stdio: 'ignore' });
    });
  });

  describe('platform-specific behavior', () => {
    it('should use cmd /c on Windows', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.WINDOWS);

      const promise = runCommand('dir', ['C:\\'], PLATFORM_TYPE.WINDOWS);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('cmd', ['/c', '`dir "C:\\"`'], { stdio: 'ignore' });
    });

    it('should use sh -c on Linux', async () => {
      const promise = runCommand('ls', ['-la'], PLATFORM_TYPE.LINUX);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`ls "-la"`'], { stdio: 'ignore' });
    });

    it('should use sh -c on macOS', async () => {
      const promise = runCommand('ls', ['-la'], PLATFORM_TYPE.MACOS);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`ls "-la"`'], { stdio: 'ignore' });
    });

    it('should use sh -c on unknown platform', async () => {
      const promise = runCommand('ls', ['-la'], PLATFORM_TYPE.UNKNOWN);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`ls "-la"`'], { stdio: 'ignore' });
    });

    it('should auto-detect platform when not specified', async () => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.WINDOWS);

      const promise = runCommand('echo', ['test']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockGetPlatform).toHaveBeenCalled();
      expect(mockSpawn).toHaveBeenCalledWith('cmd', ['/c', '`echo "test"`'], { stdio: 'ignore' });
    });
  });

  describe('exit codes and error handling', () => {
    beforeEach(() => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);
    });

    it('should return 0 on successful command execution', async () => {
      const promise = runCommand('echo', ['success']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
    });

    it('should return non-zero exit code on command failure', async () => {
      const promise = runCommand('false');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 10);

      const result = await promise;
      expect(result).toBe(1);
    });

    it('should return 1 when exit code is null', async () => {
      const promise = runCommand('echo', ['test']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', null);
      }, 10);

      const result = await promise;
      expect(result).toBe(1);
    });

    it('should return 1 on spawn error', async () => {
      const promise = runCommand('nonexistent-command');

      globalThis.setTimeout(() => {
        mockProcess.emit('error', new Error('spawn error'));
      }, 10);

      const result = await promise;
      expect(result).toBe(1);
    });

    it('should handle various exit codes', async () => {
      const testCases = [0, 1, 2, 127, 255];

      for (const exitCode of testCases) {
        const promise = runCommand('exit', [exitCode.toString()]);

        globalThis.setTimeout(() => {
          mockProcess.emit('close', exitCode);
        }, 10);

        const result = await promise;
        expect(result).toBe(exitCode);
      }
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockGetPlatform.mockReturnValue(PLATFORM_TYPE.LINUX);
    });

    it('should handle empty command string', async () => {
      const promise = runCommand('');

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 10);

      const result = await promise;
      expect(result).toBe(1);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '``'], { stdio: 'ignore' });
    });

    it('should handle commands with spaces', async () => {
      const promise = runCommand('my command', ['with', 'args']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`my command "with" "args"`'], { stdio: 'ignore' });
    });

    it('should handle arguments with spaces', async () => {
      const promise = runCommand('echo', ['hello world', 'test args']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`echo "hello world" "test args"`'], { stdio: 'ignore' });
    });

    it('should handle special characters in arguments', async () => {
      const promise = runCommand('echo', ['$HOME', '&&', 'echo', 'test']);

      globalThis.setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      const result = await promise;
      expect(result).toBe(0);
      expect(mockSpawn).toHaveBeenCalledWith('sh', ['-c', '`echo "$HOME" "&&" "echo" "test"`'], { stdio: 'ignore' });
    });
  });
});
