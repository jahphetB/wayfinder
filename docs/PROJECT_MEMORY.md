# Project state reference

This reference summarizes the current implementation, source data, and
verification record. `docs/ARCHITECTURE.md` is the full handbook;
`docs/PROGRESS.md` records implementation history.

## Current scope: October 22 recovery and accessibility

- The user approved page-failure recovery and search accessibility, superseding
  the earlier hold below. Scope is the first release-hardening package: R01–R03,
  bounded map loading, partial imagery warnings, and focused regression tests.
- Work remains on preview branch `feat/step-39-location-refinement`, PR #2. Main
  and production remain `de7e5e8`. No production promotion is authorized.
- Root and deferred-map error boundaries use explicit reload; reload clears
  route progress. Map-only failure leaves the planner editable. Separate module
  download and initialization deadlines are 20 seconds each in recoverySettings.
- Fatal map events release the adapter and allow retry; partial tile failures
  warn without disabling a ready map. Late callbacks are ignored, WebGL2 remains
  required, and raw provider URLs are not displayed in recovery messages.
- Search now uses direct listbox/options, input-held focus, active-descendant
  references on the actual option, non-tabbable suggestions, and polite result
  announcements. Attribution links are underlined with an OSM copyright link.
- This package does not authorize mobile optimization, tracking, a provider
  subscription, privacy/monitoring integrations, or a pilot/public launch. The
  remaining G01–G12 evidence gates still apply. No new OSM data is required for
  this package; request corrections before route field acceptance.
- Handbook section: `ARCHITECTURE.md#page-failure-recovery-and-accessible-search`.
  Release evidence: `RELEASE_READINESS.md#page-recovery-and-search-accessibility-follow-up`.
- Application commits: `54af495` boundaries, `8ab6c72` lifecycle/warnings,
  `630dfa2` search/attribution, `7bcaab6` mobile retry obstruction,
  `9a86be5` graphics-loss explanation. Full checks pass: 127 tests / 27 files.
- Local browser evidence: aborted module preserves planner, 20.03-second stalled
  module recovery preserves input focus, stalled map retry retains route, 503
  imagery warns, unsupported WebGL2 stays contained, explicit graphics-loss retry
  works. Search has 50 scrollable options at 320/390 px, no document overflow,
  and dialog Escape restores focus. axe 4.14.0 reports no automated violations
  in tested states; incomplete contrast/semantics need manual review.
- Final built hashes: initial `index-CxQlDF54.js`, map `MapView-aJ9NQiYa.js`,
  CSS `index-CXyr3eq7.css`; worker remains `maplibre-gl-worker-DEn6RsMw.js`.

## Historical state after October 21 maintenance

- At that time, the user wanted to wait before deciding on page-failure recovery
  and search accessibility; that hold is superseded by the October 22 approval.
  Movement tracking remains outside the approved recovery/accessibility package.
- Production `de7e5e8` is publicly accessible and passed fresh map/route/dialog/
  phone-width smoke checks with no console errors/warnings. Preview was `61f759c`
  with hosted Quality/Vercel passing before this maintenance; PR #2 remains open.
- Screenshot warning: package.json engines 22.x overrides Vercel dashboard 24.x.
  Node 22 remains supported; build queue, function CPU/region, Fluid Compute,
  disabled login protection and skew/cold-start options are not deployment failures.
  No dashboard settings were changed; public access is intentional.
- Important audit correction: sandbox npm audit returned cached zero findings.
  A network-enabled --prefer-online audit found four dev-tool findings (two high,
  two moderate); production-only audit reported zero. Updated Vite 8.3.0→8.3.5,
  Vitest 5.0.1→5.0.5, source-map-js 1.2.1→1.2.2 through reviewed lockfile changes.
  Fresh full audit now zero. Require live registry access for advisory clearance;
  do not present cached audit output as a current security result.
- Updated tooling passes formatting, lint, TypeScript, 117 tests / 24 files and
  production build. CSS hash unchanged; new JS hashes reflect the bundler update.
- This is targeted preview dependency maintenance. No app source, style or campus
  data changed. Do not merge main/promote production without explicit approval.

- User accepts WebGL2 as the supported production/prototype requirement and wants
  the existing unsupported-browser message retained. VM setup is outside app
  remediation. Release-readiness assessment now takes priority before Step 40.
- Assessed app revision `8132dbc` on preview; production `de7e5e8` still serves
  `index-DVYzLa7U.js`. PR #2 open, checks green, main protections verified. No
  production merge approval was given in the readiness request.
