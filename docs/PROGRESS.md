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

## Step 18: Turn-focused map guidance

Status: complete
Data commit: `a82958f` (`data: align prototype route with campus footways`)
Implementation commit: `d19d8cb` (`feat: add turn-focused map guidance`)

- Replaced the straight field-crossing prototype geometry with a temporary
  connector from Campus Entrance to the nearest mapped footway, followed by
  public OpenStreetMap footway shapes. All operational facts remain illustrative.
- Split the visible route into step features. Completed legs are gray, the
  current leg is green and wider, and upcoming legs are orange; a white casing
  preserves contrast over the basemap. Added an accessible color legend.
- Shared the immutable navigation session with the map through App composition,
  leaving provider-specific drawing inside the MapLibre adapter.
- Added a turn-focused camera: 18 zoom, travel-direction bearing, 60-degree pitch
  in 3D (zero in 2D), and a small forward-looking screen offset. Each confirmed
  turn and Back transition updates the view; preview still fits the whole route.
- Added Back behavior from active legs and arrival. It changes session state
  without requesting location and returns from the first leg to pre-start state.
- Added domain, component, application-composition, graph, and adapter tests.
  All 61 tests across 15 files passed, as did linting, formatting, strict type-
  checking, whitespace checks, and the production build.
- Browser checks covered aligned preview geometry, simulated progression, Back,
  route colors, 2D/3D turn cameras, and console output. Console: zero errors and
  zero warnings. These checks do not verify physical paths or GPS accuracy.
- Production output: initial JavaScript 247.17 kB minified / 77.14 kB gzip;
  deferred map 1,547.68 / 407.40 kB. No dependency was added; the existing large
  deferred-map warning remains.

## Step 19: Prototype scenarios and limited destination expansion

Status: complete
Data commit: `76fc432` (`data: add three prototype campus destinations`)

- Added Blatchley Hall, Simplot Dining Hall, and Sterry Hall as the only new
  searchable destinations in this step. The official campus map supports their
  names; public OpenStreetMap data supports their displayed centers and nearby
  footway shapes. Building connectors, distances, entrances, permissions,
  accessibility, and physical route accuracy remain illustrative.
- Added a prototype-only Demo checkpoint result selector with expected,
  uncertain-accuracy, mismatched, stale, and unavailable outcomes. Selecting a
  result resets the simulation, then each request still passes through the
  established one-shot provider, verification, and recovery flow.
- Kept real browser location separate: the scenario control appears only when
  the injected provider exposes the optional prototype capability. No browser
  location request, continuous tracking, dependency, or routing-policy change
  was introduced.
- Focused checks: 26 tests across four affected files passed, along with strict
  type checking. Final checks: formatting, linting, strict typing, whitespace,
  and all 66 tests across 15 files passed; the production build passed.
- Browser checks selected Sterry Hall, previewed its route, selected the wrong-
  location scenario, and verified its no-progress retry message. Console: zero
  errors and zero warnings; a local screenshot is ignored by Git.
- Production output: initial JavaScript 251.58 kB minified / 78.03 kB gzip;
  deferred map 1,547.68 / 407.40 kB. No dependency was added. The existing
  deferred-map chunk warning remains and is not caused by this small feature.

## Step 20: Mobile navigation and demo usability

Status: complete; implementation and documentation commits pushed to `origin/main`.

- Separated map-content refresh from phone scrolling. Previewing a new route
  still reveals the map, while Start, Next Turn, and Back keep the current
  written instruction and controls visible. The preview scroll respects the
  reduced-motion preference.
- Replaced a scenario-change remount with an explicit navigation-hook reset,
  preserving keyboard focus on the selector. The selector cannot change while
  a one-shot location request is pending; a changed route still gets a fresh
  session.
- Made synthetic error and uncertain-result messages explain how to continue
  the demo, while retaining separate physical-location guidance.
- Refined 320-pixel layout, wrapping, focus styling, and 44-pixel touch targets
  for key navigation controls. No additional route, destination, dependency,
  or verification claim was introduced.
- Browser inspection at 390 and 320 CSS pixels confirmed that the active turn
  stays in view, the scenario selector fits the panel, keyboard focus remains,
  and the page has no horizontal overflow. Console: zero errors and zero
  warnings. All 66 tests across 15 files, lint, type-check, formatting,
  whitespace checks, and the production build pass.
