// tests/e2e/helpers/runtimeTestUtils.ts
// @(#) : E2E test helper functions for runtime detection tests
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { exec } from 'child_process';
import { promisify } from 'util';
import { expect } from 'vitest';

const execAsync = promisify(exec);

export type RuntimeTestResult = {
  status: string;
  runtime: string;
  timestamp: string;
  process: string;
};

/**
 * Execute runtime detector helper and return parsed result
 */
export const executeRuntimeDetector = async (command: string, helperPath: string): Promise<RuntimeTestResult> => {
  try {
    const { stdout, stderr } = await execAsync(`${command} "${helperPath}"`);

    if (stderr) {
      console.warn(`${command} stderr output:`, stderr);
    }

    expect(stdout.trim()).toBeTruthy();
    const result = JSON.parse(stdout.trim());

    // Validate result structure
    expect(result.status).toBe('success');
    expect(typeof result.runtime).toBe('string');
    expect(typeof result.timestamp).toBe('string');
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    expect(typeof result.process).toBe('string');

    return result;
  } catch (error) {
    const execError = error as { message?: string; stdout?: string; stderr?: string; code?: number };
    console.error(`${command} helper execution failed:`, {
      message: execError.message,
      stdout: execError.stdout,
      stderr: execError.stderr,
      code: execError.code,
    });
    throw error;
  }
};

/**
 * Check if runtime is available
 */
export const isRuntimeAvailable = async (command: string): Promise<boolean> => {
  try {
    const { stderr } = await execAsync(`${command} --version`);
    return !stderr || stderr.trim() === '';
  } catch {
    return false;
  }
};