- Full quality gate passes with 117 tests / 24 files; current full npm audit zero
  advisories. Three Lighthouse 12.8.2 mobile runs: LCP 2.164/2.133/4.150 s,
  TBT 1,016/855/688 ms, CLS 0.0019; third run scores 65/96/100. First two category
  selections were malformed by shell comma handling; metrics are present.
- Extra 390×844 probe at 4× CPU/150 ms/204,800 bytes/s: map control-ready proxy
  5.986 s, 10 long tasks (max 890 ms); no physical-device or field percentile claim.
- Release blockers reproduced: aborting MapView chunk blanks the whole page
  (App has Suspense but no error boundary); axe 4.14.0 flags listbox/li/button
  option relationships and color-only attribution link. Attribution also lacks
  an OSM copyright link. WebGL2 failure retains error/planner; simulated permission
  denied/unavailable/timeout recover. Tile 503 shows raw URL and disables controls.
- `docs/RELEASE_READINESS.md` is the acceptance/evidence reference (G01–G12,
  R01–R10); `docs/security_best_practices_report.md` covers missing live browser
  headers and manual dependency monitoring. Hold independent navigation pilot and
  wider launch until gates pass. Current app is suitable for supervised testing.
- Proposed next work: failure containment/accessibility, then measured mobile
  optimization, privacy/monitoring, service/data acceptance, recovery/pilot. This
  sequence is proposed for approval; do not implement tracking or buy providers
  automatically. Request next OSM corrections before pilot route field acceptance,
  after software hardening. Current prototype data can support earlier work.
- Assessment only changes documentation. Raw diagnostics stay ignored under
  output/playwright/readiness-*. No telemetry, dependencies, headers or production
  settings were changed; no load test or rollback performed. Standing preview
  commit/push approval continues; production merge requires explicit approval.

- Before Step 40, a VirtualBox Xubuntu Chrome user reported a purple screen and
  `Map adapter must be initialized before use`. A failed MapLibre construction
  left the adapter reference set; a later mode effect called `setMode` on it.
  `MapView.tsx` now exposes the adapter only after successful initialization,
  releases a failed construction, and retains the map error/retry UI. The focused
  regression test is in `MapView.test.tsx`; local checks pass with 117 tests.
  The initial graphics failure itself remains unverified on that VM. This fix
  belongs to the Step 39 preview branch until a production merge is approved.

- Release procedure: `docs/RELEASE_WORKFLOW.md`; work on feature branches,
  publish previews under standing approval, and merge only with release approval.
  `npm run check` collects the existing quality commands. GitHub Actions reads
  Node.js 22 from `.node-version`; `.github/pull_request_template.md` records
  the tested revision, preview, release approval, and recovery target.
- Production: pull request #1 merged as `de7e5e8`. Hosted Quality and Vercel passed;
  the public production URL serves the new build without login. Browser checks
  passed for building details, route preview, Start/Next/Back, with no console errors.
  Step 39 uses preview branch `feat/step-39-location-refinement`. Main protection
  now requires pull requests, Quality checks and Vercel success, an up-to-date
  branch and resolved conversations, including administrators.
- Standing approval permits preview commits and pushes. Production merges and
  promotions require approval. Announce every environment transition. Approved
  scope includes Step 39 refinement on preview; its production merge is not yet
  approved. Movement tracking remains later work.
- Styling now lives in `src/styles`; `theme.css` owns labeled visual variables,
  while `mapPresentation.ts` owns typed camera settings and map route colors.
  See `docs/STYLING.md`. The old `src/app/styles.css` has been replaced.
- Three selectable footprints: library `603509923`, Sterry `492831879`, and
  Simplot `492831873`. Content is in `src/data/campus/buildingDetails.ts`.
  Simplot's shared footprint opens cafeteria details; residence routing is unchanged.
  Popups have two labeled photo placeholders because no approved photographs are
  in the repository. Supply assets/metadata using `docs/BUILDING_DETAILS.md`.
  No images were scraped, generated as campus photos, or hotlinked.
- Map selection travels through `MapAdapterCallbacks.onBuildingSelect` into
  `MapView` and the native React dialog. Route sessions and GPS are unaffected.
  Approved feature implementation and local browser/build verification are
  complete and released. Vercel authentication protection was disabled by the
  owner; production was verified publicly accessible. The prior release passed 102 tests;
  the compiled preview was tested with simulated browser GPS, not physical GPS.
- Vercel builds select Node.js 22.x via package engines, matching `.node-version`.
  Modal keyboard focus explicitly wraps Tab/Shift+Tab; a regression test covers it.
