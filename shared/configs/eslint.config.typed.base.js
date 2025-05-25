// src: /shared/configs/eslint.config.typed.base.js
// @(#) : ESLint flat config for check TypeScript types.
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- plugins
import tseslint from '@typescript-eslint/eslint-plugin';

// --- base configs
import baseConfig from './eslint.config.base.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // --- 共通のbaseConfigを先頭に展開
  ...baseConfig,

  // --- rules for TypeScript type check (override)
  {
    files: [
      'src/**/*.ts',
      'tests/**/*.ts',
      'types/**/*.ts',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // type check rules
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
      }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
    },
  },
];
