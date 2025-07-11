// src: packages/@esta-utils/command-runner/src/__tests__/exports.spec.ts
// @(#) : Test for package exports
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import * as commandExistModule from '../commandExist';
import * as packageExports from '../index';
import { estaUtils } from '../index';

describe('package exports', () => {
  it('should export all functions from commandExist module', () => {
    expect(packageExports.commandExist).toBeDefined();
    expect(packageExports.commandExist).toBe(commandExistModule.commandExist);
  });

  it('should export estaUtils namespace', () => {
    expect(packageExports.estaUtils).toBeDefined();
    expect(packageExports.estaUtils).toBe(commandExistModule);
  });

  it('should have default export as estaUtils', () => {
    expect(packageExports.default).toBeDefined();
    expect(packageExports.default).toBe(commandExistModule);
  });

  it('should export commandExist as default from commandExist module', () => {
    expect(packageExports.default.default).toBeDefined();
    expect(packageExports.default.default).toBe(commandExistModule.commandExist);
  });

  it('should provide access to commandExist through estaUtils', () => {
    expect(estaUtils.commandExist).toBeDefined();
    expect(estaUtils.commandExist).toBe(commandExistModule.commandExist);
  });

  it('should maintain consistency between different export methods', () => {
    // All these should reference the same function
    expect(packageExports.commandExist).toBe(estaUtils.commandExist);
    expect(packageExports.commandExist).toBe(packageExports.default.commandExist);
    expect(packageExports.commandExist).toBe(commandExistModule.commandExist);
  });
});