- Production output: initial JavaScript 251.98 kB minified / 78.07 kB gzip;
  deferred map 1,547.78 / 407.43 kB. No dependency was added. The existing
  deferred-map chunk warning remains.
- Added the Step 20 handbook guide, ADR-030, and a practical intake outline
  for future measured building and walkway data. Current geometry remains
  illustrative until source rights, dimensions, access facts, and field review
  are established.

## Step 21: Campus geometry collection packet

Status: complete; documentation commit pushed to `origin/main`.

- Added `docs/CAMPUS_DATA_COLLECTION.md` with an authorized records request and
  a field-survey fallback for Campus Entrance, Cruzen-Murray Library, Blatchley
  Hall, Simplot Dining Hall, and Sterry Hall only.
- Specified building footprints/dimensions, entrances, walkway centerlines and
  widths, junctions, ramps/steps, access constraints, coordinate reference,
  units, source permission, survey date, accuracy, and confidence.
- Added a spreadsheet observation template, photo naming guidance, and a
  source/geometry review checklist. The packet asks for unknown values to
  remain blank rather than guessed.
- Updated README and architecture handbook links, file relationships, and the
  AI skills record. No app code, coordinates, map features, or destination
  scope changed.

## Step 22: OSM export audit and Blatchley entrance

Status: complete; implementation and documentation commits pushed to
`origin/main`.

- Parsed the user-supplied 2026-09-28 `map.osm` export and recorded a SHA-256
  digest, object counts, target building and entrance IDs, path-tag coverage,
  and missing accuracy details in `docs/OSM_EXPORT_REVIEW.md`.
- Moved Blatchley Hall's route endpoint from its mapped building center to its
  OSM-tagged main entrance. Its final approximately 3.9 m connector remains
  illustrative because the entrance and nearby footway do not share a mapped
  path node. Recalculated the affected route leg to 275 m.
- Retained the graph's illustrative status, recorded the OSM source and ODbL
  link in provenance, and kept the other destination endpoints unchanged.
- Updated the focused graph test, README, handbook, diagram guidance, and AI
  skills record. No new destination, map renderer, or dependency was added.
- The affected graph file passed all 8 tests. Lint, strict type-checking,
  formatting, whitespace checks, and production build passed. The existing
  deferred-map bundle warning remains unrelated to this data change.

## Step 23: OSM-based 2D walking routes

Status: complete; commits pushed to `origin/main` in Step 24.

- Replaced the limited graph's old drawn legs with ordered pedestrian-way
  coordinates from the supplied OSM snapshot. The route still connects the
  off-walkway Campus Entrance to its nearest mapped footway with one explicitly
  illustrative straight segment. Short final entrance gaps are also illustrative.
- Added a distinct Simplot Residence Hall destination in the existing building.
  The user identified the entrance near Blatchley as the cafeteria entrance
  and the other mapped main entrance as the residence entrance. Library,
  Blatchley, and Sterry endpoints now use their mapped entrance points too.
- Added walkway junctions so route distances, preview shapes, and checkpoint
  legs use the same connected geometry. Retained `illustrative` provenance and
  `unverified` accessibility; no width, slope, building-height, or new 3D data
  was inferred.
- Made 2D the initial map view. In a real browser, the residence route exposed
  a camera clipping issue: the original north-south pan boundary forced a
  minimum zoom on the tall desktop map. Widened the latitude boundary just
  enough to let route fitting show both endpoints while keeping campus focus.
- Re-fit an existing route when MapLibre reports a canvas resize; this covers
  phone rotation and desktop window changes after previewing a route.
- Updated domain, app, and adapter assertions for the new destinations and
  route-leg count. Browser-tested the library, cafeteria, and residence previews
  at desktop and phone sizes, including resizing an active route; the console
  had zero errors or warnings. Full suite: 70 tests in 15 files. Lint, strict
  type-checking, formatting, whitespace checks, and production build passed.
  The existing deferred-map chunk-size warning remains; no dependency was added.

## Step 24: Newer OSM network, additional places, and scrollable search

Status: implementation and documentation complete; commits pushed to
`origin/main` after verification.

