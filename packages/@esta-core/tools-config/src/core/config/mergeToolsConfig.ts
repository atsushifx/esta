import type { PartialToolsConfig, ToolsConfig } from '../../../shared/types/toolsConfig.types';

export const mergeToolsConfig = (
  defaultConfig: ToolsConfig,
  loadConfig: PartialToolsConfig | object,
): ToolsConfig | object => {
  if (Object.keys(loadConfig).length === 0) {
    return loadConfig as ToolsConfig;
  }

  const partialConfig = loadConfig as PartialToolsConfig;

  return {
    ...defaultConfig,
    ...partialConfig,
    tools: [
      ...defaultConfig.tools,
      ...(partialConfig.tools ?? []),
    ],
  } as ToolsConfig;
};
