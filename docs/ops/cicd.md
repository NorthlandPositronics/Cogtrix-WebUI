# CI/CD & DevOps Reference

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `next` | Integration branch — all feature/bugfix/hotfix PRs target here |
| `main` | Production — only accepts PRs from `next` or `release-please--*` branches |

Feature branches must follow the naming patterns enforced by the `Restricted Branch Names` ruleset: `feature/NNN-*`, `hotfix/NNN-*`, or `bugfix/NNN-*`.

## GitHub Actions Workflows

### `ci.yml` — CI Quality & Security

Runs on every pull request and push to `main`.

| Job | Trigger | Steps |
|-----|---------|-------|
| `quality` | PRs + push | Prettier, ESLint, `pnpm build` (type-check + bundle) |
| `test` | PRs + push | `pnpm test:unit` (Vitest, excludes integration tests) |
| `security` | PRs + push | OSV-scanner (advisory); pnpm audit on main push only |
| `docker` | PRs + push | Docker build — amd64 + arm64 native runners |
| `publish` | main push only | Build + push per-arch images to GHCR |
| `publish-manifest` | main push only | Create and push multi-arch manifest to GHCR |
| `summary` | always | Step summary table of all job outcomes |

Integration tests (`src/test/integration/**`) require a live backend at `localhost:8000` and are excluded from CI via the `test:unit` script.

### `guard-main-source.yml` — PR Source Guard

Blocks pull requests to `main` unless the source branch is `next` or matches `release-please--*`. Runs on every PR targeting `main`.

### `release-please.yml` — Automated Releases

Runs on push to `main`. Uses `googleapis/release-please-action@v4` to manage changelog and version bump PRs automatically.

- `update-lockfile` — when a release-please PR is open, regenerates `pnpm-lock.yaml` and commits it to the release branch
- `trigger-release` — when a release is created, dispatches `release.yml` with the new tag

### `release.yml` — Release Pipeline

Triggered by `workflow_dispatch` with a `tag` input (dispatched by `release-please.yml`).

Runs the full quality gate (Prettier + ESLint + build + unit tests), then builds and pushes Docker multi-arch images to GHCR tagged with the release version and `latest`.

### `request-devops-review.yml` — DevOps Review Request

Auto-requests `NorthlandPositronics/devops` as a reviewer on any PR opened or marked ready for review that targets `main`. Advisory only — does not block merge.

## GitHub Rulesets

Five rulesets are configured on the `NorthlandPositronics/Cogtrix-WebUI` repository:

### Production Branch (`main`)

- Deletion and creation blocked
- Required signatures on commits
- Non-fast-forward (force push) blocked
- Pull request required: 1 approval, stale reviews dismissed on push, thread resolution required, merge commits only
- Required status checks: `Source branch must be next` + `Code quality` + `Unit tests`
- Bypass actor: `OrganizationAdmin` (bypass mode: always) — required so GitHub's merge mechanism can push merge commits

### Restricted Branch Names

Blocks creation, update, and non-fast-forward on all branches except:
`feature/[0-9]*`, `hotfix/[0-9]*`, `bugfix/[0-9]*`, `release-please--*`, `main`, `next`

### Feature Branches

Requires signed commits on `feature/[0-9]*`, `hotfix/[0-9]*`, `bugfix/[0-9]*`.

### Allowed Tag Names

Restricts tag operations to `*v[0-9]*.[0-9]*.[0-9]*` pattern. Blocks deletion, non-fast-forward, and update on matching tags.

### Restricted Tag Names

Blocks creation and non-fast-forward on all tags not matching the versioned semver pattern.

## Docker Images

Images are published to GHCR: `ghcr.io/northlandpositronics/cogtrix-webui`

Tags:
- `<sha7>-amd64` / `<sha7>-arm64` — per-arch images (CI push to main)
- `<sha7>` — multi-arch manifest
- `latest` — multi-arch manifest pointing to latest main build
- `<version>` / `<version>-amd64` / `<version>-arm64` — release-tagged images (via `release.yml`)

Build uses a two-stage Dockerfile:
- Build stage: `node:25.8-alpine` with pnpm installed via `npm install -g pnpm@10.30.3` (corepack is not available in this image)
- Serve stage: `nginx:1.29-alpine`

## Test Scripts

```bash
pnpm test:unit    # Vitest unit tests only (excludes src/test/integration/**)
pnpm test         # All tests including integration (requires backend at localhost:8000)
pnpm test:watch   # Watch mode
```

## Dependabot

Configured in `.github/dependabot.yml` for weekly updates across:
- `npm` — production and dev dependencies
- `github-actions` — workflow action versions
- `docker` — base image versions

## Code Owners

`.github/CODEOWNERS` assigns `@C0derR0cks` as the default reviewer for all files. The DevOps team (`NorthlandPositronics/devops`) is auto-requested as an advisory reviewer via `request-devops-review.yml` but is not a required approver.
