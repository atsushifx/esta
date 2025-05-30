// src: helper/configs/__tests__/ToolConfigManager.spec.ts
// @(#) : 設定管理クラスの機能テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it } from 'vitest';

// constants
import { AgActionInstallerType } from '@shared/types';
// types
import type { AgActionEgetToolConfig } from '@shared/types';

// test unit
import { ToolConfigManager } from '../ToolConfigManager.class';

// test main
describe('ToolConfigManager', () => {
  let manager: ToolConfigManager;

  beforeEach(() => {
    manager = new ToolConfigManager();
    const baseConfigs = [
      {
        installer: AgActionInstallerType.EGET,
        tool: 'gitleaks',
        package: 'gitleaks/gitleaks',
      },
      {
        installer: AgActionInstallerType.EGET,
        tool: 'trivy',
        package: 'aquasec/trivy',
        options: {
          version: '0.62.0',
          installDir: '~/bin',
          args: [
            '--quiet',
          ],
        },
      },
    ];
    manager.addToolConfigs(baseConfigs);
  });

  it('get config from ToolConfigManager', () => {
    const config = manager.getToolConfig('gitleaks') as AgActionEgetToolConfig;
    expect(config).toBeDefined();
    expect(config?.tool).toBe('gitleaks');
    expect(config?.installer).toBe('eget');
    expect(config?.package).toBe('gitleaks/gitleaks');
    expect(config?.options).toBeUndefined();
  });

  it('set config to ToolConfigManager', () => {
    const sv2vConfig = {
      'installer': AgActionInstallerType.EGET,
      'tool': 'sv2v',
      'package': 'sv2v/sv2v',
      'options': {
        'version': 'latest',
      },
    };
    manager.addToolConfigs([sv2vConfig]);
    const config = manager.getToolConfig('sv2v');
    expect(config).toEqual(sv2vConfig);
  });

  it('overwrite config to ToolConfigManager', () => {
    const gitleaksConfig = {
      'installer': AgActionInstallerType.EGET,
      'tool': 'gitleaks',
      'package': 'gitleaks/gitleaks',
      'options': {
        'version': '8.26.1',
        'installDir': '~/bin',
        'args': [
          '--quiet',
          '--config-path',
          'gitleaks.toml',
        ],
      },
    };
    manager.addToolConfigs([gitleaksConfig]);
    const config = manager.getToolConfig('gitleaks');
    expect(config).toEqual(gitleaksConfig);
  });
});
