# Project memory and resume checkpoint

This short file is the current checkpoint for interrupted work. Read it with
`AGENTS.md` and `docs/ARCHITECTURE.md`; the latter is the full handbook, while
`docs/PROGRESS.md` is the chronological step record. Update this checkpoint
after each meaningful step, especially when a source or approval state changes.

## Current state after Step 30

- The app is a local, illustrative campus-route prototype that opens with a
  tilted 3D camera framing mapped campus facilities and stadium. One library mesh
  uses its OSM footprint and an illustrative 8 m height; the former inaccurate
  Hendren block remains removed. 2D hides the mesh without changing routes.
  The route fields start empty. It has 50 searchable places and a MapLibre
  display, but walking routes are calculated by project-owned domain code.
- Navigation uses simulated one-shot checkpoints by default so it can be
  tested without moving. `VITE_LOCATION_MODE=browser` enables physical
  location requests for later field testing. It is not on by default.
- The user is mostly satisfied with current 2D accuracy and will provide
  corrections later. Building height, walkway width, slope, accessibility
  classification, realistic 3D models, and safe-access claims remain deferred
  or unverified. Do not present routes as official guidance.
- Most path geometry comes from the user's observed OSM export. The invented
  Campus Entrance and its long link are removed because there is no fixed
  gate. Off-path entrances and outline-derived destination points have
  illustrative connectors, not access guarantees.
- Anderson uses the resident-used entrance; JAAC activities and swimming pool
  have distinct described entrances. Both locations must be chosen before
  previewing. Start navigation follows Preview route for walking directions.
  Nearby turns can share one explicit instruction and Next action.
- Eight sports courts are searchable and walking-routable: tennis, pickleball,
  basketball, and beach volleyball. Court numbers are provisional OSM-outline
  labels, not official names. Standard volleyball has no distinct tag here.
  Beach Volleyball Court 2 uses its OSM-tagged main gate; the other seven
  courts still use provisional outline approaches. Even the mapped gate has
  an inferred link to the walking network.
  Page purple `#412D5E` is provisional pending a current institutional guide.
- Simplot Stadium is a separate prototype driving handoff from a mapped campus
  driveway to a west-side parking approach. It is not a car route from the
  chosen origin and has no car checkpoints. Both candidate driveways are
  tagged private; permission, turns, parking, and venue entrance need review.

## Current source and replacement flow

- Current source: user-supplied `map (1).osm`, originally in Downloads.
  SHA-256: `03B9BD752A588BFF7CB04A87B06D417736E1BFBC49091AFD9EF8452A88C0B40C`.
  See `docs/OSM_EXPORT_REVIEW.md` for counts, prior snapshot, and gaps.
- Source XML is not committed and is not fetched at runtime. To review a new
  export, preserve it, compare source/digest, then run
  `python scripts/import_campus_osm.py path/to/map.osm`. Review the generated
  `src/data/navigation/campusOsmNetwork.json` diff before committing.
- `src/data/navigation/collegeOfIdahoWalkingGraphData.ts` curates labels and
  referenced OSM building/entrance/POI IDs. `buildCampusWalkingGraph.ts`
  turns imported segments plus those references into graph data.
  `collegeOfIdahoWalkingGraph.ts` validates the release; `mockLocations.ts`
  derives search choices. `walkingRoutes.ts` and `pathfinding.ts` choose a
  path; `routeSteps.ts` creates turns; the map adapter only draws the result.
- Routing minimizes informal distance first, so formal walking ways outrank
  informal shortcuts. Among otherwise comparable formal paths, a described
  main footway counts at 90% of its physical length for selection. Displayed
  metres remain physical length. This is not an access or safety ranking.
- Ten described parking destinations are included. Way `1006303601` says
  Hayman parking but has basketball-pitch tags; confirm that classification.
  Two Simplot Stadium outlines exist; one provisional destination uses
  `327890065`. Confirm it with the user before treating either as verified.
- The same XML digest now imports 11 sport-tagged pitch outlines and five
  selected road ways. `stadiumDrivingHandoff.ts` validates the road chain;
  `routePlanner.ts` returns a distinct handoff state; MapLibre draws a dashed
  layer apart from pedestrian routes. See the source audit's fifth batch.
- The sixth source audit records the court-gate check and official-source
  corroboration. The College's athletics directions support Cleveland then
  24th to Simplot Stadium, not the private campus driveway or a venue door.
  Hayman parking/basketball classification still needs the user's observation.
- `src/data/scene/libraryPrototypeBuilding.ts` derives one visual library
  outline from the existing snapshot. `createMapAdapter.ts` attaches it through
  `MapLibreGeoreferencedBuildingLayer.ts`; no 3D model influences routing.
  Activating Three.js raised the deferred map bundle from about 275.95 to
  417.01 kB gzip. Benchmark before adding more models or photo assets.
- `collegeOfIdahoCampus.ts` now defines separate overview and pan bounds.
  `MapView.tsx` passes them through the adapter contract. MapLibre re-fits
  the overview on resize, fits route previews with a small margin, and gives
  2D a readable 30-degree tilt. A rectangular basemap still reveals nearby
  streets. No additional 3D buildings are planned until the user resumes that
  phase explicitly.
- Step 30 adds a one-time **Get your location** control. It uses a separate
  real browser provider even when route checkpoints are simulated, and never
  advances navigation. A clear mapped-area reading shows an approximate blue
  dot and moves the camera closer; outside/uncertain/failure messages remain
  explicit. `classifyCampusLocation.ts` uses the coarse overview rectangle
  plus GPS accuracy, not a verified property boundary. No continuous tracking
  or server-side location storage was added.

## Working rules and verification

- One approved step per turn; stop with a two-part completed-step/next-step
  report and ask for approval plus concise/detailed preference. Explain key
  files and newly used technical terms. No unapproved new features.
- Make focused conventional commits after passing relevant checks. Push only
  with explicit approval. Step 27's two commits were pushed at the user's
  request. Steps 28-29 have four local, unpushed commits; Step 30 also needs
  separate push approval after its local commits.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`, and `git diff --check`. For visual changes, inspect the real
  browser at desktop/phone widths and check the console.
- README must not contain the exact phrase the user previously prohibited;
  keep it neutral and focused on the product. Keep the handbook, diagram,
  progress log, and AI skills inventory synchronized with code changes.

## Next approval boundary

Step 30 is the user-approved one-time location button before mobile
performance work. Finish checks and local commits, then stop for approval.
The requested sequence is mobile performance baseline, a user-guided UI/UX
cleanup checkpoint, and only then stepwise deployment of the functional
prototype. After successful deployment, revisit real-world reliability;
realistic 3D buildings and further features come later. Do not start
performance, deployment, extra 3D, or a push without the relevant approval.
