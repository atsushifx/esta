// src: tests/e2e/AglaError.filesystem-failure-simulation.e2e.spec.ts
// @(#) : E2E tests for filesystem failure scenarios in AglaError
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Node.js modules for file system operations
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Type definitions
import type { AglaErrorContext } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError Filesystem Failure Simulation E2E Test Suite
 * Tests real filesystem failure scenarios and error handling workflows
 * Following atsushifx式 BDD methodology with filesystem interaction
 */

// Test context type for filesystem scenarios
type FilesystemTestContext = AglaErrorContext & {
  availableSpace?: number;
  requestedSpace?: number;
  filePath?: string;
  alternativePath?: string;
  lockOwner?: string;
  lockTimeout?: number;
  permissions?: string;
  requiredPermissions?: string;
  operation?: string;
  retryCount?: number;
};

describe('Given filesystem failure simulation scenarios', () => {
  let testTempDir: string;

  beforeEach(async () => {
    // Create unique temporary directory for each test
    testTempDir = join(tmpdir(), `agla-error-fs-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(testTempDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testTempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('When handling disk space exhaustion scenarios', () => {
    // E-003-01
    it('Then should handle disk space insufficient error with monitoring context', async () => {
      // Arrange - Simulate disk space monitoring
      const testFilePath = join(testTempDir, 'large-file.txt');
      const requestedSizeValue = 1000000000; // 1GB
      const availableSpace = 0; // No space available

      // Simulate space check failure
      const diskSpaceError = new TestAglaError(
        'DISK_SPACE_EXHAUSTED',
        'Insufficient disk space for operation',
        {
          code: 'FS_NO_SPACE',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date(),
          context: {
            availableSpace,
            requestedSpace: requestedSizeValue,
            filePath: testFilePath,
            operation: 'write',
          } satisfies FilesystemTestContext,
        },
      );

      // Act - Process disk space error
      const errorJson = diskSpaceError.toJSON();
      const context = errorJson.context as FilesystemTestContext;

      // Assert - Error properly represents disk space issue
      expect(diskSpaceError.errorType).toBe('DISK_SPACE_EXHAUSTED');
      expect(diskSpaceError.message).toBe('Insufficient disk space for operation');
      expect(diskSpaceError.code).toBe('FS_NO_SPACE');
      expect(diskSpaceError.severity).toBe(ErrorSeverity.ERROR);

      // Context contains disk space monitoring information
      expect(context.availableSpace).toBe(0);
      expect(context.requestedSpace).toBe(requestedSizeValue);
      expect(context.filePath).toBe(testFilePath);
      expect(context.operation).toBe('write');

      // JSON serialization preserves all context
      expect(errorJson.errorType).toBe('DISK_SPACE_EXHAUSTED');
      expect(context).toHaveProperty('availableSpace', 0);
    });

    it('Then should handle disk space monitoring with retry mechanism', async () => {
      // Arrange - Multi-attempt disk space scenario
      const testFilePath = join(testTempDir, 'retry-file.txt');
      const originalError = new Error('ENOSPC: no space left on device');

      const spaceMonitoringError = new TestAglaError(
        'DISK_SPACE_MONITORING',
        'Disk space monitoring with retry',
        {
          severity: ErrorSeverity.WARNING,
          context: {
            availableSpace: 1024, // 1KB
            requestedSpace: 1000000, // 1MB
            filePath: testFilePath,
            retryCount: 3,
            operation: 'space-check',
          } satisfies FilesystemTestContext,
        },
      );

      // Act - Chain with original filesystem error
      const chainedError = spaceMonitoringError.chain(originalError);
      const context = chainedError.context as FilesystemTestContext;

      // Assert - Retry context preserved through chain
      expect(chainedError.message).toContain('ENOSPC: no space left on device');
      expect(context.retryCount).toBe(3);
      expect(context.availableSpace).toBe(1024);
      expect(context.cause).toBe('ENOSPC: no space left on device');
      expect(chainedError.errorType).toBe('DISK_SPACE_MONITORING');
    });
  });

  describe('When handling file permission error scenarios', () => {
    // E-003-02
    it('Then should handle permission error with alternative path fallback', async () => {
      // Arrange - Permission denied scenario with fallback
      const restrictedPath = join(testTempDir, 'restricted', 'file.txt');
      const alternativePath = join(testTempDir, 'fallback', 'file.txt');

      // Create alternative directory
      await fs.mkdir(join(testTempDir, 'fallback'), { recursive: true });

      const permissionError = new TestAglaError(
        'FILE_PERMISSION_DENIED',
        'Permission denied for file access',
        {
          code: 'FS_PERMISSION',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date(),
          context: {
            filePath: restrictedPath,
            alternativePath,
            permissions: '000',
            requiredPermissions: '644',
            operation: 'write',
          } satisfies FilesystemTestContext,
        },
      );

      // Act - Test alternative path fallback workflow
      const context = permissionError.context as FilesystemTestContext;

      // Simulate fallback path usage
      const fallbackUsed = context.alternativePath;
      expect(fallbackUsed).toBeDefined();

      // Verify alternative path is writable
      await fs.writeFile(fallbackUsed!, 'test data');
      const fileExists = await fs.access(fallbackUsed!).then(() => true).catch(() => false);

      // Assert - Permission error properly configured with fallback
      expect(permissionError.errorType).toBe('FILE_PERMISSION_DENIED');
      expect(permissionError.code).toBe('FS_PERMISSION');
      expect(context.filePath).toBe(restrictedPath);
      expect(context.alternativePath).toBe(alternativePath);
      expect(context.permissions).toBe('000');
      expect(context.requiredPermissions).toBe('644');
      expect(context.operation).toBe('write');

      // Fallback path is functional
      expect(fileExists).toBe(true);
    });

    it('Then should chain permission errors with retry attempts', async () => {
      // Arrange - Permission error with retry chain
      const testFilePath = join(testTempDir, 'permission-test.txt');
      const originalPermissionError = new Error('EACCES: permission denied');

      const retryablePermissionError = new TestAglaError(
        'PERMISSION_RETRY_FAILURE',
        'Permission retry attempts exhausted',
        {
          severity: ErrorSeverity.ERROR,
          context: {
            filePath: testFilePath,
            permissions: '444', // read-only
            requiredPermissions: '644', // read-write
            retryCount: 3,
            operation: 'write',
          } satisfies FilesystemTestContext,
        },
      );

      // Act - Chain permission errors
      const chainedError = retryablePermissionError.chain(originalPermissionError);
      const chainedContext = chainedError.context as FilesystemTestContext;

      // Assert - Permission context maintained through chain
      expect(chainedError.message).toContain('EACCES: permission denied');
      expect(chainedContext.retryCount).toBe(3);
      expect(chainedContext.permissions).toBe('444');
      expect(chainedContext.requiredPermissions).toBe('644');
      expect(chainedContext.cause).toBe('EACCES: permission denied');
    });
  });

  describe('When handling file lock conflict scenarios', () => {
    // E-003-03
    it('Then should handle file lock conflict with owner identification', async () => {
      // Arrange - File lock conflict simulation
      const lockedFilePath = join(testTempDir, 'locked-file.txt');
      const lockOwner = 'process-12345';
      const lockTimeout = 5000; // 5 seconds

      // Create test file
      await fs.writeFile(lockedFilePath, 'locked content');

      const lockConflictError = new TestAglaError(
        'FILE_LOCK_CONFLICT',
        'File lock conflict detected',
        {
          code: 'FS_LOCK_CONFLICT',
          severity: ErrorSeverity.WARNING,
          timestamp: new Date(),
          context: {
            filePath: lockedFilePath,
            lockOwner,
            lockTimeout,
            operation: 'exclusive-write',
          } satisfies FilesystemTestContext,
        },
      );

      // Act - Process lock conflict
      const lockContext = lockConflictError.context as FilesystemTestContext;

      // Simulate lock conflict detection
      const isLocked = lockContext.lockOwner !== undefined;
      const canTimeout = (lockContext.lockTimeout ?? 0) > 0;

      // Assert - Lock conflict properly tracked
      expect(lockConflictError.errorType).toBe('FILE_LOCK_CONFLICT');
      expect(lockConflictError.code).toBe('FS_LOCK_CONFLICT');
      expect(lockConflictError.severity).toBe(ErrorSeverity.WARNING);

      expect(lockContext.filePath).toBe(lockedFilePath);
      expect(lockContext.lockOwner).toBe(lockOwner);
      expect(lockContext.lockTimeout).toBe(lockTimeout);
      expect(lockContext.operation).toBe('exclusive-write');

      // Lock detection logic works
      expect(isLocked).toBe(true);
      expect(canTimeout).toBe(true);
    });

    it('Then should handle cascading lock conflicts', async () => {
      // Arrange - Multiple lock conflicts
      const primaryFilePath = join(testTempDir, 'primary.txt');
      const secondaryFilePath = join(testTempDir, 'secondary.txt');

      await fs.writeFile(primaryFilePath, 'primary content');
      await fs.writeFile(secondaryFilePath, 'secondary content');

      const primaryLockError = new TestAglaError(
        'PRIMARY_LOCK_CONFLICT',
        'Primary file lock conflict',
        {
          severity: ErrorSeverity.ERROR,
          context: {
            filePath: primaryFilePath,
            lockOwner: 'process-abc',
            lockTimeout: 3000,
            operation: 'read-write',
          } satisfies FilesystemTestContext,
        },
      );

      const secondaryLockError = new TestAglaError(
        'SECONDARY_LOCK_CONFLICT',
        'Secondary file lock conflict',
        {
          severity: ErrorSeverity.WARNING,
          context: {
            filePath: secondaryFilePath,
            lockOwner: 'process-def',
            lockTimeout: 2000,
            operation: 'read-only',
          } satisfies FilesystemTestContext,
        },
      );

      // Act - Chain lock conflicts
      const cascadingLockError = primaryLockError.chain(secondaryLockError);
      const cascadeContext = cascadingLockError.context as FilesystemTestContext;

      // Assert - Cascading lock conflicts properly chained
      expect(cascadingLockError.message).toContain('Secondary file lock conflict');
      expect(cascadingLockError.errorType).toBe('PRIMARY_LOCK_CONFLICT');
      expect(cascadeContext.filePath).toBe(primaryFilePath);
      expect(cascadeContext.lockOwner).toBe('process-abc');
      expect(cascadeContext.cause).toBe('Secondary file lock conflict');

      // Original lock context preserved
      expect(cascadeContext.lockTimeout).toBe(3000);
      expect(cascadeContext.operation).toBe('read-write');
    });
  });
});
