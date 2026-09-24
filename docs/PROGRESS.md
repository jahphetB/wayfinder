# Progress Log

## Step 1: Project foundation and quality controls

Status: complete
Commit: `33e2dbd` (`chore: initialize React project foundation`)

- Created the React and TypeScript application foundation with Vite.
- Added MapLibre, Vitest, Testing Library, ESLint, Prettier, and strict TypeScript checks.
- Added a minimal application rendering test and verified formatting, linting, type-checking, tests, production build, and development-server startup.

## Step 2: Domain model and provider abstraction

Status: complete
Commit: `0d1807b` (`feat: add navigation domain and map adapter`)

- Established provider-independent navigation models and validation.
- Added immutable local mock locations, search results, and route data.
- Defined the map lifecycle and mode contract, then encapsulated the MapLibre implementation behind it.

## Step 3: Navigation interface

Status: complete

- Built responsive start and destination inputs, mock autocomplete suggestions, a swap control, and route preview.
- Kept selection and route matching in a dedicated hook and model rather than UI components.

## Step 4: Interactive map

Status: complete

- Replaced the visual placeholder with a lazy-loaded MapLibre map, GeoJSON route/location layers, camera fitting, and 2D/3D control.
- Fixed MapLibre worker and CSS-height issues and adopted an OpenStreetMap prototype basemap.

## Architecture handbook milestone

Status: complete

- Added the living architecture handbook, safe change recipes, troubleshooting, engineering principles, and decision log.
- Updated the working agreement to keep the handbook synchronized with architectural changes.

## Step 5: Application states and polish

Status: complete

- Added explicit empty, invalid-location, unavailable-route, and route-ready outcomes.
- Added keyboard autocomplete behavior, accessible status messaging, and map loading/error recovery.

## Step 6: Testing, bundling, and delivery

Status: complete

- Focused the prototype on The College of Idaho with campus-named locations, campus bounds, and illustrative route geometry.
- Verified the map in a browser, reviewed the bundle, and documented delivery decisions.

## Step 7: Routing foundation

Status: complete

- Added immutable, validated walking-graph types and a pure Dijkstra shortest-path function.
- Added an illustrative College of Idaho graph, focused tests, and data-verification requirements.

## Step 8: Graph route integration

Status: complete

- Replaced prewritten route lookup with calculated routes from the College of Idaho walking graph.
- Added graph-path-to-route conversion, preserved application states, and removed duplicated route data.

## Step 9: Route constraints

Status: complete

- Added availability, direction, and accessibility-status fields to graph edges.
- Updated pathfinding to skip closures and respect forward-only paths.
- Created separate verified commits for the code/test unit and documentation unit.

## Step 10: Data verification workflow

Status: complete

- Added immutable walking-graph release records with source description, review date, verification status, and an optional named verifier.
- Prevented data from claiming verified status unless it includes a verifier.
- Labeled the current College of Idaho graph explicitly illustrative and not campus-approved.
- Added validation and provenance tests, plus documentation for the future campus-data release checklist.
- Created separate verified code and documentation commits.

## Step 11: Public-source corroboration

Status: complete
Commit: `32c40cb` (`feat: corroborate campus location data`)

- Checked visible place names against the College of Idaho's published campus
  map and updated the prototype to use its exact labels for Morrison Quadrangle
  & Clock Tower and N.L. Terteling Library.
- Corroborated the N.L. Terteling Library point with OpenStreetMap-derived
  public map data and synchronized the location and graph-node coordinate.
- Recorded the limited scope in graph provenance: public sources do not prove
  usable pedestrian paths, distances, closures, direction rules, or
  accessibility. Those facts remain illustrative and not campus-approved.
- The official College map links to Google Maps. Google Maps itself could not
  be retrieved by the automated research environment, so it was not counted as
  independent machine-checked evidence.

## Step 12: Validated data replacement

Status: complete
Commits:

- `4e13e03` (`feat: isolate campus graph dataset`)
- `cf5c055` (`refactor: derive locations from graph dataset`)

- Used a temporary local browser session to inspect Google Maps directly. It
  identifies N.L. Terteling Library as permanently closed and identifies
  Cruzen-Murray Library as the current College of Idaho library.
- Confirmed the current library with the College's library page, Google Maps,
  and OpenStreetMap-derived public map data. Updated the displayed destination
  and its graph node to Cruzen-Murray Library at `43.6545, -116.67654`.
