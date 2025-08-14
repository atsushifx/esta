import type { MockInstance } from 'vitest';

export type TConsoleMock = {
  error: MockInstance;
  warn: MockInstance;
  info: MockInstance;
  debug: MockInstance;
  log: MockInstance;
};

export const createConsoleMock = (
  vi: { fn: () => MockInstance; clearAllMocks: () => void },
): { mockConsole: TConsoleMock; setup: () => void } => {
  const mockConsole: TConsoleMock = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  };

  const setup = (): void => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  };

  return { mockConsole, setup } as const;
};