- Pushed the three approved Step 23 commits before starting this batch.
- Audited the user's newer `map_moreinfo.osm` by SHA-256 digest, source counts,
  walkable connected component, entrances, named buildings, informal paths,
  and differences from the previous export. The exact source remains outside
  the repository; `docs/OSM_EXPORT_REVIEW.md` records the findings and gaps.
- Added a Python standard-library importer and committed compact JSON snapshot
  of the connected walking network. Runtime graph construction now validates
  curated entrance/building IDs and creates explicitly illustrative connectors
  only for nearby off-path destinations.
- Expanded the searchable catalogue to 21 places. Omitted buildings lacking a
  suitable mapped entrance instead of inventing one. Formal ways receive a
  modest 12% route-selection advantage over informal ways; user-visible
  distance remains physical length. Consecutive straight OSM segments are
  merged into practical turn steps.
- Made long suggestion lists scrollable and kept the active keyboard result
  visible. Browser-tested 21 suggestions, keyboard scrolling, desktop and
  390-pixel route previews, and console (zero errors/warnings).
- Updated README, handbook, diagram, source audit, collection packet, AI skills
  record, and durable project memory. All access, accessibility, and unmapped
  connector claims remain illustrative; 3D details remain deferred.
- Verification: 74 tests in 16 files, formatting, lint, strict type-checking,
  production build, and Git whitespace checks passed. Initial JavaScript is
  about 300.36 kB minified / 90.68 kB gzip; the deferred map remains about
  1,548 kB / 407 kB gzip. The known map-chunk size warning remains.

## Step 25: Described destinations and formal-route priority

Status: implementation and documentation complete; approved push to
`origin/main` follows final verification.

- Reviewed the user-supplied `map (1).osm` export, including every `description`
  tag on entrance nodes and ways. Its SHA-256 fingerprint, counts, identified
  places, and conflicting parking tags are recorded in `OSM_EXPORT_REVIEW.md`.
- Regenerated the committed walking snapshot from the new source. Imported
  ten described main footways, descriptive entrance metadata, named college
  and apartment outlines, named parking areas, and campus landmarks.
- Removed the inaccurate Campus Entrance point and its long connector. The
  default preview now runs from Cruzen-Murray Library to Simplot cafeteria.
- Expanded search to 42 destinations: named campus buildings, four apartment
  buildings, ten described parking areas, stadium, and landmarks. Buildings
  without a mapped entrance use a clearly illustrative outline point, not a
  claim that a real door exists there. Unnamed or out-of-scope objects are not
  silently added as destination labels.
- Moved Anderson Hall to the entrance described as mostly used by residents.
  JAAC activities and the swimming pool are separate places at separately
  described entrance points. The main activities entrance is on a walkway
  node and is not falsely asserted to be part of the JAAC building outline.
- Formal paths now outrank informal paths for route selection; among formal
  alternatives, main footways receive a modest preference. Distances still
  report physical length. The library-to-cafeteria regression test checks a
  main-footway route without informal shortcuts.
- Merged pairs of nearby turns only when the intervening walking leg is at
  most 12 m. The combined instruction explicitly names both turns; farther
  turns retain separate Next checkpoints.
- Removed the gold 3D calibration block and its scene data. The 3D map button
  still tilts the map, while the dormant Three.js integration stays available
  for a later approved building-model step.
- Browser-tested desktop library-to-cafeteria and mobile library-to-JAAC
  parking routes, all 42 dropdown choices, and 3D without the block. Console:
  zero errors and warnings. Full checks: 74 tests in 16 files, formatting,
  lint, strict type-check, whitespace, and production build pass. The initial
  JavaScript is about 328.50 kB minified / 97.58 kB gzip; the deferred map
  drops to about 1,017.91 kB / 275.58 kB gzip because the unused Three.js
  scene is no longer bundled. The existing large-map-chunk warning remains.

## Step 26: Court search, stadium handoff, and opening presentation

Status: complete; focused source/data and app changes committed as `8f35d88`
and `6f324bc`, with documentation committed separately for the approved push.

- Extended the same source importer with sport-tagged pitch outlines and five
  selected road ways without changing the 181-way connected walking network.
  Added eight walking destinations: three tennis, two pickleball, one
  basketball, and two beach-volleyball courts. The numbering is provisional;
  no separately tagged standard-volleyball court exists in this export.
