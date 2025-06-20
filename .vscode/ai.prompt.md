# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Action monorepo for installing CLI tools via eget. The project uses pnpm workspaces to manage multiple packages in a TypeScript-based monorepo structure.

**Main Purpose**: Provides a GitHub Action that installs CLI tools easily via configuration files, powered by [eget](https://github.com/zyedidia/eget).

## Architecture

### Monorepo Structure

- `packages/@ag-actions/tool-installer` - Main GitHub Action implementation
- `packages/@ag-system/ag-logger` - Logging system with configurable levels
- `packages/@ag-utils/*` - Utility packages (command-utils, common, get-platform)
- `shared/` - Shared configurations and common code
- `scripts/` - PowerShell automation scripts

### Key Components

- **Tool Installer Framework**: Handles configuration parsing, tool installation via eget
- **AgLogger System**: Centralized logging with timestamp support and multiple log levels
- **Configuration Management**: JSON/JSONC config parsing with validation
- **Platform Detection**: Cross-platform utility for detecting OS/architecture

## Development Commands

### Package Management

```bash
pnpm install              # Install all dependencies
pnpm -r run build         # Build all packages
pnpm -r run clean         # Clean all build artifacts
```

### Code Quality

```bash
pnpm run lint             # Lint all packages (ESLint)
pnpm run lint:types       # Type-aware ESLint linting
pnpm run check:types      # TypeScript type checking
pnpm run format:dprint    # Format code (dprint)
pnpm run check:dprint     # Check code formatting
```

### Testing

- **TypeScript/Vitest**: `pnpm -r run test` (runs both unit and CI tests)
- **Unit tests**: `pnpm -r run test:develop` (src/**/*.spec.ts)
- **Integration tests**: `pnpm -r run test:ci` (tests/**/*.spec.ts)
- **PowerShell/Pester**: `.\scripts\run-tests.ps1` for script testing

### Individual Package Testing

```bash
cd packages/@ag-actions/tool-installer
pnpm run test:develop    # Unit tests only
pnpm run test:ci         # Integration/E2E tests
pnpm run test:watch      # Watch mode for development
```

## Build System

### TypeScript Configuration

- Dual build: CommonJS (`lib/`) and ESM (`module/`) outputs
- Uses `tsup` for bundling with separate configs for CJS/ESM
- Shared base configurations in `shared/configs/`

### Code Formatting

- **dprint**: Primary formatter (120 char line width, 2-space indent, single quotes)
- **ESLint**: Linting with TypeScript support and import resolution
- Configurations shared across packages via `shared/configs/`

## Testing Strategy

### Unit Tests (Development)

- Location: `src/**/*.spec.ts`
- Framework: Vitest with node environment
- Config: `vitest.config.unit.ts` in each package
- Run: `pnpm run test:develop`

### Integration Tests (CI)

- Location: `tests/**/*.spec.ts`
- Includes E2E testing with actual tool installation
- Config: `vitest.config.ci.ts` in each package
- Run: `pnpm run test:ci`

### PowerShell Tests

- Framework: Pester
- Location: `scripts/**/__tests__/*.Tests.ps1`
- Run: `.\scripts\run-tests.ps1`

## Git Workflow

### Pre-commit Hooks (lefthook)

- **Security**: gitleaks, secretlint
- **Code Quality**: ESLint (regular + types), filename linting
- **Formatting**: Spell checking via cspell
- **Commit Messages**: commitlint with conventional commits

### Commit Message Format

Uses conventional commits via commitlint. Current branch: `refactor-10/agLogger/extract` suggests refactoring work on AgLogger.

## Package Conventions

### Naming

- Actions: `@ag-actions/*`
- System utilities: `@ag-system/*`
- General utilities: `@ag-utils/*`

### Structure

Each package follows consistent structure:

```
src/           # Source code
configs/       # Package-specific configs
lib/           # CommonJS build output
module/        # ESM build output
__tests__/     # Unit tests
tests/         # Integration tests
```

### Dependencies

- Use workspace protocol (`workspace:*`) for internal dependencies
- Shared configs imported from `shared/configs/`
- Common types and constants from `@shared` package

## Development Notes

- Package manager: pnpm (>=10)
- Node version: >=20
- Windows-focused development (PowerShell scripts)
- All packages are private (not published to npm)
- Strict TypeScript configuration with comprehensive linting

## for Windows Execution

- using 'bash' instead of '/usr/bin/bash' for Windows bash execution
