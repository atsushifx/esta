// src: /shared/constants/common.constants.ts
// @(#) : Common Constants for AgLogger Package
//
// Provides semantic boolean constants to improve code readability and maintainability.
// Using these constants instead of raw boolean values makes code more self-documenting
// and reduces the likelihood of boolean parameter confusion.
//
// Exports:
// - ENABLE: Boolean constant representing enabled/true state
// - DISABLE: Boolean constant representing disabled/false state
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Boolean constant representing enabled/true state.
 *
 * Use this constant instead of raw `true` for better code readability,
 * especially in function parameters and configuration settings.
 *
 * @example
 * ```typescript
 * // Instead of: config.setVerbose(true)
 * config.setVerbose(ENABLE);
 *
 * // Instead of: if (isActive === true)
 * if (isActive === ENABLE)
 * ```
 *
 * @since 0.2.0
 */
export const ENABLE = true;

/**
 * Boolean constant representing disabled/false state.
 *
 * Use this constant instead of raw `false` for better code readability,
 * especially in function parameters and configuration settings.
 *
 * @example
 * ```typescript
 * // Instead of: config.setVerbose(false)
 * config.setVerbose(DISABLE);
 *
 * // Instead of: if (isActive === false)
 * if (isActive === DISABLE)
 * ```
 *
 * @since 0.2.0
 */
export const DISABLE = false;
