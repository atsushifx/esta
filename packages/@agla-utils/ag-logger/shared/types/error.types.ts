export abstract class AglaError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toString(): string {
    const contextStr = this.context ? JSON.stringify(this.context) : '';
    return `${this.code}: ${this.message}${contextStr ? ` ${contextStr}` : ''}`;
  }
}
