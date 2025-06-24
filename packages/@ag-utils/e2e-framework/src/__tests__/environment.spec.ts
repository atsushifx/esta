// src: ./src/__tests__/environment.spec.ts
// @(#): 環境管理テスト - AgE2eFileIOFrameworkの環境セットアップ・クリーンアップテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib
import * as fs from 'fs';
import * as path from 'path';

// vitest
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

// test target
import { AgE2eFileIOFramework } from '../AgE2eFileIoFramework';

describe('Environment Management', () => {
  let framework: AgE2eFileIOFramework;
  let testId: string;

  beforeEach(() => {
    framework = new AgE2eFileIOFramework();
    testId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  });

  afterEach(() => {
    framework.cleanupEnvironment(testId);
  });

  test('setupEnvironment creates temporary directory and sets XDG_CONFIG_HOME', () => {
    const configDirName = 'test-config';
    const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;

    const env = framework.setupEnvironment(testId, configDirName);

    expect(env.tempDir).toBeTruthy();
    expect(fs.existsSync(env.tempDir)).toBe(true);
    expect(env.configDir).toBe(path.join(env.tempDir, configDirName));
    expect(fs.existsSync(env.configDir)).toBe(true);
    expect(env.originalXdgConfigHome).toBe(originalXdgConfigHome);
    expect(process.env.XDG_CONFIG_HOME).toBe(env.tempDir);
  });

  test('cleanupEnvironment removes temporary directory and restores XDG_CONFIG_HOME', () => {
    const configDirName = 'test-config';
    const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;

    const env = framework.setupEnvironment(testId, configDirName);
    const tempDir = env.tempDir;

    expect(fs.existsSync(tempDir)).toBe(true);

    framework.cleanupEnvironment(testId);

    expect(fs.existsSync(tempDir)).toBe(false);
    expect(process.env.XDG_CONFIG_HOME).toBe(originalXdgConfigHome);
  });

  test('cleanupEnvironment handles non-existent environment gracefully', () => {
    expect(() => framework.cleanupEnvironment('non-existent-id')).not.toThrow();
  });
});
