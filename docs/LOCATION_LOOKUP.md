# Button-requested location snapshots

Yotes Wayfinder is a manual route walkthrough. Location never confirms a turn,
blocks progress or selects the starting point. Get my location, Start navigating
and Next are the only acquisition triggers. Back, page load, timers and ordinary
map interaction never request location. No movement-following feature is planned.

## One bounded lookup

A button starts one temporary high-accuracy browser watcher. Two distinct recent
readings and a best reported accuracy of 15 metres or better allow early
completion; otherwise the 12-second deadline returns the best usable recent
reading, including a coarse reading with clear feedback. Future, invalid and
older-than-15-second readings are rejected. Device accuracy is an estimate, not
proof of physical precision. A watcher improving one requested snapshot is not
ongoing movement tracking.

The provider clears its watcher, timer, listener and temporary candidates on
completion, cancellation or timeout. The shared snapshot hook aborts an older
request before a newer button action starts one. Route edits/re-preview and
unmount cancel pending work; request IDs ignore late callbacks. Repeated Next
presses advance the illustration immediately and replace pending lookup work,
never enqueue it.

## What the user sees

The real snapshot is a small light-green circle with a dark outline, separate
from the illustrated route legs/endpoints. Last checked displays its absolute
local date/time with a machine-readable timestamp. There is no trail or automatic
refresh. Coarse, uncertain-area and off-campus readings have explicit feedback.
An off-campus point does not move the campus map beyond its bounds.

A failed refresh keeps the previous snapshot and identifies it as older.
Permission denial, timeout, unavailable location and unsupported/insecure contexts
do not disable walkthrough controls. The map is gently focused for an independent
lookup only when a walkthrough is not active; Start/Next marker updates never
take over the walkthrough camera.

## Files and privacy

- `app/App.tsx` owns the shared provider/hook and independent manual actions.
- `domain/navigation/navigationSession.ts` advances/backs the illustration without
  accepting a location reading.
- `features/navigation/hooks/useLocationSnapshot.ts` owns request scoping,
  cancellation, retained snapshots and feedback.
- `RefinedBrowserLocationProvider.ts` encapsulates bounded browser acquisition.
- `LocationSnapshotControl.tsx` presents the button, timestamp and messages.
- `MapView.tsx` paints the snapshot through `MapAdapter.ts`; camera focus is explicit.
- `locationLookupPolicy.ts` labels the provisional duration/accuracy settings.

Paths are relative to `src/`. Only the current reading remains in tab memory;
there is no location-history persistence or upload to a project backend. Hosting
and tile providers still receive ordinary requests. The footer explains this.

Tests cover manual independence, cancellation/replacement, route-stale callbacks,
freshness, retained snapshots, provider cleanup and map focus separation. Real
phone accuracy and background timer suspension must not be inferred from test
coordinates. Browser suspension can delay execution; this is not background navigation.

Sources: [watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition),
[clearWatch](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/clearWatch).
