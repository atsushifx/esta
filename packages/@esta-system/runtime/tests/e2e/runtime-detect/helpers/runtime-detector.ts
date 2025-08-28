/**
 * Runtime detector helper program
 * This program will be executed by different runtimes to test runtime detection
 *
 * Usage:
 * - Node.js: `node runtime-detector.js`
 * - Deno: `deno run runtime-detector.ts`
 * - Bun: `bun run runtime-detector.ts`
 *
 * Output: JSON format for easy E2E test parsing
 */

// Import for both re-export and main execution
import { getRuntime } from '../../../../src/getRuntime.ts';

// Re-export for E2E tests
export type { TExecRuntime } from '../../../../shared/types/TExecRuntime.types.ts';
export { getRuntime } from '../../../../src/getRuntime.ts';

// Output runtime detection result as JSON for E2E testing
const runtime = getRuntime();

const result = {
  runtime,
  timestamp: new Date().toISOString(),
  process: process.version || 'unknown',
  status: 'success',
};

console.log(JSON.stringify(result));
