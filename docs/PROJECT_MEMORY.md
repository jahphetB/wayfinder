# Project memory and resume checkpoint

This short file is the current checkpoint for interrupted work. Read it with
`AGENTS.md` and `docs/ARCHITECTURE.md`; the latter is the full handbook, while
`docs/PROGRESS.md` is the chronological step record. Update this checkpoint
after each meaningful step, especially when a source or approval state changes.

## Current state after Step 25

- The app is a local, illustrative 2D campus-route prototype with an optional
  tilted 3D camera mode without building meshes. It has 42 searchable places and a
  MapLibre display, but routing is calculated by project-owned domain code.
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
  have distinct described entrances. The default preview is library to Simplot
  cafeteria. Nearby turns can share one explicit instruction and Next action.

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

## Working rules and verification

- One approved step per turn; stop with a two-part completed-step/next-step
  report and ask for approval plus concise/detailed preference. Explain key
  files and newly used technical terms. No unapproved new features.
- Make focused conventional commits after passing relevant checks. Push only
  with explicit approval. The user approved pushing all pending Step 25 work.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`, and `git diff --check`. For visual changes, inspect the real
  browser at desktop/phone widths and check the console.
- README must not contain the exact phrase the user previously prohibited;
  keep it neutral and focused on the product. Keep the handbook, diagram,
  progress log, and AI skills inventory synchronized with code changes.

## Next approval boundary

Step 25 is complete after documentation, quality checks, commits, and the
approved push. Stop and ask before any next implementation step. The likely
next small step is user-guided review of provisional outline approaches,
the Hayman parking classification, the stadium selection, and any 2D routes
the user identifies as wrong. It is a proposal, not authorization. Do not
begin 3D building modeling until 2D work is accepted.
