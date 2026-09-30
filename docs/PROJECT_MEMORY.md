# Project memory and resume checkpoint

This short file is the current checkpoint for interrupted work. Read it with
`AGENTS.md` and `docs/ARCHITECTURE.md`; the latter is the full handbook, while
`docs/PROGRESS.md` is the chronological step record. Update this checkpoint
after each meaningful step, especially when a source or approval state changes.

## Current state after Step 24

- The app is a local, illustrative 2D campus-route prototype with an optional
  experimental 3D calibration object. It has 21 searchable places and a
  MapLibre display, but routing is calculated by project-owned domain code.
- Navigation uses simulated one-shot checkpoints by default so it can be
  tested without moving. `VITE_LOCATION_MODE=browser` enables physical
  location requests for later field testing. It is not on by default.
- Accurate 2D paths are the priority. Building height, walkway width, slope,
  accessibility classification, realistic 3D models, and safe-access claims
  remain deferred or unverified. Do not present routes as official guidance.
- Most path geometry comes from the user's observed OSM export. The Campus
  Entrance has a longer illustrative straight connector; off-path entrances
  have short illustrative connectors. These are not mapped access guarantees.

## Current source and replacement flow

- Current source: user-supplied `map_moreinfo.osm`, originally in Downloads.
  SHA-256: `8B0EC753640275B3177D2C2514862B41EB7EB78228E870C16BED58C0276A2FEE`.
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
- Formal walking ways are preferred in close comparisons. Informal ways get
  a 12% route-selection cost penalty; displayed metres remain physical length.
  This is not an accessibility, legality, or safety ranking.

## Working rules and verification

- One approved step per turn; stop with a two-part completed-step/next-step
  report and ask for approval plus concise/detailed preference. Explain key
  files and newly used technical terms. No unapproved new features.
- Make focused conventional commits after passing relevant checks. Push only
  with explicit approval. The user approved pushing all pending Step 24 work.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`, and `git diff --check`. For visual changes, inspect the real
  browser at desktop/phone widths and check the console.
- README must not contain the exact phrase the user previously prohibited;
  keep it neutral and focused on the product. Keep the handbook, diagram,
  progress log, and AI skills inventory synchronized with code changes.

## Next approval boundary

Step 24 is complete after documentation, quality checks, commits, and the
approved push. Stop and ask before any next implementation step. The likely
next small step is user-guided visual correction of 2D paths and entrances,
using screenshots or OSM edits supplied by the user; it is a proposal, not
authorization. Do not begin 3D building modeling until 2D work is accepted.
