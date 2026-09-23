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
