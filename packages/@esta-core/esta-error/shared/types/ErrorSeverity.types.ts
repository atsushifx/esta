export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export const isValidErrorSeverity = (value: unknown): value is ErrorSeverity => {
  return typeof value === 'string' && Object.values(ErrorSeverity).includes(value as ErrorSeverity);
};
