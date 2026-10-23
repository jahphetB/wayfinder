# Campus guide release readiness

The target is the [manual campus guide](PRODUCT_PLAN.md), not GPS-verified live
navigation. The [previous assessment](history/RELEASE_READINESS_PRE_GUIDE.md)
is historical; its former G01–G12 gates are retired.

## Candidate and deployment record

- Candidate: **0.1.0-rc.1**, revised application source **`75f7259`**.
- Preview branch: `feat/step-39-location-refinement`; [pull request #2](https://github.com/jahphetB/wayfinder/pull/2).
- [Preview](https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app/)
  is published; hosted verification is recorded below.
- [Production](https://wayfinder-umber.vercel.app/) remains
  **`de7e5e81794661dec2f67ad7856e57055a535453`**. It is the prior production
  source/deployment reference, not the new guide candidate.
- Local candidate assets: `index-c_h3i-oI.js`, `MapView-X0X1_6k8.js`.
  Commit/deployment IDs, not the version label alone, identify reviewed builds.
- Production merge/promotion is not authorized by publishing this candidate.

## Pre-merge layout and toolbar verification

The approved UI refinement retains manual/snapshot behavior and the same security
policy. Full local checks pass with **113 tests / 27 files**, including two new
regressions for the shared walkthrough and outside-canvas controls.

Browser geometry checks at 1920, 390 and 320 px confirm equal Back/Next dimensions,
no horizontal overflow and no app buttons intersecting the canvas. At 1920 px the
map is about 1350 px wide; mobile canvas height remains 448 px. Desktop instructions
stay beside the map; mobile instruction/control coordinates are below its bottom.
Building shortcuts/dialog work outside the canvas. Browser fixtures make no
startup location requests and clear both requested watchers. Graphics-loss recovery
keeps the manual Step 2 state; Next remains usable while the map is failed.

Three additional axe scans (initial toolbar, expanded shortcuts, building dialog)
report zero automated violations; gradient contrast remains a manual-review item.
Actual phone/school-device performance is still separate from emulation.

Vercel Preview toolbar injection is disabled. An ordinary public HTTP response
contains no feedback-script injection, with **all five security headers exactly
matching the previous candidate**. No skip-toolbar request header or weakened CSP
is used for the revised candidate's final hosted verification.

Hosted source **`2f9c97fafaa7973183067588862ed46e714eeb47`** passes
[Quality checks](https://github.com/jahphetB/wayfinder/actions/runs/40010136597/job/120608088698)
and [Vercel](https://vercel.com/jahphet/wayfinder/J6NX96gBv2Q2LNoxwLxmFSvGmF88).
An ordinary fresh-browser session, without CSP bypass or toolbar-suppression
headers, serves the revised assets and verifies search, preview, Start/Next/Back,
view modes, building dialog and retained-snapshot feedback after denial.
Both actions have equal dimensions; mobile actions are below the canvas, whose
height remains 448 px. The desktop canvas is about 1350 px wide. No horizontal
overflow, page errors, console errors, policy violations or `vercel.live` requests
were observed. Four requested temporary watchers were all cleared; no startup
location request occurred. These location readings were browser fixtures, not
new physical GPS measurements.

Main independently remains `de7e5e8`; no production promotion occurred. A final
documentation-only follow-up records this evidence without changing runtime
assets. Its latest hosted status is recorded in PR #2.

## Essential acceptance checks and evidence

October 23, 2026; Chromium desktop automation and emulation unless stated otherwise.

| Requirement                            | Evidence and result                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual progression, including failures | Browser library→cafeteria walkthrough advances immediately through six steps with location pending; Back works and makes no request; completion explicitly does not confirm physical arrival. Domain/App regressions pass.                                                                                                                                                 |
| Only three snapshot triggers           | Zero requests on load/preview/Back. Get my location, Start navigating and Next request snapshots. Route edit cancels; 10 temporary watchers started, 10 cleared, zero active. Hook tests reject late/route-stale results and prevent overlap.                                                                                                                              |
| Honest snapshot feedback               | Two distinct fixture fixes refine to 6 m; Last checked time/accuracy visible. Denied refresh retains a clearly labeled older snapshot. Unit tests cover stale/off-campus/uncertain/error/cancel paths. Fixtures are not physical GPS evidence.                                                                                                                             |
| Map and page recovery                  | Blocked map module leaves planner editable; explicit reload restores map. Graphics loss + retry preserves route. Fixture tile 503 yields imagery warning and usable mode controls. Missing WebGL2 shows a clear message, not a page crash. Prior deadline regressions remain passing.                                                                                      |
| Search and accessibility               | Keyboard-held input focus and direct option ownership verified; open/full/no-results states work. axe WCAG-tagged scans show zero automated violations in initial/search/no-results/walkthrough/dialog/privacy states. Manual-review finding fixed with named map-mode group. No conformance certification claimed.                                                        |
| Narrow layout and footer               | Reviewed 320/390 screenshots; no horizontal overflow. Credit/privacy are in normal document flow, not over map attribution. Native privacy keyboard toggle works.                                                                                                                                                                                                          |
| Camera and constrained rendering       | Explicit previous-animation cancellation, no queued app camera intents, no active-walkthrough resize reset, unchanged-source suppression, snapshot focus isolation. Centralized deliberate durations/easing. Actual 3× density emulation renders at configured 2× cap; reduced-motion preference detected; 20 mode changes + manual controls complete without page errors. |
| Browser protections                    | Same header source used by Vercel and local production preview. Fresh enforced-policy context loads map with no normal policy violations and blocks injected inline script. No inline/eval script allowance; geolocation remains self-only.                                                                                                                                |
| Dependency and build quality           | Full checks pass: 113 tests / 27 files, formatting, lint, strict TypeScript and production build. Fresh network-refreshed full audit: zero known findings. CI audit added; weekly schedule takes effect only after main merge.                                                                                                                                             |
| Data provenance and truthful limits    | Existing geographic baseline/digest retained, no semantic graph changes. Inferred connectors, access and stadium handoff remain explicitly limited. A new export/full survey is not a blanket gate.                                                                                                                                                                        |
| Release/recovery procedure             | [Workflow](RELEASE_WORKFLOW.md) records feature/preview/main approval, version/source identity, known-good production reference, live smoke check and rollback/revert procedure. No hosted rollback rehearsal is claimed.                                                                                                                                                  |

### Accessibility review limits

Axe cannot automatically resolve text contrast over gradients/map canvas. Conservative
sRGB calculations give white text on the brightest page gradient **7.09:1**, header
accent **4.92:1**, toggle text on an 88% white overlay over black **6.19:1**, and
brand text on that overlay **9.03:1**. These support the current styles, but do not
certify arbitrary map-label contrast or screen-reader behavior. Recheck if theme
colors/transparency change. Audit injection uses a separate tool-only CSP-bypass
context; actual policy enforcement is checked independently without bypass.

## Remaining genuine limitations

- The school-computer camera issue is mitigated, not proved resolved. Revised
  4× CPU emulation still has uneven frames (largest sampled rapid-transition gap
  483 ms). [PERFORMANCE.md](PERFORMANCE.md) contains before/revised results and
  explains why they are not a controlled percentage improvement.
- No new physical-phone, physical school-computer or manual screen-reader test was
  performed by automation. These are short supported-device review items, not a
  demand for another campus survey.
- The deferred map still contains MapLibre/Three.js: about 421.23 kB gzip plus the
  508.21 kB uncompressed worker. Startup/graphics cost remains material. The build
  warning is not hidden or claimed solved by longer animation duration.
- Community tiles are best effort, with no reserved capacity or service guarantee.
  No load test or paid-provider change is authorized. Broader promotion needs
  observed traffic, terms and cost review; a new backend is not automatically needed.
- No remote error service, analytics, location-history collection, physical-arrival
  verification, certified-accessibility routing or realistic campus-wide 3D assets.
  These are not misrepresented as implemented.
- A known concrete dangerous route/access defect must be corrected or excluded;
  baseline acceptance does not turn inferred access into verified permission.

## Short physical-device review

Use the preview on one supported real phone and the affected school computer:

1. Open fresh; verify map/control readability and no automatic location prompt.
2. Preview library→cafeteria or Sterry; Start, several Next presses, Back, 2D/3D.
   Check camera responsiveness, including rapid actions and reduced motion.
3. Allow location, then deny/revoke it; verify Last checked updates or truthful
   failure/retained-reading feedback while manual steps still work.
4. Complete without walking; confirm no physical-arrival claim. Check search,
   building dialog, privacy/footer and attribution with keyboard/screen reader.

Record device/browser, source revision and any concrete failure. Do not publish
precise personal location readings.

## Rollout decision

The candidate is prepared for preview review and a small supported guide rollout,
subject to the supported-device review and explicit production approval. There is
no claim of unrestricted public-launch readiness on every device. Start with an
invited group, an available maintainer and direct feedback. Stop/correct a release
for broken essential controls, misleading location, concrete dangerous routing,
privacy leakage or unrecoverable supported-device failures.

Arbitrary uptime percentages, perfect lab scores and elaborate monitoring are not
small-trial prerequisites. Before wider promotion, review observed user/device
issues, service usage/terms and costs, then adapt proportionately.

## Hosted candidate evidence

### Initial manual-guide candidate history

The following record predates the pre-merge UI refinement; it is not evidence that
the old runtime assets are the latest candidate.

Preview source **`da4291939a907806f086525eccfe8b990b8458e6`** passed hosted
**Quality checks** and **Vercel**. [Deployment record](https://vercel.com/jahphet/wayfinder/FgV9ekvjtff6As7Lwhi4UQNEm3MK).
The public preview returned HTTP 200 without authentication and served the exact
candidate index/map/worker assets, all HTTP 200. The expected CSP, MIME, framing,
referrer and Permissions Policy headers were present.

Fresh hosted browser checks at 390 px verified keyboard search, library→cafeteria
preview, Start/Next/Back, 2D/3D, snapshot refinement/cleanup, building dialog open/
close, correct credit/profile link and no horizontal overflow. There were zero
page errors or normal CSP violations; two requested watchers were both cleared.
The Vercel feedback toolbar was suppressed only for the app test request.

Production was independently rechecked: HTTP 200, old `index-DVYzLa7U.js`, main
still `de7e5e8`. Known-good recovery deployment:
[wayfinder-gd3rcclh7-jahphet.vercel.app](https://wayfinder-gd3rcclh7-jahphet.vercel.app/)
([Vercel record](https://vercel.com/jahphet/wayfinder/AZmj2JpmTACqdwdBdA8fAj794gw3)).
No production rollback or promotion occurred.

Main protection was checked: pull request required, strict up-to-date **Quality
checks** and **Vercel** required, admin enforcement on, force push/deletion off.
The initial documentation-only follow-up did not change those runtime assets.
The later UI refinement intentionally has new assets; its latest hosted status
and smoke result are recorded separately in PR #2 and this document.
