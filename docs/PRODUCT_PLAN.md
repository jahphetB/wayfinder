# Product definition and release plan

This definition supersedes earlier GPS-gated navigation and live-movement
requirements. Yotes Wayfinder is a minimalist campus guide: accurate route
illustrations, manual walkthrough controls, and separately requested real-location
snapshots. A walkthrough can be completed without physically walking.

## Behavior contract

1. Select Start and Destination, then Preview route.
2. Start navigating begins the illustrated walkthrough immediately and requests
   a real-location snapshot. Location success never controls progression.
3. Next advances the illustrated step and requests another snapshot. Back only
   changes the illustration; it does not request location.
4. Get my location works independently. These three buttons are the only location
   triggers. There is no movement-following feature, automatic turn advancement,
   rerouting, GPS-selected origin, or periodic location request.
5. A bounded temporary browser watcher may improve one requested snapshot. It
   stops on completion, cancellation, timeout, route change or unmount. Requests
   do not overlap; cancelled/stale results cannot update another route.
6. A small light-green circle with a contrasting outline represents the actual
   snapshot, distinct from route endpoints and the illustrated leg. Last checked
   identifies its time. Replacing it does not create a trail or persistent history.
   A failed refresh explicitly identifies any retained older snapshot.
7. Completing the illustration says walkthrough complete, not physical arrival.

## Data and presentation

The current imported geographic dataset is the accepted release-preparation
baseline, not an independently surveyed dataset. Retain provenance, source IDs,
validation and formal/main-footway preferences. Report concrete defects; do not
require another export or comprehensive field survey to finish the software.
Future corrections and 3D data follow import, validation, preview and release
without rewriting routing or UI. No backend, CMS or database is required.

Preserve the layout and presentation. Add the compact footer
**Wayfinder™ · Developed by [Yaphet](https://github.com/jahphetB)**. Camera movement
should be deliberate and smooth, with centralized duration/easing, no animation
queue, reduced-motion support, and no snapshot-induced camera interruption during
the walkthrough. Profile before optimizing; no identical-device-performance claim.

## Ordered implementation and verification

1. Record this contract, replace superseded launch gates, retain the previous
   assessment only as historical evidence.
2. Separate manual walkthrough state from location acquisition; add shared bounded
   snapshots, route-change cancellation and focused regressions.
3. Add snapshot presentation, truthful feedback, privacy information and footer.
4. Profile startup/camera on the existing baseline and revised build. Optimize
   measured costs and duplicate camera/data work; check constrained emulation and
   record physical-device limitations honestly.
5. Verify accessibility, permission failures, network/graphics recovery, security
   headers, dependency advisories, build and a practical release/recovery procedure.
6. Publish the tested preview, identify remaining genuine blockers and a short
   physical-device checklist. Obtain approval before merging/promoting production.

Routine steps in this scope are approved together. Use focused commits and brief
progress reports. No additional tracking, major dependencies, paid services or
external telemetry are authorized. Small directly useful improvements may address
feedback, accessibility, performance and recovery; record their purpose.

## Delivery boundary

Feature-branch pushes are allowed. Main/production require explicit release
approval. A small supported guide rollout needs working essential flows, honest
privacy/data disclosures, recoverable failures, and representative-device checks;
arbitrary uptime percentages, elaborate monitoring and perfect lab scores are not
release prerequisites. Broader adoption is reviewed using actual feedback and
measured service usage, not an automatic expansion promise.
