# Pending Implementation Tasks

This file tracks current implementation priorities and pending development tasks.

## Completed Major Projects

### AglaError Type System Enhancement (✅ Completed)

**Status**: Completed (77/77 tasks)\
**Completion Date**: 2025-09-02\
**Package**: `@shared/types`

#### Achievements

- ✅ **Phase 0**: Record<> type refactoring to dedicated types (12 tasks)
- ✅ **Phase 1**: Unit test organization and enhancement (10 tasks)
- ✅ **Phase 2**: Functional test reinforcement (18 tasks)
- ✅ **Phase 3**: Integration test expansion (15 tasks)
- ✅ **Phase 4**: E2E test realization (20 tasks)

#### Key Deliverables

- Mature AglaError abstract class with error chaining, serialization, and context support
- ErrorSeverity enum (FATAL, ERROR, WARNING, INFO)
- Complete migration from generic Record<> types to dedicated type definitions
- Comprehensive test coverage across all test levels
- Full API compatibility maintenance (zero breaking changes)

---

## Current Priority Tasks

### LogLevel Validation Implementation (Priority: High)

**Status**: Ready for implementation\
**Branch**: `refactor/ag-logger/typed-and-tested`\
**Package**: `@agla-utils/ag-logger`

#### Requirements

LogLevelが invalid (undefined, null, 文字列などの数字ではない型､A範囲外の数値) なら､A全てｴGﾗ臆[を投げる

#### Current State Analysis

- LogLevel defined as numeric enum: VERBOSE(-99), OFF(0), FATAL(1), ERROR(2), WARN(3), INFO(4), DEBUG(5), TRACE(6)
- AgLoggerError class available for structured error handling
- AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL constant exists
- Current validation is compile-time only via TypeScript types

#### Implementation Plan (t-wada style BDD)

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

#### Expected Behavior

All invalid LogLevel inputs (undefined, null, wrong types, out-of-range numbers) will throw structured AgLoggerError exceptions, while valid inputs return properly typed AgLogLevel values.

---

## Future Architecture Plans

### AglaError Package Migration (Future)

**Priority**: Medium (post-documentation completion)\
**Rationale**: Separation of concerns and improved package organization

#### Migration Strategy

- **Target Package**: `@esta-error/agla-error` (new package)
- **Current Location**: `@shared/types`
- **Dependencies**: 77-task test suite migration required

#### Benefits

- Clear responsibility separation (shared types vs error handling)
- Improved reusability of error handling functionality
- Better maintainability with feature-specific packages
- Elimination of potential circular dependency risks

#### Implementation Phases

1. Create `@esta-error/agla-error` package structure
2. Migrate AglaError class, ErrorSeverity enum, and related types
3. Migrate comprehensive test suite (unit/functional/integration/e2e)
4. Update cross-package dependencies and imports
5. Refactor `@shared/types` to basic type definitions only

**Timing**: After current documentation improvement tasks completion

---

## Task Management Notes

### Implementation Guidelines

- Follow BDD methodology with RED/GREEN cycles
- Ensure comprehensive test coverage before implementation
- Maintain backward compatibility unless explicitly breaking changes are planned
- Use existing error handling patterns and infrastructure

### Quality Assurance Requirements

All implementation tasks must pass:

- Type checking (`pnpm run check:types`)
- Linting (`pnpm run lint-all:types`)
- Spell checking (`pnpm run check:spells`)
- Formatting (`pnpm run check:dprint`)
- All relevant test suites
