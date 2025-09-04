---
header:
  - src: architecture.md
  - @(#): システムアーキテクチャと技術インフラ構成ガイド
title: Architecture Guide
description: システムアーキテクチャ、ビルド設定、技術インフラの詳細ガイド
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

## Architecture Guide

This file describes the system architecture, build configuration, and technical infrastructure of the monorepo.

### Build System

- **Build Tool**: tsup for both CommonJS and ESM outputs
- **Output Structure**: Each package produces `lib/` (CJS) and `module/` (ESM) directories
- **Package Manager**: pnpm with workspace protocol (`workspace:*`) for internal dependencies
- **TypeScript**: Strict mode with ES2022 target, bundler module resolution

### Configuration Management

#### Shared Configurations

- **Shared Configs**: Centralized in `base/configs/` and `configs/`
- **Per-Package Configs**: Each package has its own `configs/` directory
- **Config Sync**: Script-based synchronization from shared configs to packages using `scripts/sync-configs.sh`
- **Base Configs**: `tsconfig.base.json`, `eslint.config.base.js`, etc.

#### Package Scripts Management

- **Package Scripts Sync**: Automated synchronization of package.json scripts using `scripts/sync-package-scripts.ts`
- **Base Scripts**: Standardized package.json scripts defined in `base/configs/base-scripts.json`

### TypeScript Configuration

#### Core Settings

- **Path Mapping**: `@shared/*` for internal shared modules (`@shared/constants`, `@shared/types`)
- **Package-Specific Aliases**: `@/*` maps to `src/*` in most packages
- **Strict Mode**: Full TypeScript strict mode enabled
- **Build Cache**: Incremental compilation with `.cache/` directories
- **Target**: ES2022 with bundler module resolution

#### Module Resolution

- **ESM-first**: ESM-first approach with CommonJS compatibility
- **Workspace Protocol**: Internal dependencies use `workspace:*`
- **Export Maps**: Proper export maps in package.json for dual publishing
- **Path Mapping**: Clean imports through TypeScript path mapping

### Module System

#### Import/Export Strategy

- ESM-first with CommonJS compatibility
- Workspace protocol for internal dependencies
- Proper export maps in package.json for dual publishing
- Path mapping for clean imports

#### Internal Dependencies

All internal package dependencies use the workspace protocol (`workspace:*`) to ensure proper resolution during development and consistent versioning.

### Error Handling Architecture

#### Comprehensive Error Management

- Comprehensive error handling with descriptive messages
- Type-safe error patterns using TypeScript
- Validation at configuration and runtime levels

#### Centralized Error Handling

The `@esta-core/error-handler` package provides centralized error management and exit handling across all packages.

### Key Patterns

#### Package Structure Consistency

All packages follow a standardized structure with consistent build outputs, configuration management, and testing approaches.

#### Configuration-Based Architecture

The system uses JSON-based configuration files for tool installation and package management, providing flexibility and maintainability.

#### Pluggable Executor System

The framework implements an executor pattern that allows for different installation types and easy extensibility for future requirements.
