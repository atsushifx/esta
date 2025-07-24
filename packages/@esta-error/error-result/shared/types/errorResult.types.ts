export type ErrorResultJSON = {
  name: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  recoverable: boolean;
};

export type ErrorResultOptions = {
  recoverable?: boolean;
};
