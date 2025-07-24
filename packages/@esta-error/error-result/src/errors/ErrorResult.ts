import type { ErrorResultJSON, ErrorResultOptions } from '../../shared/types';

export class ErrorResult extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;

  constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
    options?: ErrorResultOptions,
  ) {
    super(message);

    this.name = 'ErrorResult';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.recoverable = options?.recoverable ?? true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorResult);
    }
  }

  toJSON(): ErrorResultJSON {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
    };
  }

  isRecoverable(): boolean {
    return this.recoverable;
  }
}
