# Git Hooks

This project uses [Husky](https://typicode.github.io/husky) to manage git hooks and ensure code quality.

## Pre-commit Hook

The pre-commit hook runs [lint-staged](https://github.com/okonet/lint-staged) which:

- Runs ESLint on TypeScript/JavaScript files and automatically fixes issues
- Formats all code files using Prettier
- Only processes files that are staged for commit

Configuration is in `package.json` under the `lint-staged` key.

## Commit Message Hook

The commit-msg hook uses [commitlint](https://commitlint.js.org/) to enforce conventional commit message format:

- **Format**: `type(scope): subject`
- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Examples**: 
  - `feat: add user authentication`
  - `fix: resolve dashboard loading issue`
  - `docs: update API documentation`

Configuration is in `.commitlintrc.json`.

## Setup

Hooks are automatically installed when running `pnpm install` due to the `prepare` script in package.json.

To manually install: `npx husky install`

## Bypass (Not Recommended)

To bypass hooks in emergencies:
- Pre-commit: `git commit --no-verify`
- Commit-msg: `git commit -m "message" --no-verify`

Use sparingly as this defeats the purpose of maintaining code quality.