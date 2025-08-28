# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo focused on building GitHub Actions and utility packages, particularly for CLI tool installation and automation. The primary project is the "Easy Setup Tools Action" which uses eget to install CLI tools in GitHub Actions workflows.

The action supports configuration-based tool installation with JSON config files, allowing users to specify tools, versions, and installation options. It currently supports eget-based installation with plans for script-based installation.

**Note**: This repository is currently undergoing a major refactoring to reorganize packages and improve the codebase structure. Some packages may be in transition or have been recently moved/renamed.

## Development Commands

### Global Commands (Root Level)

- `pnpm run build` - Build all packages in the monorepo
- `pnpm run build:esm` - Build ESM versions for all packages
- `pnpm run build:cjs` - Build CommonJS versions for all packages
- `pnpm run clean` - Clean build artifacts from all packages
- `pnpm run test:gha` - Run GitHub Actions tests with special config
- `pnpm run test:develop` - Run all unit tests across packages
- `pnpm run test:ci` - Run all E2E tests across packages
- `pnpm run check:types` - Type check all packages
- `pnpm run lint` - Lint all packages
- `pnpm run lint:types` - Type-aware linting for all packages
- `pnpm run lint-all` - Lint all files with basic ESLint config
- `pnpm run lint-all:types` - Lint all files with TypeScript-aware ESLint config
- `pnpm run lint:filenames` - Check filename conventions with ls-lint
- `pnpm run lint:text` - Check text files with textlint
- `pnpm run lint:markdown` - Check markdown files with markdownlint
- `pnpm run lint:secrets` - Check for secrets with secretlint
- `pnpm run check:spells` - Spell checking with cspell
- `pnpm run format:dprint` - Format code with dprint
- `pnpm run check:dprint` - Check code formatting with dprint

### Package-Level Commands

Each package supports these commands:

- `pnpm run build` - Build both CJS and ESM versions
- `pnpm run build:cjs` - Build CommonJS version using tsup
- `pnpm run build:esm` - Build ESM version using tsup
- `pnpm run clean` - Clean build artifacts (lib, module, .cache)
- `pnpm run test:all` - Run all test types (unit, functional, integration, E2E)
- `pnpm run test:develop` - Run unit tests only
- `pnpm run test:functional` - Run functional tests (some packages)
- `pnpm run test:ci` - Run integration tests
- `pnpm run test:e2e` - Run E2E tests only
- `pnpm run lint` - ESLint with basic config
- `pnpm run lint:types` - ESLint with TypeScript rules
- `pnpm run lint:all` - Run both lint commands
- `pnpm run lint:fix` - Auto-fix linting issues
- `pnpm run lint:secrets` - Check for secrets with secretlint
- `pnpm run check:types` - TypeScript type checking
- `pnpm run check:spells` - Spell checking for package files
- `pnpm run sync:configs` - Sync shared configs to package

### Running Single Tests

For unit tests: `pnpm exec vitest run --config ./configs/vitest.config.unit.ts src/path/to/test.spec.ts`
For functional tests: `pnpm exec vitest run --config ./configs/vitest.config.functional.ts src/path/to/functional.spec.ts`
For integration tests: `pnpm exec vitest run --config ./configs/vitest.config.integration.ts tests/integration/test.spec.ts`
For E2E tests: `pnpm exec vitest run --config ./configs/vitest.config.e2e.ts tests/e2e/test.spec.ts`

### Development Setup Scripts

- `scripts/install-dev-tools.ps1` - Install development tools and dependencies
- `scripts/install-doc-tools.ps1` - Install documentation and writing tools
- `scripts/sync-configs.sh` - Sync shared configurations to packages
- `scripts/sync-package-scripts.ts` - Sync package.json scripts across packages
- `scripts/run-tests.ps1` - Run tests across the monorepo

## Architecture Overview

### Monorepo Structure

This is a TypeScript monorepo using pnpm workspaces with 6 main categories plus shared packages:

#### Package Categories

