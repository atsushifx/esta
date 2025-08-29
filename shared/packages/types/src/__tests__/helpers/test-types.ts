/**
 * Utility type that makes all readonly properties of T mutable.
 * Useful for testing scenarios where readonly properties need to be modified.
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
