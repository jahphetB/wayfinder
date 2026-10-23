# Release readiness assessment

Assessment date: October 18, 2026, America/Denver. Browser evidence was collected
on October 19 UTC. Assessed application revision: `8132dbc`.

**Decision: hold an independent navigation pilot and wider public launch.**
The prototype can continue supervised usability testing. Release checks pass,
but failure recovery, accessibility, measured mobile responsiveness, operational
monitoring, and field validation have gaps. A publicly reachable URL is not a
release-readiness approval. This assessment does not certify WCAG or security
conformance.

October 21 maintenance follow-up: a network-refreshed audit found development-tool
advisories that the earlier cached audit did not expose. Targeted Vite/Vitest and
source-map-js updates clear the refreshed audit on preview; see the
[security follow-up](security_best_practices_report.md#october-21-dependency-follow-up).
The historical browser measurements below are not a re-test of this maintenance
build, and the other release gates remain open.

October 22 recovery/accessibility follow-up: the first remediation package now
contains map-download/rendering failures and corrects the reproduced search and
attribution defects on preview. See the [new evidence](#page-recovery-and-search-accessibility-follow-up);
the original findings below remain a historical baseline, not a description of
the corrected preview. Production promotion and broader launch remain separate.

## Contents

- [Page recovery and search accessibility follow-up](#page-recovery-and-search-accessibility-follow-up)
- [Scope and standards](#scope-and-standards)
- [Evidence and limitations](#evidence-and-limitations)
- [Findings](#findings)
- [Pilot and public release gates](#pilot-and-public-release-gates)
- [Mobile measurement procedure](#mobile-measurement-procedure)
- [Permission and failure matrix](#permission-and-failure-matrix)
- [Privacy and diagnostics](#privacy-and-diagnostics)
- [Map service capacity and costs](#map-service-capacity-and-costs)
- [Route and campus-data acceptance](#route-and-campus-data-acceptance)
- [Release recovery and rollout](#release-recovery-and-rollout)
- [Release evidence record](#release-evidence-record)
- [Remediation sequence](#remediation-sequence)
- [References](#references)

## Page recovery and search accessibility follow-up

Date: October 22, 2026, America/Denver. Scope: R01–R03 and bounded map loading /
partial imagery behavior. Tests use a local production build and a Chromium
browser, not a physical phone or screen reader. No map-service load test occurred.

Tested application source: `9a86be5` on preview branch
`feat/step-39-location-refinement` (PR #2). No production promotion was performed.

| Check                                               | Observed result                                                                                                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aborted deferred map download                       | Recovery message and reload action appear; planner remains editable. Selecting the library still works. No uncaught page exception.                                              |
| Explicit reload after removing the injected failure | Map opens again; fields reset as the recovery message states.                                                                                                                    |
| Stalled deferred map download                       | Recovery appears about 20.03 seconds after the loading status; focus stays in the planner input.                                                                                 |
| Stalled map initialization                          | Loading ends with a retryable error. A selected library-to-Sterry route remains available and is displayed after retry.                                                          |
| WebGL2 unavailable                                  | Clear graphics requirement and retry action; planner stays visible, with no uncaught page exception.                                                                             |
| All imagery requests return HTTP 503                | Partial-imagery warning appears, and ready map controls remain usable. Retry after restoring the requests clears the warning.                                                    |
| Keyboard search                                     | Focus stays on the input; the active-descendant ID identifies the actual selected option. Enter selects, Escape closes, Tab leaves, and no-match searches announce their result. |
| Route regression                                    | Library-to-Sterry preview, Start, Next, Back and a 2D mode change work.                                                                                                          |
| Attribution                                         | OpenStreetMap copyright link is present and underlined, with visible keyboard focus.                                                                                             |

Additional checks: all 50 options remain scrollable at 320 and 390 pixels, and
the active option scrolls into view without document horizontal overflow. The
library dialog opens by keyboard and returns focus on Escape. A simulated
WebGL context loss using the browser's `WEBGL_lose_context` extension produces
the interruption message and a pointer-reachable retry; retry rebuilds the map
and retains the selected route. MapLibre emits an expected custom-layer warning
during this deliberate graphics-loss test; no uncaught page exception occurred.

axe-core 4.14.0 using WCAG 2 A/AA, 2.1 AA and 2.2 AA tags reports **zero
automated violations** in the initial screen, open search, no-results search,
active navigation, library dialog and failed-module fallback states. Some checks are marked
incomplete, including contrast over rendered map content and generated map
semantics; these are not automatic passes. This is regression evidence, not a
WCAG conformance claim. Manual screen-reader and physical-device checks remain
required by G04/G05.

The automated suite has 127 passing tests across 27 files; formatting, lint,
strict TypeScript and production build pass. The map module remains about
1.59 MB uncompressed, and Vite still reports the existing large-chunk warning.
The mobile startup and field-performance gates have not been requalified.

These changes introduce no telemetry, location persistence or additional runtime
dependency. Boundaries cannot recover an entry JavaScript file that never runs.
Map retries preserve planner state, whereas a full-page reload intentionally
resets it. The module and initialization phases each have a separate 20-second
deadline. Keep independent pilot and public launch on hold for the other gates.

## Scope and standards

A **pilot** means an invitation-only, supported trial with 25–50 participants,
a named maintainer, and a defined set of reviewed walking routes. A **wider
launch** means general promotion to campus students and visitors. A supervised
prototype demonstration can use simulated checkpoints; an independent navigation
pilot must make the selected navigation mode clear and validate its real behavior.

The supported graphics requirement is WebGL2, the browser graphics system used by
MapLibre 6 in both map modes. An unsupported browser must show the existing
explanation and preserve the planning interface. A second map renderer is outside
this release scope. Browsers that claim WebGL2 support can still lose their
graphics context; that failure also needs recovery testing.

The review uses these references:

- WCAG 2.2 Level AA: accessible names, keyboard operation, focus, contrast,
  reflow, status messages, and target sizes. ARIA gives assistive technology the
  meaning of custom controls; its combobox pattern applies to place search.
- Core Web Vitals: Largest Contentful Paint (LCP, visible main-content loading),
  Interaction to Next Paint (INP, response to interaction), and Cumulative Layout
  Shift (CLS, unexpected movement). These measure different aspects of experience.
- Applicable OWASP ASVS and frontend security guidance: input handling,
  browser protections, dependencies, and data exposure. Server authentication and
  database controls are not applicable to this static, account-free application.
- Service reliability practice: define service level indicators (measurements),
  service level objectives (targets), recovery procedures, and an error budget
  (the amount of failure allowed before expansion pauses).

Numbers below are **project acceptance criteria**, except where an external
standard is explicitly named. They are not guarantees supplied by a hosting
company or universal industry requirements. An unmeasured gate is not passed.

## Evidence and limitations

### Revision and environment

- Local source and public preview: `8132dbc`, branch
  `feat/step-39-location-refinement`, pull request #2.
- Preview: <https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app/>.
- Production: `de7e5e8`, <https://wayfinder-umber.vercel.app/>. The HTTP response
  still served `index-DVYzLa7U.js`; preview served `index-Bga2aBUL.js` and
  `MapView-C4z6GDRL.js`. The assessment has not promoted preview to production.
- Windows host; Node 22.13.0, npm 10.9.2; Chrome 154. Browser viewport tests are
  simulations on a computer, not measurements from an Android or iOS phone.
- Preview includes Vercel's feedback script. Its three observed session-storage
  keys belonged to that tool; project source contains no Web Storage calls.
  Production HTML did not include the feedback script. Preview tooling can affect
  lab results, so the final production candidate needs a matching measurement.

### Automated checks and mobile measurements

`npm run check` passed formatting, lint, TypeScript, 117 tests across 24 files,
and the production build. `npm audit --json` returned zero known vulnerabilities
for this lockfile on the assessment date. This does not identify the vulnerability
reported by the VM's earlier install, whose audit details were not supplied.
GitHub Quality checks and Vercel were successful for `8132dbc`.

Three Lighthouse 12.8.2 mobile runs used its simulated 4× CPU slowdown and
approximately 1.6 Mbps network profile. Results varied:

| Metric                        | Run 1    | Run 2   | Run 3   | Interpretation                                                    |
| ----------------------------- | -------- | ------- | ------- | ----------------------------------------------------------------- |
| LCP                           | 2.164 s  | 2.133 s | 4.150 s | Median 2.164 s; one run exceeds 2.5 s. No field percentile claim. |
| Total Blocking Time           | 1,016 ms | 855 ms  | 688 ms  | All exceed the proposed 200 ms lab budget.                        |
| CLS                           | 0.0019   | 0.0019  | 0.0019  | Low layout movement in these initial-load samples.                |
| Estimated time to interactive | 5.555 s  | 5.441 s | 5.416 s | A diagnostic; not a field INP measurement.                        |

Total Blocking Time (TBT) estimates how long startup tasks can delay input.
Lighthouse navigation audits do not measure field INP. Only run 3 produced
category scores because a shell argument formatting issue affected category
selection in the first two runs; their individual audit metrics were present.
Run 3 scored **65 performance, 96 accessibility, 100 best practices**. Scores
are diagnostic summaries and do not override individual failing gates.
Public source maps remain intentionally disabled; a diagnostic suggestion to
publish them is not a requirement to expose them. Private reporting artifacts
can be evaluated separately if an error-reporting provider is approved.

One additional browser probe used a 390×844 viewport, 4× CPU slowdown, 150 ms
latency, and 204,800 bytes/s download throughput. The enabled map-mode control
was observed at **5.986 s**. This is a proxy for the adapter's ready callback,
not proof that every map pixel is complete. It recorded 10 long tasks, the
longest 890 ms, and about 14.2 MB of JavaScript heap at that instant. The heap
figure excludes other processes, workers, GPU memory, and textures; it is not
a device memory budget or a memory-leak test.

The built map module is 1,590 kB uncompressed / 421 kB gzip; the initial module
is 339 kB / 101 kB gzip, and the worker is 508 kB uncompressed. Lighthouse run 3
attributed about 1.72 s of main-thread work to the map module. These results
justify profiling startup and the 3D library before adding more models.

Lighthouse JSON and the inspected phone screenshot are local diagnostic
artifacts under `output/playwright/readiness-*`, excluded from Git. This report
preserves their meaningful results. A formal release record must retain its own
artifacts in the release/CI evidence store.

### Browser checks

- Library → Sterry preview, Start, Next, and Back worked at phone width.
- No document horizontal overflow at 390 px or 320 px. The popup's Tab cycle
  stayed within its controls and scrollable description; Escape restored focus.
- Simulated unsupported WebGL2 showed the requested message with the route
  planner still visible and no uncaught page exception.
- Simulated denied permission, unavailable location, and timeout displayed
  distinct explanations and re-enabled the lookup button.
- Simulated tile HTTP 503 produced an error/retry message without an uncaught
  page exception, but disabled all map controls.
- Aborting the deferred `MapView` module download produced an uncaught dynamic
  import error and **an empty page**. This is a release blocker.
- axe-core 4.14.0 found the search-popup relationship and attribution-link issues
  described below. Automated scans also left contrast checks needing manual review.

No physical phone, screen reader, sustained low-memory session, load test,
production rollback drill, or systematic campus walk was performed in this
assessment. Prior owner field observations are useful input but do not replace
a versioned test record. Only ordinary page/view interactions were sent to OSM;
failure requests were intercepted locally. Do not load-test community tile servers.

## Findings

Priorities describe release impact: P0 requires an immediate stop for dangerous
guidance, privacy exposure, or widespread failure; P1 blocks the pilot; P2 blocks
expansion or needs explicitly recorded pilot mitigation. They are separate from
security severity, which is documented in the [security review](security_best_practices_report.md).

| ID  | Priority                                     | Evidence                                                                                                                                                                             | Required outcome                                                                                                                 |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| R01 | P1                                           | `App.tsx:11,50` has a deferred import and Suspense but no error boundary; an aborted map download blanked the page.                                                                  | Contain import/render failure, preserve planner, offer a tested recovery path, and test a stale tab after a deployment.          |
| R02 | P1                                           | `NavigationPanel.tsx:79,111–120`: active descendant points at an untyped `li`; `role=option` is on its nested button. axe reports required-parent/children and list-item violations. | Correct the combobox/listbox/option structure and focus model; verify announcements with screen readers.                         |
| R03 | P1                                           | Attribution link fails the distinction-from-text check. `createMapAdapter.ts:18` supplies plain OSM credit without a data-licence link.                                              | Distinguishable, keyboard-visible attribution links and an accessible OSM copyright/licence destination.                         |
| R04 | P1                                           | Startup TBT 688–1,016 ms; one LCP sample 4.15 s; observed map-ready proxy 5.99 s.                                                                                                    | Meet mobile budgets on the candidate and real phones; profile before optimizing.                                                 |
| R05 | P1                                           | No app error boundary, reporting adapter, runtime event aggregation, or uptime evidence found. Vercel build status cannot detect a client crash.                                     | Sanitized release-tagged diagnostics, an alert test, support contact, and end-to-end health evidence.                            |
| R06 | P1                                           | Current defaults still simulate checkpoints; imported route provenance is illustrative; access and inferred connectors are unverified.                                               | Select and clearly communicate pilot mode, validate every pilot route and connector, and prevent unsafe or unsupported guidance. |
| R07 | P1                                           | Browser headers lack CSP, framing protection, nosniff, explicit referrer policy, and permissions policy. No accessible privacy explanation in the app.                               | Tested browser protections and an accurate privacy explanation before participation. See security review.                        |
| R08 | P2 for controlled pilot; P1 for wider launch | Default tiles use OSM's community service; paid capacity, quota alerts, budget, and provider agreement are unverified.                                                               | Pilot terms and traffic limits recorded; provision a service plan and budgets before wider promotion.                            |
| R09 | P1                                           | Pull-request protections verified, but no measured recovery drill or named release version; package is `0.0.0`.                                                                      | Practice recovery, identify release/config/data versions, and retain a working rollback target.                                  |
| R10 | P1 evidence gap                              | Only desktop Chrome emulation tested here; no iOS/Android, screen-reader, hidden-tab/resume, context-loss or memory-soak evidence.                                                   | Complete the device and failure matrix below.                                                                                    |

Tile failures are currently all surfaced as map errors (`MapLibreMapAdapter.ts:122`
and `MapView.tsx:85`). A single tile failure should be distinguished from a fatal
style/graphics failure. `MapView.tsx:251` displays the raw provider error, including
its URL. Future provider keys in query strings must not be copied into user
messages, support screenshots, or diagnostic events. No private key exposure was
identified in the current configuration.

## Pilot and public release gates

Every required row needs a tested revision, result, and evidence link. “Pending”
and “not measured” block the corresponding release. Do not average away a failed
gate with a good Lighthouse score or a large test count.

| Gate                                 | Small campus pilot acceptance                                                                                                                                                                                                                                                                            | Wider public launch acceptance                                                                                                                                                                                 | Current assessment                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| G01 Build and dependencies           | All quality checks pass on the exact deployed revision; zero untriaged high/critical advisories or exposed secrets.                                                                                                                                                                                      | Same, plus automated scheduled dependency checks and named response ownership.                                                                                                                                 | Local/hosted checks and current audit pass; continuing monitoring pending.                    |
| G02 Mobile performance               | At least 5 documented candidate lab runs: median LCP ≤2.5 s, TBT ≤200 ms, CLS ≤0.1, map ready ≤5 s; repeat on a budget Android and iPhone. No main-thread task >500 ms during normal route interactions.                                                                                                 | Field LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75 separately for mobile/desktop; map-ready p95 ≤8 s on the defined mobile profile.                                                                                | Fails TBT; real-device/field evidence absent.                                                 |
| G03 Transfer and sustained use       | Initial app JS ≤150 KiB gzip and initial app+map+worker+CSS ≤800 KiB compressed excluding tiles; 20 route/mode/popup cycles without crash, accumulating watches, or >20% retained heap growth after GC compared with a warmed baseline. Record GPU/OS limits on phones.                                  | Same regression budgets, ≥30-minute physical-phone walk without browser reload, lost state, or sustained thermal slowdown.                                                                                     | Initial JS fits; complete transfer/memory/device gates unverified.                            |
| G04 Accessibility                    | Zero unresolved automated WCAG A/AA violations on empty/search/preview/navigation/dialog/error states; keyboard-only complete journey; manual contrast, focus, 200% text and 320 CSS px reflow checks. Minimum WCAG target size 24×24 CSS px or permitted spacing; prefer 44×44 for main touch controls. | WCAG 2.2 AA review including VoiceOver/Safari, TalkBack/Chrome, and desktop NVDA; accessible route instructions equivalent to essential map meaning.                                                           | Search semantics and link distinction fail. Partial keyboard/reflow pass.                     |
| G05 Location and permission          | 100% of failure scenarios below give actionable feedback, preserve route state and never advance on a failed/uncertain reading. Lookup ends by its 12 s policy plus ≤1 s scheduling allowance in a foreground test and stops every watcher.                                                              | Same on every supported browser and after OS permission changes, background/resume, and poor reception.                                                                                                        | Unit/fixture coverage strong; physical/OS lifecycle incomplete.                               |
| G06 Route correctness                | All designated pilot segments and entrances checked in both directions within 30 days; zero dangerous crossings, prohibited access, or connectors through buildings/barriers. At least 20 recorded physical journeys, ≥95% completed without maintainer rescue, zero safety-critical mistakes.           | Every advertised walking destination and its connectors reviewed; automated valid-pair invariants; ≥100 journeys over ≥14 days with ≥98% completion without rescue and zero unresolved safety-critical errors. | Existing data/test geometry supports a prototype; formal field evidence pending.              |
| G07 Privacy and security             | Accessible location/privacy explanation; no GPS/request bodies/precise route history in logs or telemetry; browser headers validated; review account access and hosting terms.                                                                                                                           | Same plus verified retention/deletion/access controls for every reporting vendor and documented security incident response.                                                                                    | GPS stays in app memory by source inspection; disclosure, header and reporting gates pending. |
| G08 Error reporting and availability | Injected client crash, map-load failure, and uptime failure reach the maintainer within 10 min without location leakage; ≥99.5% successful supported-browser critical flows over ≥7 days and ≥200 attempts.                                                                                              | ≥99.9% over 30 days and ≥1,000 attempts, no major supported-browser segment below target; ≥99.9% sessions free of fatal app errors. Alert within 5 min.                                                        | No collection or duration evidence.                                                           |
| G09 Recovery                         | Recover a deliberately faulty rehearsal deployment within 15 min, preserve known good target and source fix path; rehearse without interrupting real users.                                                                                                                                              | Recovery within 10 min; release-tagged evidence, backup responder, and provider/config recovery reviewed.                                                                                                      | Procedure/protection pass; timed exercise pending.                                            |
| G10 Service capacity and cost        | Named provider/plan, permitted use, usage and budget reviewed; pilot ≤50 participants and a proposed 150,000-unit tile budget over 14 days, alerts at 50/80/100% of budget/quota.                                                                                                                        | Provider-approved forecast ≥2× expected peak; hosting/tile/error-event budget and abuse/key restrictions verified. Controlled first-party burst test reaches 2× forecast without breaking G02/G08.             | Public tile service has no reserved capacity; account/plan controls unverified.               |
| G11 Browser and failure support      | Current and previous major iOS Safari and Android Chrome, current desktop Chrome/Edge/Firefox; real iPhone + budget Android pass essential flow. Unsupported WebGL2 retains message and planner.                                                                                                         | Same plus audience-relevant browsers; error rates segmented by browser/device, documented unsupported cases.                                                                                                   | Chrome/WebGL2 failure pass; matrix incomplete.                                                |
| G12 Release and support              | Approved exact candidate, named version/data digest, working support/reporting channel, owner available during trial, no unresolved P0/P1.                                                                                                                                                               | All wider gates pass, release approval, staged cohorts and monitored recovery window.                                                                                                                          | Release remains on hold.                                                                      |

p75 means 75% of measured experiences meet the threshold; p95 means 95% meet it.
Pilot sample minima are practical trial gates, not statistically strong proof of
long-term reliability. The field targets use a sufficiently populated rolling
window; if data is insufficient, report it and continue limited rollout.

For G08, a **critical flow** succeeds when the planner loads, the map renders,
valid place selection produces the expected route, and navigation controls work.
It must include real map availability, not just HTTP 200 for `index.html`.
Expected permission denial with working feedback is not a fatal application
error. Unsupported-WebGL2 visits are tracked separately; a crash on those visits
still counts as a failure of graceful handling. Include failures caused by map
vendors in user-experience availability. Exclude only documented maintenance,
test injections, and clearly defined unsupported cases; never silently remove
bad samples. Prefer a small set of useful metrics, as described by Google's
[service level objective guidance](https://sre.google/sre-book/service-level-objectives/).

## Mobile measurement procedure

1. Record candidate commit, immutable deployment URL, browser/OS/device versions,
   charging/power mode, network profile, navigation mode, and provider style.
2. Run five initial-load audits with the same profile, no extensions or preview
   toolbar where possible. Keep raw runs and ranges, not only the best score.
3. Measure both shell content and an explicit map-ready/rendered milestone.
   LCP often measures the heading rather than the map. Record initial requests
   and transferred bytes using network logs; cross-origin Resource Timing can
   hide tile sizes, so a zero value is not proof of a free/cached request.
4. On real phones, exercise search with a long list, both map modes, route
   preview, Start/Next/Back, popup slides, and location cancellation. Test touch
   panning, zoom, rotation, orientation change, soft keyboard and resumed tabs.
5. Record response time to actual interactions; laboratory TBT cannot substitute
   for field INP. Profile long tasks and map initialization before splitting code
   or simplifying assets. Preserve the approved default 3D presentation.
6. Perform the sustained-use test and compare warmed retained memory. JavaScript
   heap alone omits GPU resources; watch device memory, thermal behavior and
   browser tab eviction. A browser crash fails even if heap growth looks small.
7. Recheck the exact production candidate after any optimization and compare
   affected behavior. Retain a privacy-reviewed set of aggregate field metrics
   during the pilot to decide whether expansion is justified.

Example diagnostic command (Chrome path varies by machine):

```powershell
npx --yes lighthouse@12.8.2 "PREVIEW_URL" --chrome-path="CHROME_PATH" --chrome-flags="--headless --no-first-run" --output=json --output-path=output/playwright/release-audit.json
```

This pins the assessment tool version, adds no app dependency, and does not turn
the audit into a release approval. Re-evaluate tool versions when repeating the
assessment. Never run a traffic generator against the community tile service.

## Permission and failure matrix

| Scenario                                           | Required behavior                                                                                                                | Evidence now                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Initial visit / ordinary route preview             | No location prompt or watcher before explicit request.                                                                           | Provider tests and prior Step 39 fixtures; source confirms on-demand start. |
| Permission denied                                  | Explain site settings; finish request; retry possible; route unchanged.                                                          | Current hosted fixture passes.                                              |
| Unavailable / timeout                              | Distinct explanation; bounded wait; no automatic checkpoint advancement.                                                         | Hosted fixtures pass; checkpoint failure tests pass.                        |
| Cancel / unmount / duplicate callback              | Stop watcher and timer; ignore late data; allow another request.                                                                 | Focused provider/MapView tests pass.                                        |
| Stale/future/invalid/coarse reading                | Reject invalid data, identify uncertainty, never claim precision absent from reading.                                            | Domain/provider tests pass; coarse fix may still display as approximate.    |
| Unsupported geolocation / HTTP                     | Explain limitation; preserve manual route preview.                                                                               | Provider unit tests; full browser matrix pending.                           |
| Permission revoked after success / OS location off | Current dot must not imply live tracking; new request reports failure; route retained.                                           | Physical OS/browser test pending.                                           |
| Background, locked phone, resume                   | No misleading stale live position; bounded request settles or is cancelled appropriately on resume.                              | Pending; background browsers can suspend timers.                            |
| WebGL2 unavailable                                 | Requested explanation and retry; planning interface survives.                                                                    | Current hosted injection and owner VM screenshot pass.                      |
| Graphics context lost/restored                     | Inform user or recover; no stuck/blank page, duplicate layers, or resources.                                                     | Not tested; release evidence required.                                      |
| Map module blocked / stale after deployment        | Planner remains usable with a recovery action.                                                                                   | Fails: entire page becomes empty.                                           |
| Tiles/style/worker unavailable, 403/429/5xx        | Separate partial and fatal failure; bounded loading; sensible retry without an automatic request loop.                           | Tile 503 message works; full classification/timeout/recovery pending.       |
| Offline / network restored                         | Explain unavailable map without claiming offline navigation; preserve loaded route when possible and recover after reconnection. | No offline capability claimed; recovery matrix pending.                     |

Location accuracy is an estimate from the device, not a measured distance to a
surveyed position. No release gate promises every user a 15 m fix. The current
lookup returns the best recent reading by 12 s even if coarse. Physical tests
must record success, coarse/uncertain rates, latency, and checkpoint false
acceptances/rejections. No false checkpoint confirmation is acceptable in the
controlled wrong-location test set; adjust the provisional 20 m policy using
field evidence, rather than silently widening it until tests appear successful.

## Privacy and diagnostics

The current app calculates routes locally and stores a displayed location in
browser memory. The refined provider discards its candidate readings after the
request. Source inspection found no GPS upload, persistent location storage,
application analytics, account system, or reporting endpoint. This is a useful
starting point, not a complete privacy notice.

Vercel receives hosting requests. The tile service receives the user's IP,
requested geographic tiles, browser metadata and referrer according to browser
policy. Following the location camera can reveal the viewed approximate area to
the tile provider even though the app does not upload a GPS object. The browser
or operating system may also use its own location service. A privacy explanation
must distinguish these participants and link their current policies.

For diagnostics, use a small typed reporting boundary rather than calls scattered
through UI and map code. A service such as Sentry can be evaluated for client
errors; UptimeRobot or Better Stack can monitor the public page. No account,
SDK, paid plan, or telemetry is enabled by this assessment. Choose a provider
after checking its data handling and costs. The uptime probe alone cannot prove
the interactive map works; add a low-frequency critical-flow check within the
map provider's permitted monitoring terms.

Before activating reporting, test an explicit allowlist: release identifier,
error category, sanitized stack, browser family, and aggregate timing. Strip
coordinates, route endpoints/history, search text, query strings, request bodies,
provider keys, IP/user identifiers where configurable, and DOM breadcrumbs.
Keep session replay off. Test with injected marker coordinates and assert that
neither payloads nor provider-side events contain them. Start with a documented
30-day maximum diagnostic retention and restricted maintainer access, or record
an approved alternative. Verify deletion, volume sampling/rate limits, and
alerts. Expected permission denial should be counted separately from crashes.

The [security review](security_best_practices_report.md) records the browser
header and dependency-monitoring findings. A restrictive `no-referrer` policy
would conflict with current OSM tile requirements; test a policy that preserves
an origin referrer. Browser protections must allow same-origin map workers and
the deliberately selected tile/style origins. Do not weaken script protections
just to silence a console message.

## Map service capacity and costs

The campus geometry and route computation belong to this application. The
basemap still needs a tile service. OSM community tiles provide **no reserved
capacity or availability guarantee**. There is no official “safe number of
users” threshold. Small ordinary interactive use may be appropriate under the
policy; broad promotion requires a deliberate service and budget decision.

| Option                               | Current published starting point                                                   | Suitability and limits                                                                                                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OSM community tiles                  | No service charge; donation-funded limited capacity.                               | Controlled prototype/pilot only with policy review and monitoring. No SLA, bulk prefetch, offline download, or load tests.                                                                     |
| MapTiler Flex                        | USD $30/month; 500,000 API requests included; $0.15 per additional 1,000 requests. | Compatible candidate for existing MapLibre. Third-party MapLibre usage is request-based; do not budget it using SDK session allowances. Custom SLA requires separate terms.                    |
| Stadia Maps Starter                  | USD $20/month; 1,000,000 credits; $0.03 per extra 1,000 credits.                   | Another MapLibre-compatible candidate. Standard raster/vector tile requests are listed at 1 credit; confirm the chosen style, other resources and burst limits. SLA/support terms need review. |
| Owned campus tiles/geometry on a CDN | Hosting, storage, update and maintenance costs vary.                               | Long-term option for the bounded campus, with reproducible data and attribution. Generate from permitted source data, never scrape community tiles.                                            |

Prices were checked on the assessment date, exclude taxes and other products,
and must be confirmed before purchase. Provider style units can differ: for
example MapTiler lists rendered 512 px tiles as four requests. The owned library
mesh does not automatically use a vendor's separately billed photorealistic-3D
service. No geocoding or vendor routing service is needed for current campus
search and route calculation.

For planning, calculate:

```text
monthly map units = map visits × measured billable units per visit
                    × (1 + retry/variation allowance)
```

A **hypothetical**, not measured average of 60 ordinary 256 px billable tiles per
visit gives the following with a 30% allowance:

- 50 participants × 2 visits/day × 14 days × 60 × 1.3 = 109,200 units.
  This fits the proposed 150,000-unit pilot budget, subject to checking the
  selected provider's unit accounting and permitted use. That project budget
  is not an OSM permission threshold or reserved capacity.
- 3,000 users × 2 visits/day × 30 days × 60 × 1.3 = 14,040,000 units/month.
  Under the stated MapTiler request rate that is approximately $2,061/month;
  under a one-credit Stadia unit rate it is approximately $411.20/month.
  These are arithmetic illustrations, not quotes or predictions.

The contrast between these examples is why “thousands of users” is not a
capacity estimate. Reopening, zooming, caching, retina styles, error retries and
events change cost. Measure actual billed units on a representative pilot.
Set usage alerts at 50%, 80% and 100% of the approved allowance and budget, and
record the chosen provider's suspension/overage behavior, rate limits and
key/domain restrictions. A browser key is public; restrictions protect spend,
not secrecy. Never silently switch to another vendor during an outage without
checking privacy, attribution, cost and style behavior.

Vercel delivery is a separate cost. Its public pricing currently starts Pro at
$20/month; Hobby is restricted to personal, non-commercial use. The installed
account's actual plan and eligibility were not inspected. Review whether an
institutional launch fits the selected plan, and add hosting, monitoring,
domain and taxes to the budget. A static CDN and local route computation can
serve a campus audience without adding an application backend solely for scale.

## Route and campus-data acceptance

The current snapshot records its source digest and 50 searchable places. Existing
tests verify library-to-place reachability, endpoints, special entrances, and
formal/main-path preference. The route cost deliberately favors formal paths
before informal distance; it is not an unrestricted shortest-distance promise.

The importer excludes `access=private/no` pedestrian ways, but its condensed
snapshot does not preserve all foot-specific, conditional, seasonal, barrier,
crossing or directional restrictions. Graph construction currently labels imported
edges available/bidirectional with unverified accessibility. A drawn connection
therefore does not prove permission, passability, step-free access, or safety.

Before a navigation pilot:

1. Freeze a candidate data version and list the exact pilot routes/destinations.
2. Apply the owner's next OSM correction export **here, before physical acceptance**.
   Software recovery and performance work can proceed using current data.
3. Review every pilot entrance, inferred connector, crossing and access condition
   on foot in both directions. Record date, source and reviewer. Keep stadium
   driving and unreviewed routes outside independent walking guidance.
4. Validate each supported pair's endpoints, contiguous geometry, positive lengths,
   correct arrival, excluded/restricted links and formal-path preference. Test same
   origin, no-route and invalid-input states. Source hashes and tests detect drift;
   they do not replace observations.
5. Run the physical journey trial in G06. Review route closures and corrections
   through the release process and define how quickly a dangerous route is disabled.

An accessible web interface does not establish wheelchair-accessible paths.
Make no step-free or accessibility routing claim until those data have been
verified. Realistic building models are not a dependency for either release gate.

## Release recovery and rollout

Main protection was checked through GitHub: pull request required, up-to-date
branch, required Quality checks and Vercel status, administrator enforcement,
no force pushes and no branch deletion. PR #2 was open and passing; it had not
been merged. The existing workflow has good source checks but does not run
browser journeys, dependency audits or accessibility scans automatically.

The [release workflow](RELEASE_WORKFLOW.md) remains the source procedure.
Add a dated sign-off using the template below for each functional release.
Before any pilot, rehearse a failed candidate and restore the known good build
on a rehearsal project/domain so real users are not interrupted. Verify the
restored route, location behavior, headers and deployment identity, not just the
dashboard's success label. Record elapsed time and who can repeat the recovery.

Vercel's current documentation allows Hobby rollback to the immediately previous
deployment; Pro/Enterprise can use other eligible deployments previously assigned
to production. A normal preview is not automatically an eligible production
rollback target. A rollback restores a build, not provider accounts or changed
remote settings. Check automatic production-domain assignment after recovery.
Use a corrective pull request for the source; preserve history.

Start with the invited cohort during supported hours. After pilot gates pass,
expand to approximately 100, then 500, then the wider audience, reviewing each
cohort's evidence before the next. Cohorts can be managed through invitation and
communication; a new account system or feature-flag platform is not required.

Stop expansion immediately for unsafe guidance, location-data exposure, a
supported-browser blank screen, or inability to recover. Pause for sustained
critical-flow success below its target, repeated budget alerts, or a new serious
accessibility blocker. Safety/access defects require disabling affected guidance
and reviewing the data; a code rollback alone may restore the same bad path.
Do not force-refresh a tab during a walk. Test an old open tab after deployment,
including a deferred module no longer present on the new deployment.

## Release evidence record

Copy this record into the release pull request or retained release artifact.
An evidence reference must name a tested revision and result, not just a plan.

```text
Release/version:
Candidate commit and immutable deployment URL:
Campus-data source/digest and reviewed route set:
Navigation mode and graphics/browser support:
Previous working production deployment:
G01–G12: pass/fail/pending, evidence link, tester and date:
Real-device/browser/screen-reader versions:
Pilot cohort, duration and critical-flow denominator:
Provider/hosting plans, usage forecast, budget and alerts:
Privacy review and sanitized-event test:
Recovery drill target, operator and measured duration:
Open defects, explicitly limited scope and compensating measures:
Release approval and approved audience:
Production verification and observation window:
```

## Remediation sequence

These are proposed bounded work packages, not changes activated by this review:

1. **Failure containment and accessibility:** address R01–R03, bounded map-loading
   recovery and partial-tile behavior; automate the reproduced regressions.
2. **Mobile startup:** profile map/3D initialization and long tasks, optimize
   demonstrated costs, and repeat G02/G03 with real devices.
3. **Privacy and operations:** browser headers, short user-facing privacy
   explanation, approved sanitized error reporting and uptime alerts; test payloads.
4. **Pilot data and service plan:** apply OSM corrections, review pilot routes,
   decide navigation mode/provider/budget, and run the physical acceptance matrix.
5. **Recovery rehearsal and pilot:** versioned release, timed drill, approval,
   invited cohort and observation. Use the recorded gates before expansion.

Optional continuous movement tracking (previously planned Step 40) changes
permission, battery, privacy and stale-location behavior. It should have its own
review after this hardening work, or an explicit scope decision before inclusion
in the pilot. The current one-time location button can support an initial pilot;
continuous tracking and additional 3D buildings are not automatic prerequisites.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
  [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- [Core Web Vitals thresholds and lab/field distinction](https://web.dev/articles/vitals).
- [OWASP ASVS](https://owasp.org/projects/asvs) and
  [CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).
- [MapLibre v6 migration / WebGL2](https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/).
- [Browser geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API).
- [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) and
  [attribution guidance](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines).
- [MapTiler prices](https://www.maptiler.com/cloud/pricing/) and
  [request/session billing](https://docs.maptiler.com/guides/account/sessions-vs-requests/).
- [Stadia Maps prices and units](https://stadiamaps.com/pricing/).
- [Vercel prices](https://vercel.com/pricing/), [Hobby terms](https://vercel.com/docs/plans/hobby),
  and [rollback eligibility](https://vercel.com/docs/instant-rollback).
- [Service level objectives](https://sre.google/sre-book/service-level-objectives/).
