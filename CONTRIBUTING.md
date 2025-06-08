# Contributing to Teaching Engine 2.0

Thank you for your interest in improving the project. This document outlines how to propose changes.

## Pull Requests

- Use **conventional commit** messages for all commits.
- Open pull requests against the `main` branch.
- Ensure your PR description references any relevant issues and includes a clear summary of changes.
- Before pushing, run `pnpm test && pnpm lint` to verify code quality. Builds should also succeed with `pnpm build` when applicable.

## Coding Standards

Project style rules are defined in [AGENTS.md](AGENTS.md). Follow these guidelines:

- TypeScript must use strict mode with explicit types.
- React components should be functional and use hooks.
- Styling relies on Tailwind utilities only.
- State management uses TanStack Query for server state and `useState` for local UI state.

Refer to **AGENTS.md** for additional standards around documentation, naming, and testing practices.

## Testing

All features must include tests. New code should maintain at least the project's current coverage levels. Run the test suite and linter before committing:

```bash
pnpm test && pnpm lint
```

For complex features, write the failing test first (TDD) and mock any external services as documented in `AGENTS.md`.
