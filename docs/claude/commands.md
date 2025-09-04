---
header:
  - src: claude/commands.md
  - @(#): 開発コマンド総合リファレンスガイド
title: Commands Reference
description: モノレポで使用する全開発コマンドの総合リファレンス
version: 1.0.0
created: 2025-09-04
authors:
  - atsushifx
changes:
  - 2025-09-04: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## Commands Reference

This file provides comprehensive reference for all development commands used in this monorepo.

### Global Commands (Root Level)

Run these commands from the root directory to operate on all packages:

#### Build Commands

- `pnpm run build` - Build all packages in the monorepo
- `pnpm run build:esm` - Build ESM versions for all packages
- `pnpm run build:cjs` - Build CommonJS versions for all packages
- `pnpm run clean` - Clean build artifacts from all packages

#### Test Commands

- `pnpm run test:gha` - Run GitHub Actions tests with special config
- `pnpm run test:develop` - Run all unit tests across packages
- `pnpm run test:ci` - Run all E2E tests across packages

#### Type Checking

- `pnpm run check:types` - Type check all packages

#### Linting Commands

- `pnpm run lint` - Lint all packages
- `pnpm run lint:types` - Type-aware linting for all packages
- `pnpm run lint-all` - Lint all files with basic ESLint config
- `pnpm run lint-all:types` - Lint all files with TypeScript-aware ESLint config
- `pnpm run lint:filenames` - Check filename conventions with ls-lint
- `pnpm run lint:text` - Check text files with textlint
- `pnpm run lint:markdown` - Check markdown files with markdownlint
- `pnpm run lint:secrets` - Check for secrets with secretlint

#### Formatting and Code Quality

- `pnpm run check:spells` - Spell checking with cspell
- `pnpm run format:dprint` - Format code with dprint
- `pnpm run check:dprint` - Check code formatting with dprint

### Package-Level Commands

Run these commands from individual package directories. Each package supports:

#### Build Commands

- `pnpm run build` - Build both CJS and ESM versions
- `pnpm run build:cjs` - Build CommonJS version using tsup
- `pnpm run build:esm` - Build ESM version using tsup
- `pnpm run clean` - Clean build artifacts (lib, module, .cache)

#### Test Commands

- `pnpm run test:all` - Run all test types (unit, functional, integration, E2E)
- `pnpm run test:develop` - Run unit tests only
- `pnpm run test:functional` - Run functional tests (some packages)
- `pnpm run test:ci` - Run integration tests
- `pnpm run test:e2e` - Run E2E tests only

#### Linting and Quality

- `pnpm run lint` - ESLint with basic config
- `pnpm run lint:types` - ESLint with TypeScript rules
- `pnpm run lint:all` - Run both lint commands
- `pnpm run lint:fix` - Auto-fix linting issues
- `pnpm run lint:secrets` - Check for secrets with secretlint

#### Type Checking and Quality Assurance

- `pnpm run check:types` - TypeScript type checking
- `pnpm run check:spells` - Spell checking for package files
- `pnpm run sync:configs` - Sync shared configs to package

### Running Single Tests

#### Unit Tests

```bash
pnpm exec vitest run --config ./configs/vitest.config.unit.ts src/path/to/test.spec.ts
```

#### Functional Tests

```bash
pnpm exec vitest run --config ./configs/vitest.config.functional.ts src/path/to/functional.spec.ts
```

#### Integration Tests

```bash
pnpm exec vitest run --config ./configs/vitest.config.integration.ts tests/integration/test.spec.ts
```

#### E2E Tests

```bash
pnpm exec vitest run --config ./configs/vitest.config.e2e.ts tests/e2e/test.spec.ts
```

### Development Setup Scripts

Scripts for setting up the development environment:

- `scripts/install-dev-tools.ps1` - Install development tools and dependencies
- `scripts/install-doc-tools.ps1` - Install documentation and writing tools
- `scripts/sync-configs.sh` - Sync shared configurations to packages
- `scripts/sync-package-scripts.ts` - Sync package.json scripts across packages
- `scripts/run-tests.ps1` - Run tests across the monorepo

### Package-Level Development Workflow

When working within a specific package (like `@agla-utils/ag-logger`), use these commands from the package directory:

```bash
# From package directory (e.g., packages/@agla-utils/ag-logger/)
pnpm run build           # Build current package
pnpm run test:develop    # Run unit tests
pnpm run test:e2e        # Run E2E tests
pnpm run lint:all        # Run all linting
pnpm run check:types     # Type checking
```

### Quality Assurance Commands

After implementation, run these commands to debug errors:

- `pnpm run lint-all` - Lint all files with basic ESLint config
- `pnpm run lint-all:types` - Lint all files with TypeScript-aware ESLint config
- `pnpm run check:types` - TypeScript type checking
- `pnpm run check:spells **/*.{ts,md,json}` - Spell checking
- `pnpm run check:dprint` - Code formatting verification
