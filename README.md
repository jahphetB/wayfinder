# Yote Wayfinder

Yote Wayfinder is a responsive navigation-map prototype. It provides mock origin and destination search, a sample route, and a 2D/3D MapLibre map with an OpenStreetMap basemap without requiring a routing backend.

## Current progress

| Step                             | Status   | Outcome                                                                                                        |
| -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| 1. Project foundation            | Complete | React, TypeScript, quality checks, test tooling, and production builds are configured.                         |
| 2. Domain and map abstraction    | Complete | Provider-independent models, validated mock data, and a tested MapLibre boundary are in place.                 |
| 3. Navigation interface          | Complete | Responsive location inputs, autocomplete, swapping, route preview, and a visual map placeholder are ready.     |
| 4. Interactive map               | Complete | MapLibre renders the selected route and locations, fits the camera, and switches between 2D and 3D views.      |
| 5. Application states and polish | Complete | Clear route and map states, keyboard autocomplete, accessible status messaging, and map recovery are in place. |

See the [architecture handbook](docs/ARCHITECTURE.md),
[detailed progress log](docs/PROGRESS.md), and
[AI skills inventory](docs/AI_SKILLS.md).

## Local development

```bash
npm install
npm run dev
```

Open the exact local URL printed by Vite. If the default port is already in
use, Vite selects another port such as `http://localhost:5174/`.

MapLibre's vendor stylesheet is loaded before the application's stylesheet in
`src/main.tsx`. This order lets the application preserve the map host's full
height. If the map canvas exists but is not visible, inspect `.map-canvas` in
the browser and confirm that its computed height is greater than zero.

The default street tiles come from OpenStreetMap for prototype use. Set
`VITE_MAP_STYLE_URL` to a compatible hosted MapLibre style URL when a dedicated
production tile provider is selected.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Architecture

The [living architecture handbook](docs/ARCHITECTURE.md) explains every current
folder and file, the route-preview data flow, safe change recipes,
troubleshooting, and the architectural decision log in non-technical language.

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
