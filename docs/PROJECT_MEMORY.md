# Project memory and resume checkpoint

This short file is the current checkpoint for interrupted work. Read it with
`AGENTS.md` and `docs/ARCHITECTURE.md`; the latter is the full handbook, while
`docs/PROGRESS.md` is the chronological step record. Update this checkpoint
after each meaningful step, especially when a source or approval state changes.

## Current state after Step 27

- The app is a local, illustrative campus-route prototype that opens with a
  tilted 3D camera over the library toward Sterry Hall, with no building meshes.
  The route fields start empty. It has 50 searchable places and a MapLibre
  display, but walking routes are calculated by project-owned domain code.
- Navigation uses simulated one-shot checkpoints by default so it can be
  tested without moving. `VITE_LOCATION_MODE=browser` enables physical
  location requests for later field testing. It is not on by default.
- Accurate 2D paths are the priority. Building height, walkway width, slope,
  accessibility classification, realistic 3D models, and safe-access claims
  remain deferred or unverified. Do not present routes as official guidance.
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

## Working rules and verification

- One approved step per turn; stop with a two-part completed-step/next-step
  report and ask for approval plus concise/detailed preference. Explain key
  files and newly used technical terms. No unapproved new features.
- Make focused conventional commits after passing relevant checks. Push only
  with explicit approval. Step 26 is pushed; Step 27 approval does not include
  a new push approval.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`, and `git diff --check`. For visual changes, inspect the real
  browser at desktop/phone widths and check the console.
- README must not contain the exact phrase the user previously prohibited;
  keep it neutral and focused on the product. Keep the handbook, diagram,
  progress log, and AI skills inventory synchronized with code changes.

## Next approval boundary

Step 27 is limited to the source-supported court gate and a documented
validation audit. No physical campus observation or permission review has
occurred. After verification and a local commit, stop and ask before the next
step or a push. The likely next step is user-supplied corrections for the
remaining seven court approaches, Hayman classification, and stadium
driveway/parking/venue access. Do not begin 3D building modeling until 2D
work is accepted.
