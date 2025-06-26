# ESTA - Phased Validation & Debug

## Phase 1: Unit Tests

**Run**: `pnpm run test:develop`
**Check**: All unit tests pass, no test failures
**Debug**: If failures occur, analyze test output and fix failing tests

## Phase 2: E2E Tests

**Run**: `pnpm run test:ci`
**Check**: All E2E integration tests pass
**Debug**: If failures occur, check environment setup and test configurations

## Phase 3: Code Linting

**Run**: `pnpm run lint`
**Check**: No ESLint errors or warnings
**Debug**: If errors found, review code style and fix linting issues

## Phase 4: Type Linting

**Run**: `pnpm run lint:types`
**Check**: No TypeScript linting errors
**Debug**: If errors found, fix TypeScript-specific linting issues

## Phase 5: Type Checking

**Run**: `pnpm run check:types`
**Check**: No TypeScript compilation errors
**Debug**: If errors found, resolve type errors and missing type definitions

## Phase 6: Spell Checking

**Run**: `pnpm run check:spells **/*.ts **/*.md`
**Check**: No spelling errors in TypeScript and Markdown files
**Debug**: If errors found, fix typos or add words to dictionary

## Phase 7: Code Formatting

**Run**: `pnpm run check:dprint`
**Then**: `pnpm run format:dprint`
**Check**: Code formatting is consistent
**Debug**: If issues found, apply automatic formatting

---

**Instructions**: Execute each phase sequentially, report status after each phase, and provide summary at the end. Stop and debug if any phase fails before proceeding to the next phase.
