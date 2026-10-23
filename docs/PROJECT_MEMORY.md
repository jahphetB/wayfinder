# Current project state

## Active approved redesign

- Before merge, the user authorizes a full reference-faithful redesign on preview.
  UI_REFERENCE_CONTRACT.md records the latest correction and overrides older visual
  decisions below (including outside-canvas controls and heading trademark removal).
- Authoritative source: original Wayfinder-Exact-Selected-References.png in Downloads.
  Top Proposal A landing; middle Proposal A editing; bottom desktop layout 4/mobile
  layout 3 navigation. Never use generated replacement boards or copy example data.
- Strict breakpoint: mobile <640 / desktop >=640. Keep the map instance across
  layout changes. Build screenshot comparisons for all six states and 639/640.
- Workflow foundation: guideWorkspace reducer retains the old journey while draft
  fields/replacement preview change; Cancel restores the same route/session object.
  Starting replacement is explicit and resets its session. useCampusGuide composes
  this with the existing synchronous planner, without a new dependency/framework.
- Current phase: foundation implementation/verification before the reference UI.
  No production approval. Preview branch and main/recovery references remain below.

## Product authority and delivery boundary

The October 23 manual-campus-guide definition in [PRODUCT_PLAN.md](PRODUCT_PLAN.md)
supersedes GPS-gated checkpoints, simulation-mode selection and former live-navigation
launch gates. The previous state record is archived in
[history/PROJECT_MEMORY_PRE_GUIDE.md](history/PROJECT_MEMORY_PRE_GUIDE.md);
historical proposals do not override this file.

- Work targets preview branch `feat/step-39-location-refinement`, PR #2.
- Production remains `de7e5e81794661dec2f67ad7856e57055a535453` at
  https://wayfinder-umber.vercel.app/ until an explicitly approved release.
- Preview: https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app/.
- Routine grouped package work and feature-branch commits/pushes are approved.
  Main merge/promotion still requires approval. No production switch has occurred.
- Use tabs, semantic classes/IDs, focused commits and brief progress reports.
  Keep public explanatory documents factual. README uses neutral campus wording.
- No new paid provider, major dependency, backend or telemetry is authorized.

## Implemented behavior

1. Select Start/Destination and Preview route. Start navigating/Next advance the
   manual illustrated session immediately and each request a fresh real snapshot.
   Back changes only the illustration. Get my location independently requests one.
2. No location request on page load, timers, mode changes, Back or between actions.
   The bounded watcher improves a requested snapshot then clears; it is not live
   movement-following. No automatic advancement/reroute/GPS-selected origin.
3. Last checked absolute time and approximate accuracy label the outlined green
   circle. A failed refresh clearly retains the previous point/time. No trail,
   persistence, location-history upload, analytics or remote error collection.
4. One hook aborts the preceding request before replacement and invalidates
   route-stale results. Manual progression never depends on location success,
   physical movement or checkpoint proximity. Completion is not physical arrival.
5. Campus/stadium bounds, route summaries, formal-first routing, colored legs,
   tilted modes, library mesh and three building dialogs remain. Photo slots are
   honest placeholders. The stadium handoff remains separate illustrative driving
   guidance, not car turn-by-turn navigation.

## Key ownership and file connections

- `App.tsx` composes planner, manual session and one shared snapshot hook.
  `RouteWalkthrough.tsx` renders manual actions; `navigationSession.ts` is pure
  progression logic with no location input.
- `useLocationSnapshot.ts` owns request replacement, cancellation, freshness and
  retained-reading UI state. `createLocationProvider.ts` creates only the bounded
  `RefinedBrowserLocationProvider`. `locationLookupPolicy.ts` labels tunable
  12-second/15-second-age/15-metre/two-reading limits.
- Removed obsolete CheckpointNavigation/useCheckpointNavigation, fake-location
  provider/scenario contract, one-shot checkpoint provider and gating tests.
  Route geometry's internal checkpoint field remains a step endpoint, not a GPS gate.
