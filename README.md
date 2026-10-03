# Wayfinder

Wayfinder is a responsive navigation-map prototype. It provides
origin and destination search, locally calculated prototype walking routes, and
a 2D/3D MapLibre map with an OpenStreetMap basemap. The 3D button currently
tilts the map; the former illustrative building block has been removed while
accurate 2D routes are developed. No routing backend is required.

## Current progress

| Step                               | Status   | Outcome                                                                                                                                                       |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Project foundation              | Complete | React, TypeScript, quality checks, test tooling, and production builds are configured.                                                                        |
| 2. Domain and map abstraction      | Complete | Provider-independent models, validated mock data, and a tested MapLibre boundary are in place.                                                                |
| 3. Navigation interface            | Complete | Responsive location inputs, autocomplete, swapping, route preview, and a visual map placeholder are ready.                                                    |
| 4. Interactive map                 | Complete | MapLibre renders the selected route and locations, fits the camera, and switches between 2D and 3D views.                                                     |
| 5. Application states and polish   | Complete | Clear route and map states, keyboard autocomplete, accessible status messaging, and map recovery are in place.                                                |
| 6. Testing, bundling, and delivery | Complete | Campus-focused mock data, map bounds, verification, bundle review, and delivery documentation are complete.                                                   |
| 7. Routing foundation              | Complete | A validated, testable campus walking graph and shortest-path logic are ready for later UI integration.                                                        |
| 8. Graph route integration         | Complete | The planner now converts calculated walking paths into routes that the existing map can render.                                                               |
| 9. Route constraints               | Complete | The graph models closures, directionality, and unverified accessibility status before more paths are added.                                                   |
| 10. Data verification workflow     | Complete | The graph now carries validated provenance and cannot claim verification without a named reviewer.                                                            |
| 11. Public-source corroboration    | Complete | Official campus naming and one independently mapped coordinate are recorded while operational route data remains illustrative.                                |
| 12. Validated data replacement     | Complete | Current-library data is corrected and isolated as the single source of truth for future verified-data replacement.                                            |
| 13. Georeferenced 3D spike         | Complete | MapLibre and Three.js share one map camera to render a tested, geographically anchored calibration building in 3D mode.                                       |
| 14. Route steps and checkpoints    | Complete | Graph edges now carry detailed geometry, and calculated routes contain validated turn instructions and expected checkpoints.                                  |
| 15. Location verification domain   | Complete | One-shot location readings can be conservatively classified, and tested session logic advances only after confirmed checks.                                   |
| 16. Browser checkpoint navigation  | Complete | Explicit one-shot location requests power Start navigation, Next Turn, recovery messages, and arrival without continuous tracking.                            |
| 17. Prototype location simulator   | Complete | Navigation can be tested from anywhere by default; one environment setting restores physical browser-location checks later.                                   |
| 18. Turn-focused map guidance      | Complete | The prototype follows mapped footways, distinguishes route legs, follows turns with the camera, and supports Back navigation.                                 |
| 19. Prototype scenarios and places | Complete | Three more destinations are available, and selectable demo outcomes test recovery behavior without physical movement.                                         |
| 20. Mobile navigation refinement   | Complete | Turn instructions stay in view on phones, compact layouts fit narrow screens, and demo controls preserve keyboard focus.                                      |
| 21. Campus data collection packet  | Complete | A reusable source request, measurement template, and review checklist cover the current map points and destinations.                                          |
| 22. OSM export review and entrance | Complete | Reviewed the supplied export and moved the Blatchley prototype destination to its mapped main entrance.                                                       |
| 23. OSM-based 2D routes            | Complete | Traced limited destination routes along exported pedestrian ways, separated the two Simplot entrances, and fixed route camera fit.                            |
| 24. Expanded OSM network           | Complete | Imported the newer observed walkway export, added 21 searchable places, favored formal paths when routes are close, and made long suggestions scrollable.     |
| 25. Described campus destinations  | Complete | Reviewed a new observed export, added 42 places, removed the invented gate and 3D block, prioritized formal/main paths, and combined nearby turns.            |
| 26. Court and stadium previews     | Complete | Added eight mapped sports courts, a separate prototype stadium driving handoff, empty search on launch, a library-facing 3D opening, and purple page styling. |
| 27. Court-gate source review       | Complete | Moved one beach-volleyball destination to its mapped main gate and recorded the remaining court, parking, and stadium-access uncertainties.                   |