- Step 39 adds a dedicated RefinedBrowserLocationProvider only for Get your location.
  Default checkpoint simulation and one-shot browser checkpoints are unchanged.
  Best recent reading selection is pure; settings are in locationLookupPolicy.ts.
  Cancellation/progress are optional request controls, with unmount abort and
  late-result guards in MapView. See docs/LOCATION_LOOKUP.md.
- Step 39 local checks pass: 116 tests in 24 files, formatting, lint, TypeScript,
  production build and whitespace. Browser fixtures confirmed progress/refinement,
  cancellation, permission denial, off-campus classification, no startup requests,
  four watches cleared after four requests, and no phone overflow. Physical GPS
  improvement still needs real-device comparison; production merge is pending.
- PR #2: `https://github.com/jahphetB/wayfinder/pull/2`. Hosted Quality and Vercel
  passed implementation revision `efd28ad`. Preview is public:
  `https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app`.
  Browser fixtures on the hosted build verified refinement, cancellation, denial,
  a single-reading deadline fallback, no extra watchers from checkpoint buttons,
  and no console errors/warnings. Production remains `de7e5e8`; merge requires approval.
- Model recommendations must name a specific model and reasoning level. Keep
  public documentation factual; release instructions belong in the contributor
  guide rather than owner-action lists in product/ownership files.

- The outer navigation/map container has square corners on desktop and mobile.
  The introductory simulated-route paragraph is removed; simulated checkpoints
  and their operational status messages remain unchanged.

- The app is an illustrative campus-route prototype that opens with a
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
- Step 31 measured the unchanged production app at a 390 x 844 Chromium
  viewport with emulated 150 ms latency, 200,000 bytes/s download, and 4x CPU
  slowdown. First contentful paint was 2.428-2.652 s across three reloads;
  local assets finished around 6.8-7.0 s and the last observed OSM tile around
  8.75-9.23 s in repeat runs. This is not a real-phone test or measured map-ready
  event. The large 418.21 kB gzip map bundle remains a concern; do not add more
  models or change bundling without a measured, approved reason. Phone layout
  places most of the map below the initial fold; bring that to UI/UX review.
- Step 32 renamed the visible product to **Yotes Wayfinder**, set the heading
  to “Find your way on campus,” and removed the subtitle, “Walk the route”
  heading, and visible demo-result selector. Expected checkpoint results are
  still simulated by default, so the user can preview and step through a route
  without moving. The route summary keeps its origin, destination, duration,
  and distance; the Completed / Current leg / Upcoming legend and Back/Next
  controls remain. Mobile layout now places the map higher on the page.
- Step 33 added root `vercel.json` to pin Vite, `npm run build`, and `dist`.
  No router, backend, route data, map behavior, or location mode changed. The
  repository can be imported into Vercel without adding environment variables.
  The hosted prototype is at `https://wayfinder-umber.vercel.app/`.
  The connected Vercel project publishes `main` pushes automatically.
  OpenStreetMap community tiles remain best-effort; navigation is illustrative.
- Step 34 responds to the owner's request to protect the app. Root `LICENSE`
  reserves rights in original materials using the current Git identity
  `jahphetB`; ordinary hosted-app use and third-party/existing rights remain.
  Package metadata says `UNLICENSED`; no open-source reuse grant was adopted.
  Production source maps are off. Vite adds ownership banners and generates
  `dist/THIRD_PARTY_LICENSES.md`; `.env` patterns are ignored. See
  `docs/OWNERSHIP.md` for ownership scope and third-party terms.
- Step 35 condensed public documentation and removed account advice and
  conversational planning from explanatory files. Public documents describe
  current behavior, setup, architecture, terms, and verification evidence.

## Verification record

The repository checks are `npm run format:check`, `npm run lint`,
`npm run typecheck`, `npm run test`, `npm run build`, and `git diff --check`.
Step 34 passed all 94 tests in 20 files and confirmed that the build contains
no source maps, includes ownership banners, and publishes dependency notices.

The README uses neutral product wording. Detailed architecture, source
provenance, progress, and AI-tool records have dedicated documents. Explanatory
documents omit owner to-do lists, account-management advice, and conversational
planning. The contributor workflow is defined in `AGENTS.md`.

Step 35 passed formatting, lint, TypeScript, the 94 tests, and production build.
Vercel reported deployment success for `9da260f`; the public site served
`index-BTJ4wUCh.js` with the copyright banner and dependency notices, while
the corresponding `.map` URL returned 404. Browser verification covered a
library-to-Sterry route through arrival, Next/Back, 2D/3D, and simulated
on-campus/off-campus readings at desktop/phone viewport sizes. The map
rendered, the phone page had no horizontal overflow, and the console reported
no errors or warnings. This is a browser check using simulated GPS, not a
physical navigation or real-phone performance test.
