# Yote Wayfinder

Yote Wayfinder is a responsive navigation-map prototype. It will provide mock origin and destination search, a sample route, and a 2D/3D MapLibre map without requiring a routing backend.

## Current progress

| Step                          | Status   | Outcome                                                                                        |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| 1. Project foundation         | Complete | React, TypeScript, quality checks, test tooling, and production builds are configured.         |
| 2. Domain and map abstraction | Complete | Provider-independent models, validated mock data, and a tested MapLibre boundary are in place. |
| 3. Navigation interface | Complete | Responsive location inputs, autocomplete, swapping, route preview, and a visual map placeholder are ready. |

See [the detailed progress log](docs/PROGRESS.md) and [the AI skills inventory](docs/AI_SKILLS.md).

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Architecture

- `src/app` contains application composition and global styles.
- `src/domain` contains provider-independent business models and validation.
- `src/data` contains local mock data built from domain models.
- `src/features/map` contains the map contract and provider-specific infrastructure.
- `src/composition` connects contracts to concrete implementations.

This separation means route data can be replaced with a live routing service and MapLibre can be replaced with another map provider without rewriting UI code.

## GitHub publishing

The repository uses a local `main` branch and focused commits. To connect it to GitHub after creating an empty repository there, run:

```bash
git remote add origin https://github.com/<account>/<repository>.git
git push -u origin main
```

Pushing is intentionally performed only after explicit user approval. Confirm the remote with `git remote -v` before the first push.
