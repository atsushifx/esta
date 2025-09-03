# Project Overview

This file provides an overview of the TypeScript monorepo structure and package organization.

## Project Description

This is a TypeScript monorepo focused on building GitHub Actions and utility packages, particularly for CLI tool installation and automation. The primary project is the "Easy Setup Tools Action" which uses eget to install CLI tools in GitHub Actions workflows.

The action supports configuration-based tool installation with JSON config files, allowing users to specify tools, versions, and installation options. It currently supports eget-based installation with plans for script-based installation.

**Note**: This repository is currently undergoing a major refactoring to reorganize packages and improve the codebase structure. Some packages may be in transition or have been recently moved/renamed.

## Monorepo Structure

This is a TypeScript monorepo using pnpm workspaces with 6 main categories plus shared packages:

### Package Categories

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
  - `types` - Shared TypeScript types including mature error handling system with AglaError abstract class

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
- **@shared/types**: Mature error handling system with AglaError abstract class, ErrorSeverity enum, and comprehensive type definitions
