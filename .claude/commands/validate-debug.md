# /validate-debug Command

Comprehensive validation and debugging workflow for the E2E framework.

## Phase 1: Code Quality

### Phase 1-2: Code Quality (ESTA Root)

- Run `pnpm run lint-all` - ESLint code analysis
- If fails: Parse ESLint output, categorize errors (syntax, style, best practices), auto-fix fixable issues with `--fix`, report remaining issues with explanations
- Run `pnpm run lint-all:types` - TypeScript ESLint analysis
- If fails: Parse ESLint output, categorize errors (syntax, style, best practices), auto-fix fixable issues with `--fix`, report remaining issues with explanations

### Phase 1-2: Code Quality

- Run `pnpm run lint` - ESLint code analysis
- If fails: Parse ESLint output, categorize errors (syntax, style, best practices), auto-fix fixable issues with `--fix`, report remaining issues with explanations
- Run `pnpm run lint:types` - TypeScript ESLint analysis
- If fails: Parse ESLint output, categorize errors (syntax, style, best practices), auto-fix fixable issues with `--fix`, report remaining issues with explanations

## Phase 2: Testing

- Run `pnpm run test:develop` - Execute development tests
- Run `pnpm run test:ci` - Execute CI (Integrate) tests
- Run `pnpm run test:e2e` - Execute CI (E2E) tests
- If fails: Read test output, identify failing tests, analyze error messages, check for common issues (imports, types, async/await, mocking), suggest specific fixes

**Note**: `/shared/` packages (constants and type definitions only) are expected to have missing node_modules and no test files. This is normal and should not be reported as errors.

## Phase 3: Type Checking

- Run `pnpm run check:types` - TypeScript compiler validation
- If fails: Parse TypeScript compiler errors, identify missing types, import issues, type mismatches, suggest specific fixes for each error

## Phase 4: Content Validation

- Run `pnpm run check:spells "**/*.{js,ts,json,md}"` - spell checking
- If fails: List misspelled words, suggest corrections, check if they should be added to dictionary

## Phase 5: Filename Validation

- Run `pnpm run lint:filenames` - Filename lint
- If fails: List misspelled words, suggest corrections, check if they should be added to dictionary

## Phase 6: Formatting

- Run `pnpm run check:dprint` - Code formatting validation
- If fails: Auto-run `pnpm run format:dprint`, then re-check

## Error Analysis Protocol

For each failed command:

1. Capture and parse error output
2. Identify error patterns and root causes
3. Cross-reference with codebase to understand context
4. Provide specific, actionable fix recommendations
5. Offer to implement fixes automatically where safe
6. Track all issues in a summary report

## Final Report

- ✅ Passed steps
- ❌ Failed steps with detailed analysis
- 🔧 Suggested fixes (manual and automatic)
- 📊 Overall health score
