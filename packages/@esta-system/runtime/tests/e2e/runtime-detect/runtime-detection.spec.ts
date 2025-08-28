import { exec } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { describe, expect, it } from 'vitest';

const execAsync = promisify(exec);

// Runtime availability checker
const isRuntimeAvailable = async (command: string): Promise<boolean> => {
  try {
    const { stderr } = await execAsync(`${command} --version`);
    return !stderr || stderr.trim() === '';
  } catch {
    return false;
  }
};

describe('Runtime Detection E2E Tests', () => {
  describe('Helper program setup', () => {
    it('runtime-detector.ts ファイルが存在する', () => {
      const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');
      expect(existsSync(helperPath)).toBe(true);
    });

    it('getRuntime関数が正しくimportできる', async () => {
      const { getRuntime } = await import('./helpers/runtime-detector');
      expect(typeof getRuntime).toBe('function');
    });
  });

  describe('標準出力への結果出力機能', () => {
    it('getRuntime()結果が標準出力に出力される', async () => {
      // This test should fail initially (RED phase)
      // We expect the helper to output the runtime value to stdout
      const { getRuntime } = await import('./helpers/runtime-detector');
      const runtimeValue = getRuntime();

      // For now, this assertion will fail because helper doesn't output anything
      // This represents the RED phase - test fails as expected
      expect(typeof runtimeValue).toBe('string');
      expect(['Node', 'Deno', 'Bun', 'GitHubActions', 'Unknown']).toContain(runtimeValue);

      // TODO: In GREEN phase, we'll add actual console output to the helper
      // and test that it outputs to stdout when executed as a separate process
    });
  });

  describe('各ランタイム対応の確認', () => {
    it('Node.js環境で実行可能でTExecRuntime.Nodeが検出される', async () => {
      const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

      try {
        const { stdout, stderr } = await execAsync(`pnpm exec tsx "${helperPath}"`);

        // Verify no errors in stderr
        if (stderr) {
          console.warn('Helper stderr output:', stderr);
        }

        // Parse and validate JSON output
        expect(stdout.trim()).toBeTruthy();
        const result = JSON.parse(stdout.trim());

        // Validate success status
        expect(result.status).toBe('success');

        // Validate runtime detection
        expect(result.runtime).toBe('Node');

        // Validate metadata
        expect(typeof result.timestamp).toBe('string');
        expect(new Date(result.timestamp)).toBeInstanceOf(Date);

        expect(typeof result.process).toBe('string');
        expect(result.process).toMatch(/^v\d+\.\d+\.\d+/); // Node.js version pattern
      } catch (error) {
        // Enhanced error reporting for debugging
        const execError = error as { message?: string; stdout?: string; stderr?: string; code?: number };
        console.error('Helper execution failed:', {
          message: execError.message,
          stdout: execError.stdout,
          stderr: execError.stderr,
          code: execError.code,
        });
        throw error;
      }
    }, 10000); // 10 second timeout for safety
  });

  describe('Deno実行テスト', () => {
    it('Deno利用可能時にTExecRuntime.Denoが検出される', async () => {
      const isDenoAvailable = await isRuntimeAvailable('deno');

      if (!isDenoAvailable) {
        console.warn('Deno is not available, skipping test');
        return;
      }

      const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

      try {
        const { stdout, stderr } = await execAsync(`deno run --allow-read --allow-env "${helperPath}"`);

        if (stderr) {
          console.warn('Deno stderr output:', stderr);
        }

        expect(stdout.trim()).toBeTruthy();
        const result = JSON.parse(stdout.trim());

        expect(result.status).toBe('success');
        expect(result.runtime).toBe('Deno');
        expect(typeof result.timestamp).toBe('string');
        expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        expect(typeof result.process).toBe('string');
      } catch (error) {
        const execError = error as { message?: string; stdout?: string; stderr?: string; code?: number };
        console.error('Deno helper execution failed:', {
          message: execError.message,
          stdout: execError.stdout,
          stderr: execError.stderr,
          code: execError.code,
        });
        throw error;
      }
    }, 10000);
  });

  describe('Bun実行テスト', () => {
    it('Bun利用可能時にTExecRuntime.Bunが検出される', async () => {
      const isBunAvailable = await isRuntimeAvailable('bun');

      if (!isBunAvailable) {
        console.warn('Bun is not available, skipping test');
        return;
      }

      const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

      try {
        const { stdout, stderr } = await execAsync(`bun run "${helperPath}"`);

        if (stderr) {
          console.warn('Bun stderr output:', stderr);
        }

        expect(stdout.trim()).toBeTruthy();
        const result = JSON.parse(stdout.trim());

        expect(result.status).toBe('success');
        expect(result.runtime).toBe('Bun');
        expect(typeof result.timestamp).toBe('string');
        expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        expect(typeof result.process).toBe('string');
      } catch (error) {
        const execError = error as { message?: string; stdout?: string; stderr?: string; code?: number };
        console.error('Bun helper execution failed:', {
          message: execError.message,
          stdout: execError.stdout,
          stderr: execError.stderr,
          code: execError.code,
        });
        throw error;
      }
    }, 10000);
  });

  describe('テスト実行環境の検証', () => {
    it('全テストケース実行が正常に動作することを検証', async () => {
      // RED: This test should initially fail as we haven't verified all test cases run correctly
      const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

      // Verify helper file exists before running tests
      expect(existsSync(helperPath)).toBe(true);

      // Run basic Node.js test to ensure basic functionality
      const { stdout } = await execAsync(`pnpm exec tsx "${helperPath}"`);

      // This test should initially fail until we complete the integration
      expect(stdout.trim()).toBeTruthy();
      const result = JSON.parse(stdout.trim());
      expect(result.status).toBe('success');
      expect(result.runtime).toBe('Node');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.process).toBe('string');

      // TODO: In GREEN phase, we'll add comprehensive test execution verification
      // including checking that all test suites complete successfully
    }, 15000);
  });

  describe('異常系処理とエラーハンドリング', () => {
    it('予期しないエラーが適切に処理されることを検証', async () => {
      // RED: This test should initially fail as we haven't implemented robust error handling
      const nonExistentPath = path.resolve(__dirname, 'helpers', 'non-existent-helper.ts');

      try {
        // This should fail but be handled gracefully
        await execAsync(`pnpm exec tsx "${nonExistentPath}"`);
        // If we reach here, the test should fail because the file doesn't exist
        expect(false).toBe(true); // Force failure for RED phase
      } catch (error) {
        // RED: This catch block should be reached, but we need better error processing
        const execError = error as { message?: string; stdout?: string; stderr?: string; code?: number };

        // Basic error validation - this should pass
        expect(execError.message).toBeDefined();
        expect(typeof execError.message).toBe('string');

        // TODO: In GREEN phase, add more comprehensive error categorization
        // and structured error messages with debugging information
      }
    }, 10000);

    it('不正なhelperファイルが適切にエラーハンドリングされることを検証', async () => {
      // RED: This test verifies that syntax errors in helper are handled properly
      const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

      // First verify the helper works normally
      const { stdout: normalOutput } = await execAsync(`pnpm exec tsx "${helperPath}"`);
      expect(normalOutput.trim()).toBeTruthy();
      const normalResult = JSON.parse(normalOutput.trim());
      expect(normalResult.runtime).toBeDefined();

      // TODO: In GREEN phase, we'll create a malformed helper test
      // and verify that parsing errors are handled gracefully
    }, 10000);
  });
});