- Moved editable graph records and provenance into
  `collegeOfIdahoWalkingGraphData.ts`. It is also the single source of truth
  for searchable location labels and coordinates. The existing graph module now
  validates that dataset before the planner can use it, so a future verified
  dataset can replace this one without changing routing, React UI, or MapLibre
  code.
- Retained illustrative status for the path topology, edge distances,
  availability, direction, and accessibility because public map listings do
  not verify those operational route facts.

## Step 13: Georeferenced 3D architecture spike

Status: complete
Implementation commit: `0281d4c` (`feat: add georeferenced 3d building spike`)

- Added Three.js behind the existing MapLibre infrastructure boundary instead
  of importing it into React or navigation-domain code.
- Added one procedural calibration building anchored to the College of Idaho
  campus center. Its geographic anchor is real, while its shape, dimensions,
  heading, and identity are explicitly illustrative.
- Used MapLibre's projected camera matrix and meter conversion so the Three.js
  geometry stays attached to its latitude and longitude while the map moves.
- Hid the building in 2D mode, restored it in 3D mode, and released its geometry,
  material, and renderer resources during map cleanup.
- Added focused lifecycle and adapter tests. The complete suite now contains 29
  passing tests across 9 files.
- Verified the real WebGL result with a headless Microsoft Edge screenshot: the
  calibration building appeared over the campus map and the existing interface
  remained visible.
- Measured the production output. The deferred map chunk is now 1,545.66 kB
  minified and 406.75 kB gzip, approximately 530 kB minified and 132 kB gzip
  larger than the pre-Three.js build. This cost remains outside the initial app
  chunk because `MapView` is lazy-loaded.
- Added a maintained comprehensive Mermaid architecture diagram and recorded the
  approved future GPS checkpoint and photogrammetry boundaries as not yet
  implemented.
- Added a project-scoped Context7 MCP configuration for current library
  documentation, plus explicit fallback to official documentation.
- Installed the first-party OpenAI Playwright, security best-practices, and
  security threat-model skills locally for later approved steps.

## Step 14: Route geometry, instructions, and checkpoints

Status: complete
Implementation commit: `a92963d` (`feat: add route steps and checkpoints`)

- Added validated geometry to every runtime walking-graph edge. When source data
  omits geometry, the factory safely creates a direct line between the declared
  nodes; the editable campus dataset now supplies explicit illustrative geometry.
- Added provider-independent route maneuvers, instructions, and checkpoints.
  Every selected graph edge becomes one route step, intermediate step endpoints
  are turn checkpoints, and the last endpoint is the destination checkpoint.
- Derived left, right, straight, and turn-around maneuvers from geographic
  bearings rather than map-renderer behavior.
- Reversed edge geometry when a bidirectional edge is traveled backward, so
  route instructions and map lines always follow the person's travel direction.
- Made the validated route factory derive flattened map geometry from its steps
  and reject discontinuous steps, misplaced checkpoints, invalid maneuver order,
  or a total distance inconsistent with the step distances.
- Preserved the existing MapLibre boundary: it still receives one provider-
  independent `Route` and automatically renders the richer geometry.
- Kept all current College of Idaho path geometry and instructions explicitly
  illustrative. No GPS request, navigation session, tolerance policy, or Next
  Turn interface was added in this step.
- Added focused maneuver, reverse-travel, geometry, checkpoint, and campus-route
  tests. The complete suite now contains 33 passing tests across 10 files.
- Used the OpenAI Playwright workflow against the running application to confirm
  that the multi-point route, markers, route summary, and 3D calibration building
  render together. The browser console reported zero errors and zero warnings.
- Production build passed. The initial application chunk is 237.86 kB minified
  and 74.39 kB gzip; the deferred map chunk remains 1,545.66 kB minified and
  406.75 kB gzip.

## Step 15: Location verification and navigation-session foundation

Status: complete
Implementation commit: `630abbb` (`feat: add checkpoint location verification`)

- Added a provider-independent location reading containing coordinates, reported
  accuracy in meters, and a capture timestamp.
- Added a small `LocationProvider` contract with an explicitly one-shot
  `requestCurrentLocation` operation. No browser implementation or permission
  request was added in this step.
- Added a Haversine distance calculation for measuring the great-circle distance
  between a reading and an expected checkpoint. Its numerical input is clamped
  to protect antipodal and floating-point edge cases.