- `LocationSnapshotControl.tsx` displays independent lookup, time and feedback.
  `MapView.tsx` passes explicit focus intent to `MapAdapter.showUserLocation`.
  Snapshot updates do not interrupt an active route camera.
- `MapLibreMapAdapter.ts` stops the previous camera before newer intent, skips
  unchanged worker-source data, and avoids active-walkthrough resize recentering.
  `mapPresentation.ts` centralizes easing, durations and a 2× pixel-ratio cap.
  Reduced-motion behavior remains nonessential motion, honoring MapLibre preferences.
- `SiteFooter.tsx` and `footer.css` provide normal-flow developer credit and
  keyboard-operable privacy disclosure, not an overlay above attribution.
- `vercel.json` owns narrow browser headers. Vite production preview reads the
  same values; dev HMR is not constrained by that production policy.
  `browserSecurity.test.ts` guards the policy. CI adds current high/critical
  advisory checking and weekly schedule (schedule starts only on main).
- `ARCHITECTURE_DIAGRAM.md` shows current data/state/service and release boundaries.

## Source data and future replacement

Current accepted baseline is user-supplied `map (1).osm`, SHA-256
`03B9BD752A588BFF7CB04A87B06D417736E1BFBC49091AFD9EF8452A88C0B40C`.
XML is not fetched at runtime or committed. Import with
`python scripts/import_campus_osm.py path/to/map.osm`, inspect generated
`campusOsmNetwork.json`, source IDs and digest, validate graph and affected routes,
then use the normal preview/release procedure.

Curated destination references live in `collegeOfIdahoWalkingGraphData.ts`;
`buildCampusWalkingGraph.ts` joins the snapshot; the graph loader validates it;
`mockLocations.ts` derives 50 search places. Domain routing minimizes informal
distance first, then weighted distance (main formal paths count at 90% for
selection; displayed metres remain physical). Data, routing, rendering and UI stay
separate. No future export or full campus survey is a blanket software-release gate.

Known inherited limits: inferred entrance/outline connectors, provisional court
numbering/approaches, private-drive stadium handoff, unreviewed access/slope and
illustrative library height. A Hayman parking/basketball tag conflict and duplicate
stadium outlines are documented source ambiguities, not newly verified facts.
No current data has been falsely promoted to surveyed/accessibility-certified.

## Candidate and verification record

### Pre-merge UI refinement

- Approved follow-up: equal-size Back/Next, remove canvas-obstructing app controls,
  use desktop side space better, mobile Back/Next below map, remove optional
  Vercel feedback-script warning without weakening CSP. This does not authorize merge.
- App now places one RouteWalkthrough after the map workspace in DOM order.
  CSS Grid puts planner/walkthrough left and map right on desktop; mobile order
  is planner→map→walkthrough. NavigationPanel owns Start only, next to Preview.
  Manual session/snapshot behavior and data are unchanged.
- MapView owns toolbar, viewport and information areas. Mode/location/status/retry
  controls and expandable building shortcuts are outside the canvas; attribution
  stays on it. Mobile canvas minimum stays 28 rem; desktop is 32 rem, 1800 px
  shell cap, 24-rem planner cap and reduced horizontal padding. Named theme
  settings replace retired map-overlay offsets. Back/Next share equal sizing.
