# Repository Guidelines

## Project Structure & Module Organization

- `src/`: TypeScript sources. Core classes (`AgLogger.class.ts`, `AgLoggerManager.class.ts`), `plugins/{logger,formatter}/`, `utils/`, and `__tests__/` for unit specs.
- `shared/`: Shared types and constants exported by the package.
- `tests/`: Integration (`tests/integration/`) and E2E (`tests/e2e/`) specs.
- `configs/`: Tooling configs (Vitest, ESLint, tsup, commitlint, secretlint).
- Build outputs: `lib/` (CJS) and `module/` (ESM). Do not edit generated files.
- `docs/`: Design notes and specs.

## Build, Test, and Development Commands

- `pnpm build`: Build CJS and ESM bundles via tsup.
- `pnpm clean`: Remove build artifacts and caches.
- `pnpm test:develop` | `test:ci` | `test:e2e` | `test:all`: Run unit, integration, e2e, or all tests with Vitest.
- `pnpm check:types`: Type-check with `tsc` (no emit).
- `pnpm lint` | `lint:types` | `lint:fix`: Lint (ESLint flat config), typed rules, or apply fixes.
- `pnpm format:dprint` | `check:dprint`: Format or verify formatting.
- `pnpm lint:secrets`: Scan repository for secrets with Secretlint.

## Coding Style & Naming Conventions

- Language: TypeScript (Node ≥20, ESM; CJS build emitted).
- Files: Classes use `PascalCase` and may end with `.class.ts` (e.g., `AgLogger.class.ts`). Utilities and functions use `camelCase` file names where applicable.
- Imports: Prefer ESM imports; path alias `@/*` maps to `src/*`.
- Lint/Format: ESLint (`configs/eslint.config.js`), typed lint (`configs/eslint.config.typed.js`), and dprint. Keep diffs clean and run format + lint before pushing.

## Testing Guidelines

- Framework: Vitest. Unit tests in `src/__tests__/`; integration/E2E under `tests/`.
- Naming: `*.spec.ts` or `*.test.ts` under the appropriate folder.
- Coverage: Text reporter configured; exclude tool/config files. Run `pnpm test:all` before PRs.

## Commit & Pull Request Guidelines

- Commits: Follow Conventional Commits (enforced via commitlint base). Examples: `feat(logger): add JSON formatter`, `fix(core): handle null options`.
- PRs: Include a clear description, linked issues, test evidence (output or screenshots for E2E), and notes on docs/typing impacts. Ensure green CI locally: build, type-check, lint, tests.

## Security & Configuration Tips

- Secrets: Use `pnpm lint:secrets` before publishing. Do not commit credentials.
- Config sync: Some configs inherit from the workspace base; avoid local drift unless justified.

## MCP in Codex CLI

- Purpose: Enable MCP servers for Codex in this repo.
- Config file: `.mcp.json` at the repo root defines servers (e.g., `lsmcp`, `serena-mcp`).
- Codex usage: Codex auto-loads `.mcp.json` from the workspace. Use your Codex `/mcp` command to view status and available tools.
- Add a server: Edit `.mcp.json` to include an entry with `type`, `command`, and `args`. Keep paths workspace-relative when possible.
- Local state: `.lsmcp/` holds cache/memories for the `lsmcp` server; it may be regenerated.
