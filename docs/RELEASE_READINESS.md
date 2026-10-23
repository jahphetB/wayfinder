# Campus guide release readiness

The current target is the [manual campus guide](PRODUCT_PLAN.md), not GPS-verified
live navigation. The previous assessment is retained as [historical evidence](history/RELEASE_READINESS_PRE_GUIDE.md),
with its former launch gates retired.

## Essential acceptance checks

- Manual walkthrough works from Preview route through completion, including Back,
  rapid Next presses and route changes, regardless of location permission/results.
- Only Get my location, Start navigating and Next trigger bounded snapshots.
  Watchers stop; no overlapping requests, stale-route results, trails or persistence.
- Last checked time, location uncertainty and failed-refresh feedback are truthful.
  The actual-location circle is distinct from illustrated route position. Completion
  never claims physical arrival.
- Existing search accessibility/recovery fixes remain working. Keyboard operation,
  narrow screens, readable text, focus, footer and map attribution are checked.
- Map download/style/imagery/graphics failures are bounded and recoverable without
  blocking the independent manual planner. Unsupported WebGL2 has a clear message.
- Profile startup and transitions; address concrete expensive/competing work.
  Check desktop/mobile and constrained emulation, reduced motion and repeated use.
  Physical school-computer/phone confirmation is separate from emulation.
- Privacy disclosure matches button-triggered collection and third-party requests.
  Tested browser protections preserve essential functionality.
- Format, lint, types, tests, dependency review and production build pass on the
  candidate. Advisory findings are triaged, not force-upgraded.
- Current geographic baseline/provenance are retained. A concrete dangerous defect
  is addressed or excluded; a new export/full survey is not a blanket gate.
- Named candidate, tested preview, known-good production and usable recovery
  procedure are recorded. Production merge/promotion requires approval.

## Small supported rollout

Start with a small invited group using the app as a campus guide, with a direct
feedback channel and available maintainer. Explain manual walkthroughs and
last-checked snapshots. Stop or correct a release for broken essential controls,
misleading location, concrete dangerous routing, privacy leakage or unrecoverable
supported-device failures. Arbitrary uptime sample percentages, telemetry
infrastructure and perfect lab scores are not prerequisites for this small trial.

Before broader promotion, review real user/device feedback and measured map usage,
confirm hosting/tile-service terms and cost limits, and adapt capacity accordingly.
Do not load-test OpenStreetMap community servers or claim reserved capacity.

## Candidate evidence

Contract update based on preview `9cd4529`; implementation verification is pending.
Production remains `de7e5e8`. No release approval is implied by these documents.
