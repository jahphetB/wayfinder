# Selected-reference UI verification

## Scope

The original combined board is authoritative: Proposal A landing/editing,
layout 4 desktop navigation and layout 3 mobile navigation. Generated replacement
boards are excluded. The [reference contract](UI_REFERENCE_CONTRACT.md) defines
the selected states; [styling](STYLING.md) identifies their implementation files.

The interface uses actual campus data, not the board's invented geography,
example distances or sample instructions. Walking completion describes the
illustration, not a confirmed physical arrival.

## Implementation

- One persistent MapView; one shared snapshot owner; one Back/Next action pair.
- A pure workspace reducer separates saved journeys from editable drafts.
  Cancel restores the same journey after invalid input or replacement preview.
  Starting a replacement explicitly begins its first step.
- Desktop timeline, mobile instruction card, integrated planning/editing panels,
  pictured trademark treatment and state-specific feedback positions.
- Exact mobile width range below 640 CSS pixels. Range syntax avoids a fractional
  width gap: a scaled browser can report a 639.2-pixel viewport.
- Keyboard-accessible search/menu/dialogs and focusable scrolling instructions.
  Enlarged text uses rem sizes; short screens allow necessary vertical scrolling.
- Flat north-up 2D, optional 3D, real route bounds, measured overlay padding,
  native attribution/scale and code-drawn endpoint pins.

UI composition, pure state logic, geographic data and provider integration remain
separate responsibilities. No UI framework, production simulation provider,
tracking, telemetry or routing service was introduced.

## Automated and browser checks

The local quality command covers formatting, lint, strict types, **123 tests in
29 files**, and a production build. Focused additions cover draft restoration,
replacement starts, compound instructions, camera insets/zoom, map-size
synchronization and snapshot independence.

The production-build browser matrix covers 320, 375, 639, 640, 768 and 1440 pixels.
Every size retained the same canvas and current step, with no horizontal overflow
and equal Back/Next widths. Mobile actions are below the map; its location feedback
and instruction overlays follow the original selected layout.

Diagnostic location fixtures verify no startup/preview/edit/Back acquisition,
immediate manual progression through denied/unavailable/off-campus/low-accuracy
results, retained older snapshots, truthful completion and full watcher cleanup.
One complete run started and cleared 10 requested watchers with none left active.
Fixtures use current timestamps and are injected only by browser automation;
the application's provider remains the real browser location service.

Graphics-loss recovery retained the journey: Step 2 advanced to Step 3 while
the map was unavailable, and retry restored Step 3. Privacy closes with Escape.
Long names, 320×420 short screens, 812×375 landscape, 200% text on mobile/640-pixel
desktop, and keyboard search were exercised without horizontal clipping.
Keyboard-open conditions were approximated using a reduced viewport; this is not
a physical mobile-keyboard test.

Eight isolated axe scans (landing, search, preview, desktop/mobile navigation,
editing, building details and privacy) report zero automated WCAG-tagged
violations after the timeline focus fix. Contrast over gradients/map imagery and
one link-in-text case remain manual-review items. Tool-only axe injection used
an isolated CSP-bypass context; ordinary application/security verification did not.
These results are not accessibility certification or assistive-technology testing.

## Performance evidence and limits

A local Chromium probe at 390×844, requested 3× pixel density and 4× CPU slowdown
observed a map-ready proxy around 4.55 seconds, a maximum startup long task of
1.16 seconds and click-to-next-frame probes of 0.63–0.90 seconds. Actual canvas
pixel ratio remained capped at 2. There were no page exceptions in that probe.
These diagnostic timings include automation overhead and are not field INP or
a controlled comparison with earlier measurements.

The MapLibre/Three.js map chunk remains about 420 kB gzip, plus the separate
worker. Constrained emulation is visibly uneven; universal smoothness, device
memory usage or broad mobile readiness is not established by this redesign.
No dependency splitting experiment is claimed.

## Security and dependency evidence

The security policy and provider allowlist are unchanged. Newly refreshed
advisories affected development-only transitive dependencies: jsdom's undici and
the hooks linter's Zod. Compatible locked updates to undici 7.30.1 and Zod 4.6.7
resolve the known audit findings without changing package.json.
Sources: [Undici advisory](https://github.com/advisories/GHSA-4qv8-2p9j-2685)
and [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
An audit is time-specific, not a guarantee that no vulnerability exists.

## Comparison artifacts

Local browser artifacts are generated under output/playwright/ and intentionally
excluded from the source repository:

- selected-reference-comparison.html: browsable six-state comparison.
- comparison-{landing,editing,navigation}-{desktop,mobile}.png: six paired
  original-versus-implementation screenshots.
- selected-{landing,editing,navigation}-{desktop,mobile}.png: application-only
  screenshots; selected-navigation-639.png and selected-navigation-640.png
  capture the exact boundary.
- selected-stress-* and selected-long-name-mobile.png: constrained layouts.

The original raster is unmodified; comparison pages crop it for display only,
excluding presentation labels, device frame and OS chrome.

## Remaining visual differences

The live OSM raster's palette, labels, native scale, road geometry and building
shapes differ from the stylized board. Real names can wrap differently; actual
routes have different distances, turns and step counts. Typography uses the
configured system-font stack rather than an unavailable reference font file.
Fluid heights and short/enlarged-text scrolling intentionally vary with viewport.
These are not hidden substitutions of the superseded generated boards.

## Deployment boundary

This redesign is a preview candidate. A successful preview build does not authorize
a merge or production promotion. Exact source/deployment evidence is maintained in
[release readiness](RELEASE_READINESS.md); production remains a separate reviewed
release.

Application source 69b3725 passes Quality and Vercel. The hosted ordinary-browser
matrix/fixture reproduces the local six-width result: one persistent map, 10/10
requested watchers cleared, no page/console errors, camera warnings or CSP
violations. The full matrix used source 7551202; the final 69b3725 changes only
menu/dialog focus restoration and its regression test, with a focused hosted
check confirming the fix. Its runtime assets are index-BKBrT51a.js and
MapView-uWNcT4va.js; the visual arrangement is unchanged.
