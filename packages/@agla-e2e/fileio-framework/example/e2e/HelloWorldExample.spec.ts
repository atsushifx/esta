// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest testing framework imports
import { describe, expect, it } from 'vitest';

// ESTA E2E testing framework import
import { AgE2eFileIOFramework } from '../../src/AgE2eFileIoFramework';

/**
 * Test suite: HelloWorldExample - Basic functionality check of AgE2eFileIOFramework
 *
 * This suite verifies the core file IO operations of the AgE2eFileIOFramework,
 * including writing to a file and reading from it.
 * It serves as a simple "Hello World" style sanity check for the framework.
 */
describe('HelloWorldExample - Basic Functionality Check of AgE2eFileIOFramework', () => {
  const framework = new AgE2eFileIOFramework();

  it('should create a file and correctly write and read its content', async () => {
    const testFilePath = './temp/HelloWorldExample.txt';
    const testContent = 'Hello ESTA E2E Framework!';

    // Write content to the file
    await framework.writeFile(testFilePath, testContent);

    // Read content from the file
    const content = await framework.readFile(testFilePath);

    // Verify the content matches what was written
    expect(content).toBe(testContent);
  });
});
