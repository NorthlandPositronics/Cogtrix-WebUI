# Contributing to Cogtrix WebUI

Thank you for your interest in Cogtrix WebUI! We welcome bug reports, feature suggestions, and code contributions under the terms described below.

## Important: Licensing

Cogtrix is released under the **Cogtrix Source-Available License 1.0**. By submitting any contribution (bug report, suggestion, patch, pull request, or other material), you agree that:

1. Your contribution may be used, modified, and incorporated into the Software by Northland Positronics (FZE) without restriction or obligation to you.
2. You have the right to submit the contribution and it does not violate any third-party rights.
3. Your contribution is provided under the same license terms as the Software.

See the [LICENSE](LICENSE) file for full terms.

## Getting Started

1. **Fork** the repository and clone your fork.
2. **Install dependencies:** `pnpm install`.
3. **Run the build** to make sure everything works: `pnpm build`.
4. **Read the API docs** — [`docs/api/`](docs/api/) for backend API contract and integration patterns.

## How to Contribute

### Reporting Bugs

1. Check existing [issues](../../issues) to avoid duplicates.
2. Open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the problem
   - Expected vs. actual behavior
   - Your environment (OS, browser, Node.js version)
   - Console errors or screenshots if applicable

### Suggesting Features

1. Open an issue with the **feature request** label.
2. Describe the use case — what problem does it solve?
3. If possible, include a mockup or describe the interaction.

### Submitting Code

1. Create a feature branch from `main`.
2. Make your changes following the code style guidelines below.
3. Run all quality checks:

```bash
pnpm build          # type-check + production build
pnpm lint           # ESLint
pnpm format:check   # Prettier
```

4. Submit a pull request with:
   - A clear description of what the change does and why
   - Reference to any related issues

## Code Style

- TypeScript strict mode
- Follow existing code patterns and conventions
- Format with [Prettier](https://prettier.io/) (line length 100, double quotes)
- Lint with [ESLint](https://eslint.org/)
- Use Tailwind CSS utility classes and shadcn/ui components
- Keep commits focused — one logical change per commit
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, etc.)

## Code of Conduct

All participants are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

If you have questions about contributing, open a discussion or issue.