- Full checks pass with 113 tests / 27 files. Added App and MapView regressions.
  Application commit `75f7259`. Browser geometry confirms equal buttons/no canvas
  overlap at 1920/390/320; desktop canvas about 1350 px wide, mobile 448 px tall.
  Graphics retry preserves Step 2, manual Next works during failure, shortcuts/
  dialog work, and two requested watchers are cleared. Three axe scans have zero
  automated violations, with gradient contrast requiring manual review.
  Hosted `2f9c97f` passes Quality/Vercel; actual candidate assets are served.
  A normal fresh-browser check (no CSP bypass/skip-toolbar headers) verifies
  search, preview, manual controls, modes, dialog and denied-refresh retention;
  four requested watchers all clear. No startup location request, console/page
  error, policy violation or vercel.live request. Mobile actions are below canvas,
  equal-size and unobstructive; desktop canvas about 1350 px. Main still de7e5e8.
  RELEASE_READINESS.md and PR #2 record evidence; final docs-only follow-up has
  identical runtime assets and does not authorize production release.
- Preview toolbar was switched Off in Vercel by the owner; a normal HTTP response
  confirms no feedback-script injection. All five security headers match the
  prior candidate exactly. Do not reintroduce skip-toolbar headers for the final
  ordinary-visitor verification. No vercel.json/security-policy change is needed.
- Still preview only; commit/push standing approval applies. Stop before main merge.

### Earlier manual-guide candidate history

Candidate version remains `0.1.0-rc.1`; exact source commits distinguish preview
revisions. Source changes through `16b29a8` included:
`1f9730d` contract, `6b26a98` tabs-only, `7ab3a8d` manual guide/snapshots,
`f9fd134` measured camera/source changes, `16b29a8` tested headers/audits/version.
`191819e` adds the small map-mode semantic group correction from axe review.

Local full checks: 111 tests / 27 files, strict types, lint, formatting and build.
Network-refreshed full npm audit: zero known findings on October 23.
Browser fixtures under enforced CSP: zero on-load requests, valid two-reading
refinement to 6 m, immediate Start/Next while pending, Back makes none, denied
refresh retains older reading, completion is truthful, route edit cancels;
10 watches started/10 cleared/zero active. 320/390 widths have no horizontal overflow.
Native privacy disclosure works by keyboard.

Fresh non-bypass context: map works with no normal policy violations; injected
inline script is blocked. Recovery fixtures pass blocked map chunk + reload,
graphics loss + route-preserving retry, tile 503 warning + usable controls, and
clear unsupported-WebGL2 message with usable planner. axe checks use an isolated
tool-only bypass context; they do not weaken deployed policy. Initial/search/
no-results/walkthrough/dialog/privacy scans show no automated violations.
Axe manual-review findings led to the map-mode role fix; gradient/translucent
contrast and assistive-technology behavior require separate human review.

Baseline and revised 4× CPU probes are in `PERFORMANCE.md`. Revised map-ready
proxy 4.772 s, max startup task 746 ms, sampled worst rapid-transition interval
483 ms. Layout/cache differ, so no controlled speedup claim. Emulated animation
remains uneven; physical school computer and phone have not been retested here.
No universal smoothness claim, provider-capacity reservation, hosted rollback
rehearsal or accessibility certification is made.

High-density/reduced-motion browser check: requested 3×, actual canvas ratio 2×;
20 mode switches and manual Next/Back complete with no page errors/overflow.
Gradient/translucent contrast calculations are recorded in release readiness.

Hosted `da42919` passes Quality/Vercel; preview HTTP 200 serves the expected
`index-BpnDDqZL.js` and `MapView-DWqyvSSc.js` with actual security headers.
Fresh hosted manual/snapshot/dialog/footer check: zero page/CSP errors, zero
startup location requests, two watches started/cleared, no 390 px overflow.
Main protection verified: PR + strict Quality/Vercel, admin enforcement on,
force/delete off. Production independently remains de7e5e8/old index-DVYzLa7U.js.
Recovery deployment: https://wayfinder-gd3rcclh7-jahphet.vercel.app/ (Vercel ID
AZmj2JpmTACqdwdBdA8fAj794gw3). No rollback/promotion performed.

Hosted source/status evidence is in `RELEASE_READINESS.md` and PR #2.
Do not infer deployed state from the local version number. Stop before production
merge/promotion; short supported-device review and explicit approval remain.