See the [architecture handbook](docs/ARCHITECTURE.md),
[comprehensive Mermaid architecture diagram](docs/ARCHITECTURE_DIAGRAM.md),
[detailed progress log](docs/PROGRESS.md), and
[AI skills inventory](docs/AI_SKILLS.md). The [project memory](docs/PROJECT_MEMORY.md)
records the latest source, decisions, limitations, and resume checklist.

## Local development

```bash
npm install
npm run dev
```

Open the exact local URL printed by Vite. If the default port is already in
use, Vite selects another port such as `http://localhost:5174/`.

Navigation uses clearly labeled simulated checkpoint locations by default, so
you can test the entire interface without moving around campus or granting
location permission. When physical campus testing begins, create `.env.local`
in the project root with the following line, restart the development server,
and confirm that the blue **Demo location is on** notice is gone:

```text
VITE_LOCATION_MODE=browser
```

Remove that setting, or set it to `prototype`, to return to safe simulation.

MapLibre's vendor stylesheet is loaded before the application's stylesheet in
`src/main.tsx`. This order lets the application preserve the map host's full
height. If the map canvas exists but is not visible, inspect `.map-canvas` in
the browser and confirm that its computed height is greater than zero.

The default street tiles come from OpenStreetMap for prototype use. Set
`VITE_MAP_STYLE_URL` to a compatible hosted MapLibre style URL when a dedicated
production tile provider is selected.

The previous illustrative 3D block has been removed. The 3D button still
tilts the map, but no building meshes are currently displayed.

