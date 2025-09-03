# Development Workflow

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
- **Error Handling**: Implement comprehensive error handling with descriptive messages
- **Validation**: Include validation at both configuration and runtime levels
- **Testing**: Follow multi-tier testing strategy with appropriate test categories
