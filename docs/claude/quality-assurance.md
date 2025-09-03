# Quality Assurance

This file describes the code quality tools, linting configurations, and quality assurance processes used across the monorepo.

## Code Quality Tools

### Linting

- **ESLint**: ESLint with TypeScript support and separate typed/untyped configs
- **Basic Config**: Standard ESLint rules for general code quality
- **TypeScript Config**: TypeScript-aware ESLint rules for type safety

### Formatting

- **dprint**: Primary code formatting tool
- **Configuration**: Centralized formatting rules
- **Integration**: Pre-commit hook integration

### Spell Checking

- **cspell**: Comprehensive spell checking with custom dictionary
- **Scope**: Code, documentation, and configuration files
- **Custom Dictionary**: Project-specific terms and technical vocabulary

### Security

- **secretlint**: Secret detection and prevention
- **Scope**: All files for sensitive information
- **Integration**: Pre-commit and CI/CD pipeline integration

### File Naming

- **ls-lint**: Filename convention enforcement
- **Standards**: Consistent naming across the monorepo
- **Rules**: Package-specific and global naming conventions

### Text Quality

- **textlint**: Prose quality checking
- **markdownlint-cli2**: Markdown-specific linting
- **Documentation**: Ensures high-quality documentation

## Quality Assurance Commands

### Global Quality Checks

Run these commands from the root directory:

```bash
# Linting
pnpm run lint                    # Basic linting for all packages
pnpm run lint:types              # Type-aware linting for all packages
pnpm run lint-all                # Lint all files with basic ESLint config
pnpm run lint-all:types          # Lint all files with TypeScript-aware ESLint config

# Specialized Linting
pnpm run lint:filenames          # Check filename conventions with ls-lint
pnpm run lint:text               # Check text files with textlint
pnpm run lint:markdown           # Check markdown files with markdownlint
pnpm run lint:secrets            # Check for secrets with secretlint

# Formatting and Code Quality
pnpm run format:dprint           # Format code with dprint
pnpm run check:dprint            # Check code formatting with dprint
pnpm run check:spells            # Spell checking with cspell

# Type Checking
pnpm run check:types             # Type check all packages
```

### Package-Level Quality Checks

Run these commands from individual package directories:

```bash
# Linting
pnpm run lint                    # ESLint with basic config
pnpm run lint:types              # ESLint with TypeScript rules
pnpm run lint:all                # Run both lint commands
pnpm run lint:fix                # Auto-fix linting issues
pnpm run lint:secrets            # Check for secrets with secretlint

# Type Checking and Spell Checking
pnpm run check:types             # TypeScript type checking
pnpm run check:spells            # Spell checking for package files
```

## Quality Assurance Workflow

### Pre-commit Integration

Quality checks are integrated into the development workflow through lefthook:

- **Linting**: Automatic code quality checks
- **Formatting**: Code formatting validation
- **Spell Checking**: Documentation and code spell checking
- **Secrets Detection**: Prevent accidental secret commits

### Post-Implementation Quality Checks

After implementation, run these commands to debug errors:

```bash
pnpm run lint-all                # Lint all files with basic ESLint config
pnpm run lint-all:types          # Lint all files with TypeScript-aware ESLint config
pnpm run check:types             # TypeScript type checking
pnpm run check:spells **/*.{ts,md,json}  # Spell checking
pnpm run check:dprint            # Code formatting verification
```

## Configuration Management

### Centralized Configuration

- **Base Configs**: Shared quality tool configurations in `base/configs/`
- **Package-Specific**: Individual package configurations in `configs/`
- **Synchronization**: Automated sync from shared to package-specific configs

### Configuration Files

- **ESLint**: `eslint.config.base.js` and package-specific configs
- **dprint**: `dprint.jsonc` for formatting rules
- **TypeScript**: `tsconfig.base.json` with package extensions
- **Spell Checking**: Custom dictionaries and cspell configuration

## Quality Standards

### Code Standards

- **TypeScript Strict Mode**: Full strict mode enforcement
- **ESLint Rules**: Comprehensive linting for code quality
- **Formatting**: Consistent code formatting across all packages

### Documentation Standards

- **Spell Checking**: All documentation must pass spell checking
- **Markdown Linting**: Consistent markdown formatting
- **Text Quality**: High-quality prose in documentation

### Security Standards

- **Secret Detection**: No secrets or credentials in code
- **Security Linting**: Automated security vulnerability detection
- **Best Practices**: Follow security best practices for TypeScript/Node.js

## Integration with Development Workflow

Quality assurance is integrated throughout the development process:

- **Development**: Real-time linting and formatting in IDEs
- **Pre-commit**: Automated quality checks before commits
- **CI/CD**: Quality validation in continuous integration
- **Code Review**: Quality metrics as part of review process