- Added a distinct Simplot Stadium prototype driving handoff from the nearer
  of two mapped campus driveway exits by straight-line distance to a west-side
  parking approach. A dashed road line and separate venue marker distinguish
  it from walking routes. The selected driveway is tagged private. The app
  warns that permission, turns, parking, and venue entrance are unverified;
  it does not offer car checkpoints or claim routing from the chosen start.
- Opened the map in tilted 3D mode centered on the library entrance, facing
  roughly toward Sterry Hall. Both search fields are empty on load. For a
  walking preview, Start navigation now follows Preview route before longer
  guidance. Changed the surrounding page and key controls to provisional
  campus purple `#412D5E` pending an official current style guide.
- Added focused source, planner, UI, and map-adapter tests. Browser-inspected
  the opening view, stadium handoff, court search and walking route, phone
  layout, and console (zero errors/warnings in a fresh session). All routes
  remain prototype data pending field checks. Final checks: 80 tests in 17
  files, formatting, lint, strict type-check, production build, and Git
  whitespace check pass. Initial JavaScript is about 337.96 kB / 100.18 kB
  gzip; the deferred map is about 1,019.29 kB / 275.95 kB gzip. Vite's
  pre-existing large-map-chunk warning remains.

## Step 27: Court-gate and source validation

Status: complete; code committed as `f9fb661` and pushed before Step 28.

- Rechecked the unchanged user-observed OSM export against the curated eight
  courts, Hayman classification, two stadium outlines, and the prototype road
  handoff. Only Beach Volleyball Court 2 has a tagged main entrance on its
  outline; the other seven court approaches and all individual court numbers
  remain provisional.
- Moved Beach Volleyball Court 2's destination from a guessed outline corner
  to that mapped gate. The graph builder now validates that an optional court
  gate belongs to the selected sport outline and is tagged main. Its short
  connection to the walking network is still inferred and accessibility is
  unverified. Added unit and release-level regression tests.
- The official campus map supports the existence of tennis courts and Simplot
  Stadium; official athletics directions corroborate Cleveland Boulevard and
  24th Avenue as the stadium road sequence. Neither source resolves the OSM
  private-driveway permission, actual parking aisle and venue entrance, or
  the conflicting parking/basketball tags on one Hayman area. Those remain
  illustrative and are listed for user field review. No car-navigation or
  broad walking-network change was made.
- Verified formatting, lint, type-check, 82 tests in 17 files, production
  build, and a real browser preview from the library to Beach Volleyball
  Court 2. The route rendered and the browser console had zero errors or
  warnings. The existing large MapLibre chunk warning remains.

## Step 28: One footprint-based library prototype in 3D

Status: complete.

- The user chose to defer additional 2D source corrections and begin the
  previously agreed 3D phase. Reused the committed OSM library outline rather
  than reintroducing the inaccurate former Hendren-area demonstration box.
- Added a separate scene-data record for the library's mapped footprint and
  clearly illustrative 8 m height. Updated the provider-independent building
  contract and existing Three.js custom layer to extrude that outline. The
  composition boundary attaches only this one shape; it hides in 2D and
  cannot alter walking routes or GPS checkpoints.
- Added source and geometry tests. In a real browser, the shape aligned with
  the library footprint, disappeared in 2D, and the console reported zero
  errors and warnings. The map note identifies its height as illustrative.
- Final checks pass: formatting, lint, strict type-check, 84 tests in 18
  files, production build, and Git whitespace check.
- The initial JS remains about 338.26 kB / 100.25 kB gzip. Activating Three.js
  raises the deferred map JS to about 1,578.44 kB / 417.01 kB gzip, a material
  increase from Step 27's 1,019.29 kB / 275.95 kB gzip. Vite's existing
  large-chunk warning remains; review mobile performance before expanding
  beyond one building.

## Step 29: Campus overview and route camera framing

Status: complete.

- Deferred additional 3D building work at the user's request. The opening
  camera now fits all imported building/area outlines, including both stadium
  outlines. The pan boundary extends east to avoid clipping the stadium.
- Route previews fit their paths with 32 px padding and up to 17.5 zoom,
  including after switching modes or resizing. The 2D camera now uses a
  readable 30-degree tilt; the opening 3D overview uses 40 degrees while
  active turn guidance retains 60 degrees.
