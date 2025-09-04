---
header:
  - src: claude/development.md
  - @(#): 開発ワークフローと実装プロセスの詳細ガイド
title: Development Workflow
description: 開発プラクティス、ワークフローパターン、パッケージ固有の開発プロセスの詳細ガイド
version: 1.0.0
created: 2025-09-04
authors:
  - atsushifx
changes:
  - 2025-09-04: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## Development Workflow

This file describes development practices, workflow patterns, and package-specific development processes.

## Development Workflow

### Pre-commit Process

- **Pre-commit**: lefthook for running quality checks (linting, formatting, spell checking, secrets detection)
- **Config Management**: Centralized configuration with sync scripts
- **Build Process**: Dual-target builds (CJS/ESM) with declaration files

### Testing Approach

- **Testing**: Multi-tier testing with unit, functional, integration, E2E, and GitHub Actions specific tests

### BDD Process

Strict BDD implementation following atsushifx式 methodology:

- **1 message = 1 test**: Single `it()` per implementation cycle
- **RED/GREEN confirmation**: Required before proceeding to next step
- **Minimal implementation**: For test passage only
- **Natural language descriptive test naming**: Clear, descriptive test names

### Development Tools

- **PowerShell scripts**: For tooling installation and development environment setup
- **Commit Messages**: Automated commit message generation using codegpt

## Working in Specific Packages

When working within a specific package (like `@agla-utils/ag-logger`), use package-level commands from the package directory.

### Package-Level Development Workflow

```bash
# From package directory (e.g., packages/@agla-utils/ag-logger/)
pnpm run build           # Build current package
pnpm run test:develop    # Run unit tests
pnpm run test:e2e        # Run E2E tests
pnpm run lint:all        # Run all linting
pnpm run check:types     # Type checking
```

### Package Development Best Practices

1. **Understand the Context**: Before making changes to files, first understand the file's code conventions
2. **Follow Conventions**: Mimic code style, use existing libraries and utilities, and follow existing patterns
3. **Library Validation**: NEVER assume that a given library is available, even if it is well known. Always check that the codebase uses the given library
4. **Component Creation**: When creating new components, look at existing components for patterns, framework choices, naming conventions, and typing
5. **Contextual Editing**: When editing code, examine surrounding context (especially imports) to understand framework and library choices

### Security Best Practices

- Always follow security best practices
- Never introduce code that exposes or logs secrets and keys
- Never commit secrets or keys to the repository

## Development Patterns

### Following Conventions

When making changes to files:

1. **Code Style**: First understand the file's code conventions
2. **Existing Libraries**: Check what libraries and utilities are already being used
3. **Pattern Consistency**: Follow existing patterns in the codebase
4. **Framework Integration**: Make changes that are idiomatic to the existing framework choices

### Key Development Principles

- **ESM-first**: Prefer ESM modules with CommonJS compatibility
- **Type Safety**: Use TypeScript strict mode and comprehensive typing
- **Error Handling**: Implement comprehensive error handling with AglaError system (see below)
- **Validation**: Include validation at both configuration and runtime levels
- **Testing**: Follow multi-tier testing strategy with appropriate test categories

## Error Handling Patterns

### AglaError System (Enhanced 2025-09-02)

The project now uses a comprehensive AglaError system with enhanced type safety and testing coverage:

#### Enhanced Type Safety

**Preferred Pattern**: Use structured `AglaErrorContext` instead of generic `Record<>`

```typescript
// ✅ Recommended: Type-safe context
const context: AglaErrorContext = {
  userId: 'user123',
  requestId: 'req-456',
  timestamp: new Date().toISOString(),
  metadata: { source: 'api' },
};

const error = new MyAglaError('API_ERROR', 'Request failed', {
  code: 'API001',
  severity: ErrorSeverity.ERROR,
  context: context, // Full type safety
});

// ❌ Legacy pattern (still supported but not recommended)
const legacyContext: Record<string, unknown> = { legacy: true };
```

#### Error Creation Patterns

```typescript
// Standard error with full context
const standardError = new MyAglaError('VALIDATION_ERROR', 'Invalid input', {
  code: 'VAL001',
  severity: ErrorSeverity.WARN,
  context: {
    field: 'email',
    value: 'invalid-email',
    validationRule: 'email-format',
  },
});

// Error chaining for root cause analysis
const chainedError = apiError.chain(networkError);
```

#### BDD Testing Requirements

All new error handling must include BDD-structured tests:

```typescript
describe('Given API error scenario', () => {
  describe('When processing invalid request', () => {
    it('Then should create properly structured error', () => {
      // Given: Invalid request scenario
      const invalidData = { email: 'not-an-email' };

      // When: Error is created
      const error = new ValidationError('INVALID_EMAIL', 'Email format invalid', {
        code: 'VAL001',
        context: { field: 'email', value: invalidData.email },
      });

      // Then: Error should be properly structured
      expect(error.errorType).toBe('INVALID_EMAIL');
      expect(error.context?.field).toBe('email');
      expect(error.code).toBe('VAL001');
    });
  });
});
```

### Test Coverage Improvements

**Enhanced Coverage (77 tasks completed)**:

- **Unit Tests**: 13 files covering core functionality
- **Functional Tests**: 2 files for workflow integration
- **Integration Tests**: 8 files for system-level testing
- **E2E Tests**: 17 files for real-world scenarios
- **Total**: 38 comprehensive test files

### Type Safety Migration

**Completed Migration**:

- ✅ `Record<string, unknown>` → `AglaErrorContext` (100% complete)
- ✅ Type guards and validation functions implemented
- ✅ Full backward compatibility maintained (0 breaking changes)
- ✅ IDE support and IntelliSense improvements
