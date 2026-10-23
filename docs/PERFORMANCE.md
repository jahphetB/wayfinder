# Camera and startup verification

## October 23 guide candidate

These are desktop Chrome diagnostics, not physical school-computer, Android or
iPhone measurements. The initial baseline used preview `9cd4529` before the manual
guide change. CPU throttling was 4×. Network/cache and layout were not controlled
well enough for a causal before/after benchmark; do not derive a speedup percentage.

| Probe                                           | Baseline                      | Revised guide                  |
| ----------------------------------------------- | ----------------------------- | ------------------------------ |
| Map-ready control proxy                         | 4.796 s                       | 4.772 s                        |
| Largest observed startup long task              | 1,293 ms                      | 746 ms                         |
| 4.5-second rapid preview/start/next/mode window | 29 frames, 20 gaps over 50 ms | 36 frames, 23 gaps over 50 ms  |
| Largest sampled frame interval                  | 583 ms                        | 483 ms                         |
| Observed canvas size                            | 650 × 1,150 px                | 745 × 991 px at 1× pixel ratio |

Startup remains heavy and constrained animation remains uneven. These samples
support investigating the reported compatibility problem; they do not establish
smoothness on every device. The map chunk remains approximately 1.59 MB (421 kB
gzip), with the existing Vite size warning. No new model or rendering framework
was added, and geographic data was not changed to improve scores.

## Targeted changes

- New camera intent explicitly stops the previous transition. Repeated actions
  do not enqueue a chain of animations. Location-point updates during a walkthrough
  do not stop or refocus the camera.
- Active walkthrough resize events do not recenter or resend route data. Preview
  resize can still refit the selected endpoints.
- Unchanged route, endpoint and handoff payloads are not resent to the map worker.
  Tests cover semantically identical session updates and camera/source-call counts.
- Pixel ratio is capped at a tunable 2× to reduce GPU fill work on high-DPI screens.
  This does not improve the recorded 1× run; sharpness on actual phones needs review.
- `mapPresentation.ts` labels preview (1,500 ms), step (1,300 ms), mode (1,000 ms)
  and independent locate (900 ms) durations plus smoothstep easing. Easing controls
  how progress accelerates/decelerates; it does not repair missed frames.
- MapLibre's nonessential camera animation honors reduced-motion preferences.
  No essential-motion override is used.

## Repeatable checks

Record exact candidate, viewport, pixel ratio, browser, CPU/network profile and
whether the cache is warm. Sample startup separately from a settled map's camera
motion. Check controls and request cleanup during repeated Next/Back/mode actions,
not only a score. Inspect the frame trace and long tasks before further optimization.
Test a school computer and phones before asserting physical-device performance.
Do not load-test public map services or treat emulation as real-device evidence.

Reference: [MapLibre camera options](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/AnimationOptions/)
and [map options](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/).
