---
header:
  - src: testing.md
  - @(#): テスト戦略とフレームワークガイド
title: Testing Strategy
description: モノレポ全体で使用するテストフレームワーク、テストカテゴリ、テストアプローチの説明
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

## Testing Strategy

This file describes the testing framework, test categories, and testing approaches used across the monorepo.

### Testing Framework

- **Test Runner**: Vitest with separate configs for unit, functional, integration, and E2E tests

### Test Configuration Files

- **Unit Tests**: `./configs/vitest.config.unit.ts`
- **Functional Tests**: `./configs/vitest.config.functional.ts`
- **Integration Tests**: `./configs/vitest.config.integration.ts`
- **E2E Tests**: `./configs/vitest.config.e2e.ts`
- **GitHub Actions Tests**: Special config for testing GitHub Actions workflows

### Test Categories

### Unit Tests

- **Location**: `src/**/*.spec.ts`
- **Purpose**: Individual functions/classes testing
- **Scope**: Isolated component testing
- **Command**: `pnpm run test:develop`

### Functional Tests

- **Location**: `src/**/*functional.spec.ts`
- **Purpose**: Feature-level behavior testing
- **Scope**: Component integration within a single package
- **Command**: `pnpm run test:functional`

### Integration Tests

- **Location**: `tests/integration/**/*.spec.ts`
- **Purpose**: Component interactions across packages
- **Scope**: Multi-package integration scenarios
- **Command**: `pnpm run test:ci`

### E2E Tests

- **Location**: `tests/e2e/**/*.spec.ts`
- **Purpose**: End-to-end scenarios
- **Scope**: Full system behavior validation
- **Command**: `pnpm run test:e2e`

### GitHub Actions Tests

- **Purpose**: Special config for testing GitHub Actions workflows
- **Command**: `pnpm run test:gha`

### Special Testing Features

### File I/O Testing

- **Framework**: `@agla-e2e/fileio-framework`
- **Purpose**: File I/O operations testing for E2E scenarios
- **Usage**: Provides utilities for file system testing in E2E tests

### GitHub Actions Testing

- **Special Config**: GitHub Actions specific testing with `test:gha` command
- **Purpose**: Validate GitHub Actions workflow functionality
- **Integration**: Tests deployment and CI/CD pipeline behavior

### Reporting

- **JUnit**: JUnit reporting for CI environments
- **Integration**: Seamless integration with CI/CD pipelines

### BDD-style Testing

- **Approach**: Descriptive test names using natural language
- **Structure**: Clear arrange/act/assert structure
- **Methodology**: Following atsushifx式 BDD methodology
- **Success Case**: `@shared/types` AglaError implementation with 77-task comprehensive test coverage

### Testing Strategy

### Unit Testing Strategy

- **Focus**: Individual functions and classes
- **Isolation**: Mock external dependencies
- **Coverage**: Comprehensive test coverage for business logic
- **Validation**: Type safety and edge case handling

### E2E Testing Strategy

- **Focus**: Integration scenarios
- **Scope**: End-to-end system behavior
- **Fixtures**: Fixture-based testing for complex scenarios
- **Real Environment**: Testing with realistic data and configurations
- **Comprehensive Coverage**: `@shared/types` demonstrates 17 E2E test files covering failure simulation, error chaining, and system integration scenarios

### GitHub Actions Testing Strategy

- **Focus**: Deployment validation
- **Scope**: CI/CD pipeline functionality
- **Integration**: Workflow and action testing
- **Environment**: Testing in GitHub Actions environment

### Test Organization

### Test File Naming Conventions

- **Unit Tests**: `*.spec.ts`
- **Functional Tests**: `*functional.spec.ts`
- **Integration Tests**: `tests/integration/**/*.spec.ts`
- **E2E Tests**: `tests/e2e/**/*.spec.ts`

### Test Structure

- **Descriptive Names**: Natural language test descriptions
- **Single Expectations**: One assertion per test case
- **Clear Structure**: Arrange/Act/Assert pattern
- **BDD Approach**: Behavior-driven development methodology

### Quality Assurance Integration

Testing integrates with the overall quality assurance process:

- **Pre-commit**: Tests run as part of pre-commit hooks
- **CI/CD**: Automated testing in continuous integration
- **Type Safety**: TypeScript integration for type-safe tests
- **Coverage**: Test coverage reporting and validation