- Added tests for mapped-outline coverage, overview re-fit, and preview
  options. Desktop/phone browser screenshots checked the opening view;
  desktop route screenshots checked 3D and 2D endpoint framing and labels.
  Browser console showed no errors or warnings.
- The rectangular basemap still shows some neighboring streets; this is a
  focused campus camera, not a geographical clipping mask. Routes and source
  geometry were not changed.
- Formatting, lint, strict type-check, 87 tests in 18 files, and production
  build pass. The deferred map chunk is about 417.16 kB gzip; the existing
  large-map-bundle concern remains, without new dependencies in this step.

## Step 30: One-time map location control

Status: complete.

- Added **Get your location** to the map. It uses a real one-shot browser
  request regardless of the route-checkpoint simulator setting; it does not
  start or advance navigation.
- A clear reading within the mapped campus-and-stadium rectangle draws a
  separate approximate blue dot and moves the camera closer. A clearly
  outside reading, uncertain edge/accuracy overlap, permission denial, and
  unavailable location receive explicit messages. Repeat requests clear the
  old dot first; late results after unmount are discarded.
- Added tests for inside/outside/uncertain classification, button behavior,
  and adapter dot/camera handling. A real browser with simulated on- and
  off-campus positions showed the expected messages and dot; a phone-width
  layout remained usable, with no console errors or warnings.
- The area is a coarse rectangle, not an official boundary; it includes some
  neighboring streets. No new dependency, continuous tracking, or route-data
  change was introduced.
- The user's revised sequence is: mobile performance check next, then a
  user-guided UI/UX cleanup before any deployment step; deploy the functional
  prototype before the later real-world reliability and realistic-3D phases.
- Formatting, lint, strict type-check, 94 tests in 20 files, production
  build, and Git whitespace check pass. The deferred map bundle remains large
  at about 418.21 kB gzip; Step 31 records its mobile performance baseline.

## Step 31: Mobile performance baseline

Status: production-build measurement and documentation complete locally;
Step 28-30's six pending commits and the Step 31 documentation commit were
pushed to `origin/main` at the user's request.

- Tested the actual Vite production build at a 390 x 844 Chromium viewport.
  Three cold-cache reloads used browser-emulated 150 ms network latency,
  200,000 bytes/s download throughput, and 4x CPU slowdown. This is a
  repeatable desktop emulation, **not** a measurement on a physical phone.
- First contentful paint was 2.428-2.652 s. Local application assets finished
  around 6.8-7.0 s in the two fully recorded repeat runs; the last observed
  OpenStreetMap tile finished around 8.75-9.23 s. There were 13-16 long tasks
  totaling about 3.29-3.69 s per run. Paint measures the early interface, not
  readiness of the map; tile completion is only a network proxy for map
  completion, not a measured map-ready event.
- The build outputs 100.50 kB gzip initial JS, 418.21 kB gzip deferred map JS,
  13.01 kB gzip CSS, and a 508.54 kB uncompressed map worker. On one run the
  browser transferred about 99 kB initial JS, 415 kB map JS, and 145 kB worker.
  The map chunk retains Vite's greater-than-500-kB minified warning.
- The map rendered after scrolling into view. No horizontal overflow or
  browser-console warnings/errors appeared. At initial phone scroll position,
  only the top edge of the map is visible below the tall planner; this is a
  UI/UX review item, not a performance defect fixed in this step.
- No new dependency or bundle reorganization was added. The one-library 3D
  prototype is intentionally retained; mobile cost should be checked on a
  real lower-end phone and prioritized alongside the user's upcoming UI/UX
  review before choosing any targeted optimization or deploying.

## Step 32: Campus-focused UI cleanup

Status: complete.

- Updated the displayed brand to **Yotes Wayfinder**, changed the headline to
  “Find your way on campus,” and removed the explanatory paragraph below it.
- Removed the “Walk the route” heading and the visible demo checkpoint-result
  selector. Prototype navigation still uses simulated expected readings by
  default, so Start navigation and Next Turn remain usable without moving.
  Simplified the simulation guidance to one short notice and retained Back,
  turn instructions, and the Completed / Current leg / Upcoming legend.
- Preserved the **Walking route** summary with origin, destination, duration,
  and distance. On phones, reduced planner spacing and control heights so the
  map begins higher and occupies more of the first viewport. Moved the map note
  above the bottom attribution area.
