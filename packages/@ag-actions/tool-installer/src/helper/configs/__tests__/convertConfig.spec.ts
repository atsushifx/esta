// src:  ./helper/configs/__tests__/convertConfig.spec.ts
// @(#) : 設定データ変換ユーティリティのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


// Logger
import { AgLogger, AgLogLevelCode } from '@ag-system/ag-logger';
// vitest
import { describe, expect, it } from 'vitest';

import { AgActionInstallerType } from '@shared/types';
// types
import type { AgActionEgetToolConfig } from '@shared/types';

// test unit
import { convertConfig } from '../convertConfig';
// module
import { parseJsoncConfig } from '../parseConfig';

// types

// Log definition
AgLogger.setLogLevel(AgLogLevelCode.DEBUG);

// --- test main
describe('check installer type is valid', () => {
  describe('invalid installer type', () => {
    it('should throw error is installer is undefined', () => {
      const raw = parseJsoncConfig(`{ "installer": }`);
      expect(() => {
        convertConfig(raw);
      }).toThrowError();
    });

    it('should throw error is installer is null/empty', () => {
      const raw = parseJsoncConfig(`{ "installer": ""}`);
      expect(() => {
        convertConfig(raw);
      }).toThrowError();
    });

    it('should throw error if install type is invalid', () => {
      const raw = parseJsoncConfig(`{ "installer": "invalid"}`);
      expect(() => {
        convertConfig(raw);
      }).toThrowError();
    });

    it('should throw error if system use install type', () => {
      const raw = parseJsoncConfig(`{ "installer": "${AgActionInstallerType.EGET_INITIALIZE}"}`);
      expect(() => {
        convertConfig(raw);
      }).toThrowError();
    });
  });

  describe('valid installer: eget', () => {
    it('eget: should throw error if tool is not set', () => {
      const raw = parseJsoncConfig(`{
        "installer": "${AgActionInstallerType.EGET}",
        }`);
      expect(() => {
        convertConfig(raw);
      }).toThrowError();
    });

    it('eget: should throw error if package is not set', () => {
      const raw = parseJsoncConfig(`{
        "installer": "${AgActionInstallerType.EGET}",
        "tool": "gitleaks",
        "package":
        }`);
      expect(() => {
        convertConfig(raw);
      }).toThrowError();
    });

    it('eget: read configs for eget config', () => {
      const raw = parseJsoncConfig(`{
        "installer": "${AgActionInstallerType.EGET}",
        "tool": "gitleaks",
        "package": "gitleaks/gitleaks",
        }`);
      const config = convertConfig(raw) as AgActionEgetToolConfig;

      expect(config.installer).toBe(AgActionInstallerType.EGET);
      expect(config.tool).toBe('gitleaks');
      expect(config.package).toBe('gitleaks/gitleaks');
    });

    it('eget: read configs for eget config', () => {
      const raw = parseJsoncConfig(`{
        "installer": "${AgActionInstallerType.EGET}",
        "tool": "gitleaks",
        "package": "gitleaks/gitleaks",
        "options": {
          "version": "latest",
          "installDir": "~/bin",
          "args": ["--config-path=./.gitleaks.toml"]
          },
        }`);
      const config = convertConfig(raw) as AgActionEgetToolConfig;

      expect(config.installer).toBe(AgActionInstallerType.EGET);
      expect(config.tool).toBe('gitleaks');
      expect(config.package).toBe('gitleaks/gitleaks');
      expect(config.options?.version).toBe('latest');
      expect(config.options?.installDir).toBe('~/bin');
      expect(config.options?.args).toEqual(['--config-path=./.gitleaks.toml']);
    });
  });
});
