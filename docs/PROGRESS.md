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
- Added focused tests, project documentation, and a local Git workflow. No remote has been configured or pushed.

## Step 3: Navigation interface

Status: complete

- Built responsive start and destination inputs, mock autocomplete suggestions, a swap control, and a route-preview action.
- Kept selection and route matching in a dedicated hook and model rather than UI components.
- Added a visual map placeholder; the real MapLibre map remains intentionally deferred to Step 4.
- Verified formatting, type-checking, linting, tests, and the production build.

## Step 4: Interactive map

Status: complete

- Replaced the visual placeholder with a lazy-loaded MapLibre map.
- Added provider-contained GeoJSON route and location layers, route camera fitting, and a 2D/3D perspective control.
- Lifted route-planner state to the application composition layer so the navigation panel and map share one source of truth.
- Verified formatting, type-checking, linting, tests, and the production build.
- Adjusted mobile behavior so previewing a route scrolls the interactive map into view.
- Configured MapLibre's Vite worker URL so the map renderer loads in development and production.
- Excluded MapLibre from Vite dependency pre-bundling to prevent stale worker-path errors during local development.
- Fixed the invisible-map cause found through browser inspection: MapLibre's vendor CSS overrode the absolutely positioned host and collapsed it to zero height. Vendor CSS now loads before application CSS, and the map host has an explicit full width and height.
- Replaced the low-detail MapLibre demonstration style with the official OpenStreetMap raster-style pattern so the prototype shows recognizable streets at campus zoom levels. A hosted style can still be injected through `VITE_MAP_STYLE_URL`.

## Architecture handbook milestone

Status: complete

- Added a living architecture handbook for technical and non-technical readers.
- Documented every current project-controlled folder and file, system data flow, safe change recipes, troubleshooting paths, terminology, engineering principles, and accepted architectural decisions.
- Updated the project working agreement so future architectural changes keep the handbook synchronized with the implementation.

## Step 5: Application states and polish

Status: complete

- Added explicit empty, invalid-location, unavailable-route, and route-ready outcomes to route planning.
- Added keyboard autocomplete behavior with arrow-key navigation, Enter selection, Escape dismissal, and accessible combobox/listbox state.
- Added map loading and retryable map-error states through adapter lifecycle callbacks rather than silently leaving a blank map panel.
- Added focused route-outcome, keyboard-interaction, and map-lifecycle tests.
- Documented Step 5 in `docs/ARCHITECTURE.md` under implementation step guides.

## Step 6: Testing, bundling, and delivery

Status: complete

- Focused the prototype on The College of Idaho with campus-named locations, campus-sized map bounds, and illustrative route geometry.
- Kept campus configuration separate from route and location data so its scope can change without modifying MapLibre infrastructure or navigation UI.
- Removed the unused pre-MapLibre map placeholder.
- Added campus-configuration and map-bound tests, then verified formatting, linting, strict TypeScript, tests, and the production build.
- Reviewed the production output: MapLibre remains isolated in the existing lazy-loaded map chunk, so no extra splitting is justified at this prototype stage.
- Documented the delivery decision and College of Idaho boundary in the architecture handbook.

## Step 7: Routing foundation

Status: complete

- Added immutable, validated walking-graph types for nodes, edges, and paths.
- Added a pure Dijkstra shortest-path function with no React or MapLibre dependency.
- Added a small College of Idaho prototype graph that remains separate from the visible route-preview interface until campus paths are verified.
- Added factory, algorithm, and campus-graph tests for validation, shortest path selection, reverse travel, and unavailable paths.
- Updated the project agreement, README, AI skills inventory, and architecture handbook with the new routing boundary and data-verification requirements.