- **@esta-actions/**: GitHub Actions related packages
  - `tools-installer` - Universal tool installer framework using eget
- **@esta-core/**: Core infrastructure packages
  - `error-handler` - Centralized error handling and exit management
  - `feature-flags` - Feature flag management system
  - `tools-config` - Tool installation configuration generator with validation and merging
- **@esta-system/**: System-level utilities
  - `exit-status` - System exit status management
- **@esta-utils/**: Application utility packages
  - `config-loader` - Universal configuration file loader (JSON, YAML, JS/TS)
  - `command-runner` - Command existence checking and execution utilities
  - `get-platform` - Platform detection utilities
- **@agla-utils/**: General utility packages
  - `ag-logger` - Structured logging framework with multiple formats and outputs
- **@agla-e2e/**: E2E testing frameworks
  - `fileio-framework` - File I/O framework for E2E tests
- **@shared/**: Internal shared packages (located in `shared/packages/`)
  - `constants` - Shared constants for all packages (exit codes, defaults, directories)
  - `types` - Shared TypeScript types for all packages (currently minimal)

### Build System

- **Build Tool**: tsup for both CommonJS and ESM outputs
- **Output Structure**: Each package produces `lib/` (CJS) and `module/` (ESM) directories
- **Package Manager**: pnpm with workspace protocol (`workspace:*`) for internal dependencies
- **TypeScript**: Strict mode with ES2022 target, bundler module resolution

### Configuration Management

- **Shared Configs**: Centralized in `base/configs/` and `configs/`
- **Per-Package Configs**: Each package has its own `configs/` directory
- **Config Sync**: Script-based synchronization from shared configs to packages using `scripts/sync-configs.sh`
- **Base Configs**: `tsconfig.base.json`, `eslint.config.base.js`, etc.
- **Package Scripts Sync**: Automated synchronization of package.json scripts using `scripts/sync-package-scripts.ts`
- **Base Scripts**: Standardized package.json scripts defined in `base/configs/base-scripts.json`

### Testing Framework

- **Test Runner**: Vitest with separate configs for unit, functional, integration, and E2E tests
- **Test Categories**:
  - Unit tests: `src/**/*.spec.ts` (individual functions/classes)
  - Functional tests: `src/**/*functional.spec.ts` (feature-level behavior)
  - Integration tests: `tests/integration/**/*.spec.ts` (component interactions)
  - E2E tests: `tests/e2e/**/*.spec.ts` (end-to-end scenarios)
  - GitHub Actions tests: Special config for testing GitHub Actions workflows
- **Special Features**:
  - File I/O testing with `@agla-e2e/fileio-framework`
  - GitHub Actions specific testing with `test:gha` command
  - JUnit reporting for CI environments
  - BDD-style testing with descriptive test names

### TypeScript Configuration

- **Path Mapping**: `@shared/*` for internal shared modules (`@shared/constants`, `@shared/types`)
- **Package-Specific Aliases**: `@/*` maps to `src/*` in most packages
- **Strict Mode**: Full TypeScript strict mode enabled
- **Build Cache**: Incremental compilation with `.cache/` directories
- **Target**: ES2022 with bundler module resolution

### Code Quality Tools

- **Linting**: ESLint with TypeScript support and separate typed/untyped configs
- **Formatting**: dprint for code formatting
- **Spell Checking**: cspell with custom dictionary
- **Security**: secretlint for secret detection
- **File Naming**: ls-lint for filename conventions
- **Text Quality**: textlint for prose, markdownlint-cli2 for markdown

### Development Workflow

- **Pre-commit**: lefthook for running quality checks (linting, formatting, spell checking, secrets detection)
- **Config Management**: Centralized configuration with sync scripts
- **Build Process**: Dual-target builds (CJS/ESM) with declaration files
- **Testing**: Multi-tier testing with unit, functional, integration, E2E, and GitHub Actions specific tests
- **BDD Process**: Strict BDD implementation following atsushifx式 methodology:
  - 1 message = 1 test (single `it()` per implementation cycle)
  - RED/GREEN confirmation required before proceeding
  - Minimal implementation for test passage only
  - Natural language descriptive test naming
- **Development Tools**: PowerShell scripts for tooling installation and development environment setup
- **Commit Messages**: Automated commit message generation using codegpt

## Key Patterns

### Package Structure

All packages follow this structure:

```
package-name/
├── src/           # Source code
├── lib/           # Built CommonJS output
├── module/        # Built ESM output
├── configs/       # Package-specific configurations
├── shared/        # Package-specific shared types/constants (optional)
├── tests/e2e/     # E2E tests
└── tsconfig.json  # TypeScript configuration
```

**Note**: The `@shared/` packages are located in `shared/packages/` at the root level, not in the `packages/` directory.

### Error Handling

- Comprehensive error handling with descriptive messages
- Type-safe error patterns using TypeScript
- Validation at configuration and runtime levels

### Testing Strategy

- Unit tests for individual functions and classes
- E2E tests for integration scenarios
- Fixture-based testing for complex scenarios
- GitHub Actions specific testing for deployment validation

### Module System

- ESM-first with CommonJS compatibility
- Workspace protocol for internal dependencies
- Proper export maps in package.json for dual publishing
- Path mapping for clean imports

## Key Architecture Patterns

### GitHub Actions Integration

The `@esta-actions/tools-installer` package provides the core functionality:

- **ToolConfigManager**: Manages tool configurations with JSON-based config files
- **HandleInstaller**: Orchestrates installation process with pluggable executors
- **EgetInitializer**: Handles eget CLI tool installation for Windows/Linux platforms
- **prepareInstallDirectory**: Prepares installation directories and manages GitHub Actions PATH
- **Dependencies**: Uses `@actions/core`, `@actions/io`, `@actions/tool-cache`, `@esta-utils/get-platform`, `@esta-utils/command-runner`, `@agla-utils/ag-logger`, `@shared/types`, `@shared/constants`

### Configuration-Based Tool Installation

Tools are configured via JSON files with this structure:

```json
{
  "installer": "eget",
  "name": "tool-name",
  "package": "owner/repo",
  "options": {
    "version": "latest",
    "installDir": ".tools/bin",
    "args": ["--quiet"]
  }
}
```

### Executor Pattern

The framework uses an executor pattern for different installation types:

- Executors implement `AgActionInstallerExecutor` interface
- `AgExecutorsMap` maps installer types to executor instances
- Currently supports `EGET_INITIALIZE` and `EGET` types
- Extensible for future installer types (script-based, etc.)

### Utility Package Architecture

- **@esta-utils/config-loader**: Universal configuration file loader supporting JSON, YAML, JS/TS
- **@esta-utils/get-platform**: Platform detection utilities for cross-platform compatibility
- **@esta-utils/command-runner**: Command existence checking and execution utilities
- **@agla-utils/ag-logger**: Structured logging with multiple output formats
- **@agla-e2e/fileio-framework**: File I/O testing framework for E2E scenarios
- **@shared/constants**: Central shared constants (exit codes, defaults, directories) used across packages
- **@shared/types**: Central shared TypeScript types for type safety across packages (currently minimal)

## Working in Specific Packages

When working within a specific package (like `@agla-utils/ag-logger`), use package-level commands from the package directory:

### Package-Level Development Workflow

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

## Pending Implementation Tasks

### LogLevel Validation Implementation (Priority: High)

**Status**: Ready for implementation
**Branch**: `refactor/ag-logger/typed-and-tested`
**Package**: `@agla-utils/ag-logger`

#### Requirements:

LogLevelが invalid (undefined, null, 文字列などの数字ではない型､A範囲外の数値) なら､A全てｴGﾗ臆[を投げる

#### Current State Analysis:

- LogLevel defined as numeric enum: VERBOSE(-99), OFF(0), FATAL(1), ERROR(2), WARN(3), INFO(4), DEBUG(5), TRACE(6)
- AgLoggerError class available for structured error handling
- AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL constant exists
- Current validation is compile-time only via TypeScript types

#### Implementation Plan (t-wada style BDD):

**1. BDD Test Suite**: `src/utils/__tests__/validateLogLevel.spec.ts`

- **Type validation tests**: undefined, null, strings, booleans, objects, arrays
- **Range validation tests**: negative out-of-range, positive out-of-range, decimal numbers
- **Valid cases tests**: all legitimate LogLevel values (-99, 0, 1, 2, 3, 4, 5, 6)
- Each test follows descriptive natural language naming
- Clear arrange/act/assert structure with single expectations

**2. Validation Function**: `src/utils/validateLogLevel.ts`

- Function signature: `validateLogLevel(input: unknown): AgLogLevel`
- Type guards for input type checking
- Range validation for numeric inputs
- Throws AgLoggerError with INVALID_LOG_LEVEL category and descriptive messages
- Returns properly typed AgLogLevel for valid inputs

**3. Update Existing Code**:

- Enhance AgLogLevelHelpers to use new validation function
- Maintain API compatibility while adding runtime safety
- Ensure all LogLevel usage points are protected

#### Expected Behavior:

All invalid LogLevel inputs (undefined, null, wrong types, out-of-range numbers) will throw structured AgLoggerError exceptions, while valid inputs return properly typed AgLogLevel values.

---

### important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

### Memo: other important instructions

- check errormessage with toThrow if you write expect
