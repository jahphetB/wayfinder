# Yotes Wayfinder

A responsive campus navigation prototype built with React, TypeScript,
MapLibre, and Three.js. Walking routes are calculated locally from an
OpenStreetMap-derived campus network; no routing backend is required.

[Open the prototype](https://wayfinder-umber.vercel.app/) ·
[Architecture handbook](docs/ARCHITECTURE.md) ·
[Progress](docs/PROGRESS.md)

Release requirements and the current verification record are documented in the
[release readiness assessment](docs/RELEASE_READINESS.md).

## Features

- Search among 50 mapped buildings, courts, parking areas, and landmarks.
- Preview walking routes with distance, estimated time, and turn instructions.
- Follow simulated checkpoints with Start navigation, Next Turn, and Back.
- Switch between tilted 2D and 3D views, including one illustrative library model.
- Show a retryable map error when graphics initialization fails.
- Request a short refined location lookup to display an approximate position or an
  off-campus, uncertain, or unavailable-location message.
- Preview a separate, illustrative stadium driving handoff.
- Open library, Sterry Hall, and cafeteria details by selecting their outlined
  buildings. Popups include image slides and scrollable information; photographs
  have not been supplied, so the two photo slots show explicit placeholders.

Routes, entrance connectors, access conditions, and model height are prototype
data. They are not verified walking, accessibility, driving, or emergency
guidance. The stadium preview includes private-tagged driveways and does not
provide car turn-by-turn navigation.

## Run locally

```bash
npm ci
npm run dev
```

Open the exact URL printed by Vite. If the default port is occupied, Vite
selects another available port.

Navigation uses simulated checkpoint readings by default, so routes can be
tested without moving or granting location permission. The separate
**Get your location** button briefly collects real browser readings when pressed
and selects the best recent reported accuracy. It can be cancelled and stops
listening after completion. See [location lookup](docs/LOCATION_LOOKUP.md).
It requires HTTPS or localhost and browser permission. The campus-area check
uses an approximate rectangle rather than a verified property boundary.

For physical checkpoint testing, add this to a local `.env.local` file and
restart Vite:

```text
VITE_LOCATION_MODE=browser
```

Remove the setting or use `prototype` to restore simulated checkpoints.

## Production build and checks

```bash
npm run check
git diff --check
```

Use Node.js 22 as specified in `.node-version`. `npm run check` runs formatting,
lint, TypeScript, tests, and the production build. Pull requests targeting `main`
are configured to run the same checks in GitHub Actions after publication.

Vite generates the deployment files in `dist`. Production source maps are
disabled. The build includes copyright banners and
`THIRD_PARTY_LICENSES.md` for bundled dependencies. The map bundle currently
produces a size warning; the [mobile baseline](docs/ARCHITECTURE.md#step-31-mobile-performance-baseline)
documents its measured cost.

## Deploy on Vercel

1. Import [jahphetB/wayfinder](https://github.com/jahphetB/wayfinder) from GitHub.
2. Select the repository root and `main` as the production branch.
3. Keep the settings from `vercel.json`: Vite, `npm run build`, and `dist`.
4. Leave environment variables unset to use prototype navigation, then deploy.

A connected Vercel project deploys new pushes to `main` automatically.
Develop changes on feature branches, review their Vercel previews, and merge only
after passing checks and release approval. The
[release workflow](docs/RELEASE_WORKFLOW.md) covers repository enforcement,
step-by-step updates, browser checks, versions, and recovery.
`VITE_MAP_STYLE_URL` can select a compatible hosted MapLibre style.
All `VITE_` values are included in browser code and must not contain secrets.

The default basemap uses OpenStreetMap community tiles, subject to the
[tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
Vercel Hobby is limited to [personal/non-commercial use](https://vercel.com/legal/terms).

## Project structure and data

The interface uses square outer panel corners and compact navigation guidance.
Colors, typography, panel sizing, and map-control offsets are listed in
`src/styles/theme.css`. See the [styling guide](docs/STYLING.md) for examples
and map-camera settings.
The [building-details guide](docs/BUILDING_DETAILS.md) explains popup content,
keyboard access, and replacing photo placeholders.

UI, route logic, geographic data, and map-provider code have separate
responsibilities. The [architecture handbook](docs/ARCHITECTURE.md) describes
the folders, files, data flow, and debugging procedures. The
[Mermaid diagram](docs/ARCHITECTURE_DIAGRAM.md) shows their connections, and
[PROGRESS.md](docs/PROGRESS.md) records completed implementation work.

The OSM import procedure and remaining source gaps are documented in the
[export review](docs/OSM_EXPORT_REVIEW.md). The
[data collection guide](docs/CAMPUS_DATA_COLLECTION.md) describes the format
for geographic corrections. OpenStreetMap-derived data retains its
[Open Database License and attribution requirements](https://www.openstreetmap.org/copyright).

## Ownership

Copyright (c) 2026 jahphetB. All rights reserved in original project materials,
subject to applicable law and existing rights. See [LICENSE](LICENSE) and
[ownership terms](docs/OWNERSHIP.md). Ordinary use of the hosted application is
permitted. Third-party software and geographic data retain their own licenses.