- Added a conservative prototype verification policy with a 20-meter checkpoint
  radius and a 30-second maximum reading age. These values require campus field
  testing before production use.
- Classifies a reading as confirmed only when its complete accuracy area fits
  inside the checkpoint radius, mismatched only when the area is entirely
  outside, and uncertain when it overlaps the boundary or is stale/future-dated.
- Added immutable navigation-session states for awaiting the initial origin
  check, navigating through route-step checkpoints, and arrival.
- Session progress advances only after an explicit confirmed verification.
  Uncertain and mismatched readings preserve the current step.
- Applied location-data minimization: the session stores the verification
  result, distance, and accuracy, but not the raw GPS coordinates.
- Added focused distance, validation, accuracy-boundary, freshness, origin,
  turn, arrival, and no-advance tests. The complete suite now contains 42
  passing tests across 12 files.
- Formatting, linting, strict type-checking, tests, and production build passed.
  Bundle sizes are unchanged because the new foundation is not connected to the
  visible browser application yet.

## Step 16: Browser location and checkpoint navigation

Status: complete
Implementation commit: `1a57bb7` (`feat: add one-shot browser checkpoint navigation`)

- Pushed the approved Step 15 commits (`630abbb`, `21231f6`) before this step.
- Added an injected browser location provider with validated one-shot readings,
  explicit permission/unavailable/timeout/unsupported/insecure-context failures,
  high-accuracy requests, no cached readings, and a 15-second acquisition timeout.
- Added Start navigation, current instruction/progress, Next Turn, retry, and
  arrival states. No automatic location request, continuous tracking, or raw
  reading storage was added. Existing illustrative-data warnings remain visible.
- Preserved route/progress on failed checks, prevented simultaneous requests,
  rejected reused timestamps, and ignored late results after route replacement.
- Re-preview resets the session; map mode changes preserve it. Domain policy is
  unchanged (20-meter radius / 30-second maximum age, pending field validation).
- All 57 tests across 14 files passed. Formatting, lint, strict type-checking,
  production build, and whitespace checks passed. The sandbox blocked a test
  subprocess once; the approved unrestricted rerun passed.
- Playwright browser checks used simulated coordinates: origin, uncertain turn,
  successful retry, intermediate checkpoints, and arrival. Switching to 2D
  preserved the active step. A 390-by-844 screenshot showed readable controls
  and the map. Console: zero errors, zero warnings. These are not physical-phone
  GPS or campus-path validation results.
- Initial JavaScript: 244.83 kB minified / 76.58 kB gzip (+6.97 / +2.19 kB).
  Deferred map chunk unchanged at 1,545.66 / 406.75 kB; existing large-chunk
  warning remains. No dependency added; no device performance claim is made.
- Updated the handbook's dedicated Step 16 guide, ADR-026, file inventory,
  architecture diagram, README, and skills inventory. Preserved the user's
  pre-existing README introduction edit without committing it.

## Step 17: Prototype location simulator

Status: complete
Implementation commit: `6dc58ba` (`feat: add prototype checkpoint simulation`)

- Revised the previously proposed field-validation step because physical campus
  walking is intentionally postponed. The application remains a prototype.
- Added a `PrototypeLocationProvider` that returns a fresh validated reading at
  the session's expected checkpoint. It works in either route direction and does
  not access browser geolocation.
- Made simulation the default and added an explicit blue notice. Start and Next
  Turn messages now say they simulate checkpoints rather than telling the person
  to walk somewhere.
- Added `VITE_LOCATION_MODE=browser` as the single future field-test switch.
  Omitting it, or setting `prototype`, keeps simulation. Existing real-location
  checks, accuracy policy, permission recovery, and privacy boundaries remain.
- Expanded the provider request with expected coordinates. Browser infrastructure
  ignores this testing context; only the simulator uses it. Domain verification
  still decides whether a reading advances navigation.
- Added focused simulator and end-to-end component tests. All 59 tests across 15
  files passed, as did formatting, linting, type-checking, production build, and
  whitespace checks. No dependency was added.
- Browser verification completed the default route from origin through arrival
  without granting location permission. The simulation notice and instructions
  were visible; the console reported zero errors and zero warnings.
- Production sizes remain effectively unchanged: initial JavaScript 244.86 kB
  minified / 76.57 kB gzip; deferred map 1,545.66 / 406.75 kB. The existing map
  chunk warning remains.
