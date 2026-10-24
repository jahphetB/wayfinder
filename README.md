# Yotes Wayfinder

A minimalist campus guide built with React, TypeScript and MapLibre. Walking
route illustrations are calculated locally from an OpenStreetMap-derived campus
network; no routing backend, account or database is required.

[Open the guide](https://wayfinder-umber.vercel.app/) ·
[Product definition](docs/PRODUCT_PLAN.md) ·
[Architecture handbook](docs/ARCHITECTURE.md) · [Progress](docs/PROGRESS.md)

The manual-guide release candidate is available in
[preview](https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app/).
The public production site retains the previous version until release review is
complete. [Candidate evidence](docs/RELEASE_READINESS.md) distinguishes the builds.

## Using the guide

1. Select Start and Destination, then **Preview route**.
2. **Start navigating** begins the illustrated walkthrough and requests an
   approximate real-location snapshot.
3. **Next** advances the illustrated step and requests a fresh snapshot.
   **Back** only changes the illustration.
4. **Get my location** requests a snapshot independently.

The walkthrough never waits for location or requires physically reaching a
checkpoint. Its completion does not confirm physical arrival. There is no live
movement-following, automatic rerouting or GPS-selected starting point.

A small light-green outlined circle represents the last snapshot, not the
illustrated route position. **Last checked** identifies its time. A failed
refresh identifies a retained older snapshot. Requests are bounded and
cancellable; newer actions replace pending requests without overlapping watchers.
This app does not persist or upload location history.

## Features and data

Mobile snapshot feedback shows elapsed time and reported accuracy (± metres), not
distance travelled. Compact controls leave search suggestions and replacement
route actions unobstructed. Desktop credit stays in the sidebar across views.

- Search 50 curated buildings, courts, parking areas and landmarks.
- Route distance, estimated walking time, instructions and colored route legs.
- Identically tilted 2D/3D cameras that rotate with the walkthrough; 3D shows the rough library model.
- Purple header with building search; selecting a result marks the draft destination on the map.
- Start and Destination selections show pins before route preview.
- Close, turn-centred walkthrough camera and compact mobile zoom/location controls.
- Library, Sterry Hall and cafeteria details, image slots and scrollable content.
- A separate illustrative stadium driving handoff, not car turn-by-turn guidance.
- Accessible search and explicit map-download/graphics/network recovery.
- Integrated route planner; desktop timeline and mobile map/instruction dock.
- Safe route drafts: Cancel restores the same walkthrough, even after replacement preview.
- Exactly two responsive layouts, switching at 640 CSS pixels; one persistent map.
- Compact developer credit and a keyboard-accessible privacy dialog.

The selected original interface is documented in
[the reference contract](docs/UI_REFERENCE_CONTRACT.md) and
[styling guide](docs/STYLING.md). Real map data and route metrics remain separate
from reference artwork; illustrative walkthrough completion never confirms arrival.

The selected interface is available on the
[review preview](https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app/).
[Verification notes](docs/UI_REFERENCE_VERIFICATION.md) distinguish automated
checks, browser emulation and remaining device-review limits.

The current geographic dataset is the accepted guide baseline. Some inferred
connections, access details, court numbering and model height remain unverified;
it is not an independently surveyed or accessibility-certified map. Check signs
and conditions on site. Geographic and 3D corrections can be imported later using
the existing data pipeline. Photo slots remain placeholders.

## Run and verify

Use Node.js 22, then:

```bash
npm ci
npm run dev
```

Open the exact URL printed by Vite. Location requires HTTPS or localhost and
browser permission, but the walkthrough works without it. No location-mode
environment variable is needed.

```bash
npm run check
npm audit --prefer-online
git diff --check
npm run preview
```

Checks cover formatting (tabs), lint, strict types, tests and the production
build. Browser/device checks and recovery procedure are in
[release readiness](docs/RELEASE_READINESS.md) and the
[release workflow](docs/RELEASE_WORKFLOW.md).

## Hosting and configuration

Vercel builds the repository root using `vercel.json`: Vite, `npm run build`,
and `dist`. Feature branches produce previews; approved merges to `main`
produce production releases. A preview push is not a production release.

The default background uses OpenStreetMap community tiles under its
[tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
Before broader promotion, review measured usage, provider terms and cost limits;
do not assume reserved community capacity. No paid service is enabled here.

`VITE_MAP_STYLE_URL` can select a compatible hosted style, but provider origins,
security policy and privacy disclosure must be reviewed together.
All `VITE_` values are public browser configuration, never secrets.
Production source maps remain disabled; builds include third-party notices.

## Organization and updates

`src/styles/theme.css` contains named interface settings;
`src/features/map/model/mapPresentation.ts` contains map/camera settings.
UI, routing, data and provider integration have separate responsibilities.

See the [architecture diagram](docs/ARCHITECTURE_DIAGRAM.md),
[building details](docs/BUILDING_DETAILS.md),
[location snapshots](docs/LOCATION_LOOKUP.md),
[OSM import review](docs/OSM_EXPORT_REVIEW.md) and
[data collection guide](docs/CAMPUS_DATA_COLLECTION.md).
OSM-derived data retains its [license and attribution](https://www.openstreetmap.org/copyright).

## Ownership

Copyright (c) 2026 jahphetB. All rights reserved in original project materials,
subject to applicable law and existing rights. See [LICENSE](LICENSE) and
[ownership terms](docs/OWNERSHIP.md). Ordinary use of the hosted application is
permitted. Third-party software and geographic data retain their own licenses.
