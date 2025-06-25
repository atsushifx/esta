// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// framework
import { AgE2eFileIOFramework } from '../../src/AgE2eFileIoFramework';

describe('HelloWorldExample - AgE2eFileIOFrameworkの基本動作確認', () => {
  const framework = new AgE2eFileIOFramework();

  it('ファイルを作成して内容を読み書きできること', async () => {
    const testFilePath = './temp/HelloWorldExample.txt';
    const testContent = 'Hello ESTA E2E Framework!';

    // ファイル書き込み
    await framework.writeFile(testFilePath, testContent);

    // ファイル読み込み
    const content = await framework.readFile(testFilePath);

    // 内容検証
    expect(content).toBe(testContent);
  });
});