- `App.tsx` owns the header brand; `index.html` owns the browser tab title and
  description. `NavigationPanel.tsx` connects search, route summary and
  checkpoint guidance; `CheckpointNavigation.tsx` presents route progress,
  while `useCheckpointNavigation.ts` retains state and one-shot check behavior.
  `src/app/styles.css` controls desktop and phone layout.
- Verified the production build in a real browser at 390 x 844 and 1365 x 900.
  The initial mobile view now shows the map beginning above the fold, and a
  previewed route displayed the start/destination and 0.3 km summary. The
  progress legend remained visible after starting simulation; the console had
  no warnings or errors. Formatting, lint, type-check, build, and 19 focused
  navigation tests pass. The existing large map-bundle warning remains.
- Three implementation commits: `55e5ae5`, `f558267`, and `9a3cd78`.
  Documentation commit: `61a5c44`.

## Step 33: Vercel deployment preparation

Status: repository configuration and local verification complete.

- Added root `vercel.json` with the Vite preset, `npm run build`, and `dist`.
  This preserves the existing TypeScript check during Vercel builds and avoids
  manual build/output settings on import. No router rewrite, function, API key,
  or runtime dependency was added.
- Left checkpoint navigation in its existing prototype default. The separate
  one-shot browser location button remains functional over the HTTPS address
  supplied by Vercel. Neither routing data nor map-provider code changed.
- Confirmed `npm run format:check`, `npm run lint`, `npm run typecheck`,
  `npm run test` (20 files, 94 tests), `npm run build`, and `git diff --check`.
  The known large MapView chunk warning remains. This is a local build check,
  not proof of a successful hosted deployment or a physical-phone check.
- Documented the five owner import/test actions in README. The default raster
  tiles still depend on OpenStreetMap's best-effort community service; the app
  remains illustrative and is not ready for relied-on physical navigation.
- The connected Vercel project builds new `main` pushes automatically.

## Step 34: Ownership and source protection

Status: implemented and locally verified.

- Added root `LICENSE` reserving rights in original materials for `jahphetB`,
  the Git author/account identity. Kept ordinary hosted-app use permitted and
  excluded third-party libraries, OSM-derived data, and existing rights.
- Added npm `UNLICENSED` metadata without changing dependency versions.
  Existing `private: true` concerns npm publication, not GitHub visibility.
- Disabled production source maps, added an ownership banner to the app
  bundles, and generated `dist/THIRD_PARTY_LICENSES.md` through Vite's built-in
  license reporting. Added environment-file ignore rules.
- Added `docs/OWNERSHIP.md` covering original-work permissions and separate
  software/data rights. Step 35 condensed it into public-facing terms.
- Formatting, lint, TypeScript, all 94 tests in 20 files, and production build
  pass. Inspected the build: zero `*.map` files, both app bundles contain the
  ownership banner, and the dependency license report contains notices for
  React, React DOM, Scheduler, MapLibre, and Three.js. The existing large-map
  chunk warning remains. No new package or application navigation feature.
- Browser code/data remain downloadable; the notice and build settings do not
  revoke existing copies or rights.

## Step 35: Public documentation and deployment verification

- Condensed the README into features, setup, checks, deployment, architecture,
  and ownership. Preserved the prototype's access and geographic limitations.
- Replaced the ownership tutorial and owner-action list with a concise statement
  of original-work permissions and third-party terms.
- Removed conversational planning from recent explanatory records and retained
  the existing `Wayfinder` title edit in `LICENSE`.
- Local verification: formatting, lint, TypeScript, 94 tests in 20 files,
  and production build pass. No application runtime code changed in this step.
- Live verification at `https://wayfinder-umber.vercel.app/`: Vercel reported
  successful deployment of `9da260f`. The page served the new application
  bundle with its copyright banner, dependency notices returned HTTP 200,
  and the corresponding source-map URL returned HTTP 404.
- Browser checks covered the library-to-Sterry route, 2D/3D switching, Start,
  Next Turn, Back, all seven route steps through arrival, and simulated
  on-campus/off-campus location responses. The map rendered at 1365 x 900
  and 390 x 844; the phone page had no horizontal overflow. The browser
  console reported zero errors or warnings. These checks used simulated GPS,
  not physical navigation or a real-phone performance measurement.
