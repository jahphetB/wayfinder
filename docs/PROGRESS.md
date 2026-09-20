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
