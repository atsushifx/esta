// src: ./src/helper/configs/ToolConfigManager.class.ts
// @(#) : tool configuration manager class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgActionToolConfig } from '@shared/types/';

// class definition
export class ToolConfigManager {
  // Tool Configs Map: all Manager use this map
  private static _toolConfigMap: Map<string, AgActionToolConfig> = new Map();

  // methods
  public getToolConfig(tool: string): AgActionToolConfig | undefined {
    return ToolConfigManager._toolConfigMap.get(tool);
  }

  public addToolConfigs(configs: AgActionToolConfig[]): void {
    configs.forEach((config) => {
      ToolConfigManager._toolConfigMap.set(config.tool, config);
    });
  }
}