The map starts on campus and limits ordinary panning to a
campus-sized area. Current visible location data includes Cruzen-Murray Library,
whose identity and coordinate were checked against official campus sources, Google Maps,
and OpenStreetMap-derived public information. The walking-path topology,
distances, closures, direction rules, and accessibility information are still
illustrative prototype data, not official accessibility or walking directions.
Calculated routes now retain each edge's detailed geometry and produce internal
turn-by-turn steps. You can preview routes among 50 searchable campus places,
including buildings, apartments, parking areas, courts, and landmarks. The map
starts in **3D** over the library looking toward Sterry Hall, with empty search
fields; the 2D toggle remains available. In **Walk the
route**, use **Demo checkpoint result** to test an expected, uncertain, wrong,
stale, or unavailable reading from anywhere; changing the result restarts that
route simulation. The default prototype does not request your device location.
Physical browser-location mode remains available through the environment setting
above; in that mode uncertain, mismatched, or failed readings do not advance progress.
Use HTTPS for later phone testing. Paths remain illustrative: do not rely on
this prototype for safe campus navigation.
The newer OpenStreetMap export now supplies centerlines for the current
pedestrian routes and destination entrance coordinates. The Simplot entrance
near Blatchley serves the cafeteria; its other entrance serves the connected
residence hall. JAAC and its swimming pool have separate entrances. Anderson
uses the resident-used entrance described in the export. The former Campus
Entrance marker is removed; there is no fixed gate. Short unmapped links and
outline-derived destination points remain illustrative. This drawing is ready for visual testing, not yet
verified for safe physical navigation.
Beach Volleyball Court 2 now targets its mapped main gate, but the short
connection to a walkway is still inferred. The other court approaches and
court numbers remain provisional. The stadium driving preview uses a
private-tagged driveway and must not be relied on for actual driving.
See the [export review](docs/OSM_EXPORT_REVIEW.md) for source coverage, gaps,
and the next measurements needed. OpenStreetMap data is available under the
[Open Database License](https://www.openstreetmap.org/copyright).
To update the route network after reviewing a newer export, run
`python scripts/import_campus_osm.py path/to/map.osm` and inspect the generated
`src/data/navigation/campusOsmNetwork.json` diff. Curated searchable places
and entrance references live in `collegeOfIdahoWalkingGraphData.ts`; the
graph builder connects them to imported paths. Routing now always favors
formal footpaths over informal shortcuts; described main footways get an
additional modest preference among formal choices. The displayed distance is
the actual drawn length. Nearby consecutive turns can share one explicit
instruction and checkpoint. Search suggestions scroll when the list is long.
Mapped tennis, pickleball, basketball, and beach-volleyball courts are
searchable. Their numbered labels are provisional because the export has sport
tags but no individual court names. No separately tagged standard volleyball
court was present. Simplot Stadium shows a separate dashed prototype drive
from the nearer of two mapped road-connected campus driveways by straight-line
distance to a west-side
parking approach. It does not calculate a car route from your selected start
or offer car GPS checkpoints. Confirm road access, turns, parking, and the venue
entrance on site. The page uses provisional purple `#412D5E`; provide the
current institutional style guide for exact brand compliance.
Read only this step in the [Step 16 handbook guide](docs/ARCHITECTURE.md#step-16-browser-location-and-checkpoint-navigation).
The [Step 17 handbook guide](docs/ARCHITECTURE.md#step-17-prototype-location-simulator)
explains simulation and the future field-test switch.
The [Step 18 handbook guide](docs/ARCHITECTURE.md#step-18-turn-focused-map-guidance)
explains walkway alignment, route colors, camera behavior, and Back navigation.
The [Step 19 handbook guide](docs/ARCHITECTURE.md#step-19-prototype-scenarios-and-limited-destination-expansion)
explains scenario testing and the three-destination scope.
The [Step 20 handbook guide](docs/ARCHITECTURE.md#step-20-mobile-navigation-and-demo-usability)
explains phone-sized layout, visible turn instructions, and keyboard behavior.
The [campus geometry collection packet](docs/CAMPUS_DATA_COLLECTION.md)
explains what source files, measurements, photographs, and review details to
provide before replacing illustrative geometry.
The [Step 22 handbook guide](docs/ARCHITECTURE.md#step-22-osm-export-audit-and-blatchley-entrance)
explains this export's first route update and its remaining uncertainty.
The [Step 23 handbook guide](docs/ARCHITECTURE.md#step-23-osm-based-2d-walking-routes)
explains the current 2D route network, Simplot entrance split, and camera fit.
The [Step 24 handbook guide](docs/ARCHITECTURE.md#step-24-expanded-osm-network-and-search)
explains the import, routing policy, additional places, and remaining gaps.
The [Step 25 handbook guide](docs/ARCHITECTURE.md#step-25-described-destinations-and-formal-route-priority)
explains the newest source, destination choices, route priority, and turn merging.
The [Step 26 handbook guide](docs/ARCHITECTURE.md#step-26-court-search-and-stadium-driving-handoff)
explains court sourcing, the separate stadium handoff, default view, and limits.
See the [architecture handbook's Step 12 guide](docs/ARCHITECTURE.md#step-12-validated-data-replacement)
for source links and the future verified-data replacement process.

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

This separation keeps the project-owned walking graph independent from map
rendering. MapLibre handles geographic projection and camera behavior. The
Three.js custom-layer implementation remains in the codebase for later
approved 3D work, but it is not attached to the current map.

## Current documentation integration

The project includes a project-scoped Context7 MCP connection in
`.codex/config.toml`. Start a new Codex session from this trusted repository to
make its current third-party library documentation tools available. Basic remote
access is configured without storing an API key; an optional personal Context7
key may be configured outside the repository for higher limits.

## GitHub publishing

The repository uses a local `main` branch and focused commits. To connect it to GitHub after creating an empty repository there, run:

```bash
git remote add origin https://github.com/<account>/<repository>.git
git push -u origin main
```

Pushing is intentionally performed only after explicit user approval. Confirm the remote with `git remote -v` before the first push.
