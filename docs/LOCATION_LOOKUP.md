# Get your location

The map's Get your location button performs a short, user-triggered lookup. It
requests high-accuracy browser readings and chooses a recent reading with the
smallest reported accuracy radius. It does not continuously follow movement.
Navigation checkpoint buttons retain their existing one-shot/simulation behavior.

## Behavior

1. A click starts one temporary `watchPosition` subscription and shows progress.
2. Valid, recent, distinct readings are collected. Duplicated callbacks do not
   count as additional readings; invalid, stale, and future timestamps are ignored.
3. With at least two distinct recent readings and a best reported accuracy of
   15 metres or less, collection can finish early. Otherwise it uses a 12-second
   collection budget, then returns the best usable reading received.
4. The subscription, timer, and cancellation listener are removed on completion
   or cancellation. Permission denial stops immediately. Temporary unavailable
   errors can recover before the deadline; without a usable reading the lookup
   reports a failure. An existing valid reading can still be used at the deadline.
5. The existing campus-area classifier decides whether to show the approximate
   dot, an off-campus message, or an uncertain result. Only the final result moves
   the camera, avoiding repeated jumps while readings improve.

Cancel location lookup stops the request and makes the button available again.
Leaving the map aborts its request. Late results cannot replace a cancelled or
newer result. No raw readings are logged, saved, or sent to a project server.

Browsers control the number and timing of updates. A stationary browser may only
provide one reading, in which case it is returned at the deadline if still recent.
Browser suspension can delay JavaScript timers; this is not background navigation.
The reported accuracy is the device/browser estimate, not an independently measured
distance from the user's true position. Repeated sampling cannot guarantee a better
physical result. Real-phone testing is still necessary.

## Files and settings

| File                                                                   | Responsibility                                                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `features/navigation/model/locationLookupPolicy.ts`                    | Labeled duration, freshness, target accuracy, and minimum reading-count settings.                           |
| `domain/navigation/locationRefinement.ts`                              | Pure selection function: ignore stale/future fixes, choose the smallest accuracy radius, prefer newer ties. |
| `features/navigation/infrastructure/RefinedBrowserLocationProvider.ts` | Encapsulates the temporary browser subscription, validation, deadline, cancellation, and cleanup.           |
| `features/navigation/contracts/LocationProvider.ts`                    | Shared request shape with optional progress and cancellation controls.                                      |
| `composition/createLocationProvider.ts`                                | Constructs the refined lookup separately from the unchanged checkpoint provider.                            |
| `app/App.tsx`                                                          | Supplies the lookup provider to the map and the checkpoint provider to navigation.                          |
| `features/map/components/MapView.tsx`                                  | Displays progress/cancellation and renders the final campus result through the map adapter.                 |

Paths are relative to `src/`. Tests alongside the selector, provider, and map UI
cover choosing a better fix, duplicate callbacks, deadline fallback, typed errors,
permission failure, cancellation, late callbacks, synchronous browser behavior,
and unmount cleanup. Test timers and simulated browser coordinates are not evidence
of physical campus accuracy.

| Policy                          | Default | Meaning                                             |
| ------------------------------- | ------- | --------------------------------------------------- |
| `maximumWaitMilliseconds`       | 12000   | Collection time budget.                             |
| `maximumReadingAgeMilliseconds` | 15000   | Maximum acceptable reading age when selected.       |
| `targetAccuracyMeters`          | 15      | Reported accuracy target for early completion.      |
| `minimumDistinctReadings`       | 2       | Minimum recent distinct fixes for early completion. |

These defaults are provisional tuning values. Change them together with focused
tests and phone measurements. Do not change checkpoint confirmation radii to tune
this lookup; those rules serve a different purpose.

## Verify a change

Run `npm run check` and `git diff --check`. On the preview, check successful lookup,
slow/single-reading fallback, denied permission, cancellation, and a retry after
cancelling. Verify that route preview and navigation remain usable. On real phones,
compare results at known campus places under different signal conditions and note
the displayed accuracy and waiting time without publishing private coordinates.
Use [the release workflow](RELEASE_WORKFLOW.md) before production merge.

Sources: [watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition),
[clearWatch](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/clearWatch),
and [reported accuracy](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy).
